import logger from 'loglevel'

import { sharedSyncEngine } from '../../../sync/data/sharedSyncEngine'
import { SyncOperation } from '../../../sync/domain/entities/SyncOperation'
import type { SyncQueueRepository } from '../../../sync/domain/repositories/SyncQueueRepository'
import { SyncEngine } from '../../../sync/domain/services/SyncEngine'
import type { Endereco } from '../../../cliente/domain/entities/Endereco'
import { ApiPedidoDatasource } from '../datasources/ApiPedidoDatasource'
import { LocalPedidoDatasource } from '../datasources/LocalPedidoDatasource'
import type { Pedido } from '../../domain/entities/Pedido'
import type { PedidoTipo } from '../../domain/entities/PedidoTipo'
import type { PedidoRepository } from '../../domain/repositories/PedidoRepository'

export class OfflineFirstPedidoRepository implements PedidoRepository {
    private readonly syncEngine: SyncEngine

    constructor(
        private readonly apiDatasource: ApiPedidoDatasource,
        private readonly localDatasource: LocalPedidoDatasource,
        private readonly syncQueueRepository: SyncQueueRepository,
        syncEngine?: SyncEngine,
    ) {
        this.syncEngine = syncEngine ?? sharedSyncEngine
    }

    async list(type: PedidoTipo): Promise<Pedido[]> {
        const pedidos = await this.localDatasource.getAll(type)
        void this.refreshList(type)
        return pedidos
    }

    async getById(id: number | string, type: PedidoTipo): Promise<Pedido | null> {
        const pedido = await this.localDatasource.getById(id, type)
        if (typeof id === 'string') {
            return pedido
        }

        if (pedido) {
            void this.refreshPedido(id, type)
            return pedido
        }

        void this.refreshPedido(id, type)
        return null
    }

    async save(pedido: Pedido): Promise<Pedido> {
        const now = new Date().toISOString()
        const isNew = pedido.id === null
        const id = isNew ? this.createTemporaryId() : pedido.id

        if (id === null) {
            throw new Error('Could not assign a local id to the pedido.')
        }

        const localPedido = await this.localDatasource.save({
            ...pedido,
            updated_at: now,
            syncStatus: 'pending',
        }, 'pending', id)

        const operation = SyncOperation.fromJson({
            entity: 'pedido',
            entityId: id,
            action: isNew ? 'create' : 'update',
            payload: localPedido,
            createdAt: now,
        })

        try {
            await this.syncQueueRepository.enqueue(operation)
        } catch (error) {
            logger.error(`Unable to queue pedido ${id} for synchronization.`, error)
            await this.localDatasource.save({ ...localPedido, syncStatus: 'error' }, 'error', id)
            throw error
        }

        this.dispatchSync()
        return localPedido
    }

    async delete(id: number | string): Promise<void> {
        const pendingOperations = await this.syncQueueRepository.getPending()
        const pendingCreate = pendingOperations.some((operation) => operation.entity === 'pedido'
            && operation.entityId === id && operation.action === 'create')

        await this.localDatasource.delete(id)

        if (pendingCreate) {
            for (const operation of pendingOperations) {
                if (operation.entity === 'pedido' && operation.entityId === id) {
                    await this.syncQueueRepository.remove(operation.id)
                }
            }
            return
        }

        const createdAt = new Date().toISOString()
        await this.syncQueueRepository.enqueue(SyncOperation.fromJson({
            entity: 'pedido',
            entityId: id,
            action: 'delete',
            payload: { id },
            createdAt,
        }))
        this.dispatchSync()
    }

    async getCustomerAddresses(customerId: number): Promise<Endereco[]> {
        if (!this.isOnline()) {
            return this.localDatasource.getCustomerAddresses(customerId)
        }

        try {
            const addresses = await this.apiDatasource.getCustomerAddresses(customerId)
            await this.localDatasource.saveCustomerAddresses(customerId, addresses)
            return addresses
        } catch (error) {
            const cachedAddresses = await this.localDatasource.getCustomerAddresses(customerId)
            if (cachedAddresses.length > 0) return cachedAddresses
            throw error
        }
    }

    async listCompanies(): Promise<Array<{ id: number; nome: string }>> {
        return this.loadCatalog(
            () => this.apiDatasource.listCompanies(),
            () => this.localDatasource.getCompanies(),
            (items) => this.localDatasource.saveCompanies(items),
        )
    }

    async listPaymentConditions(): Promise<Array<{ id: number; descricao: string }>> {
        return this.loadCatalog(
            () => this.apiDatasource.listPaymentConditions(),
            () => this.localDatasource.getPaymentConditions(),
            (items) => this.localDatasource.savePaymentConditions(items),
        )
    }

    async listPaymentMethods(): Promise<Array<{ id: number; descricao: string }>> {
        return this.loadCatalog(
            () => this.apiDatasource.listPaymentMethods(),
            () => this.localDatasource.getPaymentMethods(),
            (items) => this.localDatasource.savePaymentMethods(items),
        )
    }

    async listCarriers(): Promise<Array<{ id: number; nome: string }>> {
        return this.loadCatalog(
            () => this.apiDatasource.listCarriers(),
            () => this.localDatasource.getCarriers(),
            (items) => this.localDatasource.saveCarriers(items),
        )
    }

    async listPriceTables(): Promise<Array<{ id: number; nome: string; vigencia: string }>> {
        return this.loadCatalog(
            () => this.apiDatasource.listPriceTables(),
            () => this.localDatasource.getPriceTables(),
            (items) => this.localDatasource.savePriceTables(items),
        )
    }

    async listProducts(options?: { busca?: string; limit?: number }): Promise<Array<{
        id: number
        code: string
        description: string
        family: string
        brand: string
        unit: string
        priceTableId: number
        salePrice: number
    }>> {
        const normalizedQuery = options?.busca?.trim().toLocaleLowerCase() ?? ''
        const limit = options?.limit
        const searchLocal = async () => {
            const products = await this.localDatasource.getProducts()
            const matchingProducts = products
                .filter((product) => !normalizedQuery
                    || `${product.code} ${product.description} ${product.family} ${product.brand}`
                        .toLocaleLowerCase().includes(normalizedQuery))
            return typeof limit === 'number' ? matchingProducts.slice(0, limit) : matchingProducts
        }

        if (!this.isOnline()) {
            const products = await searchLocal()
            if (normalizedQuery && products.length === 0) {
                throw new Error('Busca indisponível offline. Conecte-se à internet para consultar novos produtos.')
            }
            return products
        }

        try {
            const products = await this.apiDatasource.listProducts(options)
            await this.localDatasource.saveProducts(products)
            return products
        } catch (error) {
            const products = await searchLocal()
            if (products.length > 0) return products
            throw error
        }
    }

    async finalize(id: number, type: PedidoTipo): Promise<void> {
        await this.apiDatasource.finalize(id, type)
    }

    createDraft(type: PedidoTipo): Pedido {
        return this.apiDatasource.createDraft(type)
    }

    private async refreshList(type: PedidoTipo): Promise<void> {
        if (!this.isOnline()) {
            return
        }

        try {
            const remotePedidos = await this.apiDatasource.list(type)
            for (const remotePedido of remotePedidos) {
                if (remotePedido.id === null) {
                    continue
                }

                const localPedido = await this.localDatasource.getById(remotePedido.id, type)
                if (!localPedido || localPedido.syncStatus === 'synced') {
                    let completePedido = remotePedido
                    try {
                        completePedido = await this.apiDatasource.getById(remotePedido.id, type) ?? remotePedido
                    } catch (error) {
                        logger.warn(`Unable to refresh pedido details ${remotePedido.id} from the API.`, error)
                    }
                    await this.localDatasource.save({
                        ...completePedido,
                        updated_at: remotePedido.updated_at ?? new Date().toISOString(),
                        syncStatus: 'synced',
                    }, 'synced', remotePedido.id)
                }
            }
        } catch (error) {
            logger.warn('Unable to refresh pedidos from the API.', error)
        }
    }

    private async refreshPedido(id: number | string, type: PedidoTipo): Promise<void> {
        if (typeof id === 'string' || !this.isOnline()) {
            return
        }

        try {
            const remotePedido = await this.apiDatasource.getById(id, type)
            if (!remotePedido) {
                return
            }

            const localPedido = await this.localDatasource.getById(id, type)
            if (!localPedido || localPedido.syncStatus === 'synced') {
                await this.localDatasource.save({
                    ...remotePedido,
                    updated_at: remotePedido.updated_at ?? new Date().toISOString(),
                    syncStatus: 'synced',
                }, 'synced', id)
            }
        } catch (error) {
            logger.warn(`Unable to refresh pedido ${id} from the API.`, error)
        }
    }

    private dispatchSync(): void {
        if (!this.isOnline()) {
            return
        }

        void this.syncEngine.processQueue().catch((error: unknown) => {
            logger.error('Unable to process the pedido sync queue.', error)
        })
    }

    private isOnline(): boolean {
        return typeof navigator !== 'undefined' && navigator.onLine
    }

    private async loadCatalog<T>(
        loadRemote: () => Promise<T[]>,
        loadLocal: () => Promise<T[]>,
        saveLocal: (items: T[]) => Promise<void>,
    ): Promise<T[]> {
        if (!this.isOnline()) return loadLocal()

        try {
            const items = await loadRemote()
            await saveLocal(items)
            return items
        } catch (error) {
            const cachedItems = await loadLocal()
            if (cachedItems.length > 0) return cachedItems
            throw error
        }
    }

    private createTemporaryId(): string {
        const randomId = typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto
            ? globalThis.crypto.randomUUID()
            : Math.random().toString(36).slice(2, 10)
        return `temp-${Date.now()}-${randomId}`
    }
}
