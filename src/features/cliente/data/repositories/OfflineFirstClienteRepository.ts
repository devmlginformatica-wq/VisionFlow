import logger from 'loglevel'

import { sharedSyncEngine } from '../../../sync/data/sharedSyncEngine'
import { SyncOperation } from '../../../sync/domain/entities/SyncOperation'
import type { SyncQueueRepository } from '../../../sync/domain/repositories/SyncQueueRepository'
import { SyncEngine } from '../../../sync/domain/services/SyncEngine'
import { LocalClienteDatasource } from '../datasources/LocalClienteDatasource'
import type { Cliente, CnpjLookup } from '../../domain/entities/Cliente'
import type { Endereco, EnderecoInput } from '../../domain/entities/Endereco'
import type { Titulo } from '../../domain/entities/Titulo'
import type { ClienteRepository } from '../../domain/repositories/ClienteRepository'

export class OfflineFirstClienteRepository implements ClienteRepository {
    private readonly syncEngine: SyncEngine

    constructor(
        private readonly apiDatasource: ClienteRepository,
        private readonly localDatasource: LocalClienteDatasource,
        private readonly syncQueueRepository: SyncQueueRepository,
        syncEngine?: SyncEngine,
    ) {
        this.syncEngine = syncEngine ?? sharedSyncEngine
    }

    async list(options?: { busca?: string; limit?: number }): Promise<Cliente[]> {
        const clients = await this.localDatasource.getAll()
        void this.refreshList(options)
        return clients
    }

    async getById(id: number | string): Promise<Cliente | null> {
        const client = await this.localDatasource.getById(id)
        if (client) {
            if (typeof id === 'number') {
                void this.refreshClient(id)
            }
            return client
        }

        if (typeof id === 'number') {
            void this.refreshClient(id)
        }
        return null
    }

    async save(cliente: Cliente): Promise<Cliente> {
        const now = new Date().toISOString()
        const isNew = cliente.id === null && cliente.localId === undefined
        const id = isNew ? this.createTemporaryId() : cliente.localId ?? cliente.id
        if (id === null) {
            throw new Error('Could not assign a local id to the cliente.')
        }

        const localClient = await this.localDatasource.save({
            ...cliente,
            updated_at: now,
            syncStatus: 'pending',
        }, 'pending', id)
        const operation = SyncOperation.fromJson({
            entity: 'cliente',
            entityId: id,
            action: isNew ? 'create' : 'update',
            payload: localClient,
            createdAt: now,
        })

        try {
            const pendingCreate = isNew
                ? undefined
                : (await this.syncQueueRepository.getPending()).find((pendingOperation) =>
                    pendingOperation.entity === 'cliente'
                    && pendingOperation.entityId === id
                    && pendingOperation.action === 'create',
                )
            if (pendingCreate) {
                await this.syncQueueRepository.updatePayload(pendingCreate.id, localClient)
            } else {
                await this.syncQueueRepository.enqueue(operation)
            }
        } catch (error) {
            logger.error(`Unable to queue cliente ${id} for synchronization.`, error)
            await this.localDatasource.save({ ...localClient, syncStatus: 'error' }, 'error', id)
            throw error
        }

        this.dispatchSync()
        return localClient
    }

    async delete(id: number | string): Promise<void> {
        const pendingOperations = await this.syncQueueRepository.getPending()
        const pendingCreate = typeof id === 'string' && id.startsWith('temp-')
            ? pendingOperations.some((operation) => operation.entity === 'cliente'
                && operation.entityId === id && operation.action === 'create')
            : false

        await this.localDatasource.delete(id)
        if (pendingCreate) {
            for (const operation of pendingOperations) {
                if (operation.entity === 'cliente' && operation.entityId === id) {
                    await this.syncQueueRepository.remove(operation.id)
                }
            }
            return
        }

        const createdAt = new Date().toISOString()
        await this.syncQueueRepository.enqueue(SyncOperation.fromJson({
            entity: 'cliente',
            entityId: id,
            action: 'delete',
            payload: { id },
            createdAt,
        }))
        this.dispatchSync()
    }

    async lookupTaxId(taxId: string): Promise<CnpjLookup> {
        const normalizedTaxId = taxId.replace(/\D/g, '')
        if (!this.isOnline()) {
            const cachedLookup = await this.localDatasource.getCnpjLookup(normalizedTaxId)
            if (cachedLookup) return cachedLookup
            throw new Error('Consulta de CNPJ indisponível offline. Conecte-se à internet para consultar este CNPJ.')
        }

        try {
            const lookup = await this.apiDatasource.lookupTaxId(normalizedTaxId)
            await this.localDatasource.saveCnpjLookup(normalizedTaxId, lookup)
            return lookup
        } catch (error) {
            const cachedLookup = await this.localDatasource.getCnpjLookup(normalizedTaxId)
            if (cachedLookup) return cachedLookup
            throw error
        }
    }

    async getAddresses(clientId: number | null): Promise<Endereco[]> {
        if (clientId === null) return []
        if (!this.isOnline()) {
            return this.localDatasource.getAddresses(clientId)
        }

        try {
            const addresses = await this.apiDatasource.getAddresses(clientId)
            await this.localDatasource.saveAddresses(clientId, addresses)
            return addresses
        } catch (error) {
            const cachedAddresses = await this.localDatasource.getAddresses(clientId)
            if (cachedAddresses.length > 0) return cachedAddresses
            throw error
        }
    }

    async saveAddress(clientId: number | null, address: EnderecoInput): Promise<Endereco> {
        const savedAddress = await this.apiDatasource.saveAddress(clientId, address)
        if (clientId !== null) {
            const addresses = await this.localDatasource.getAddresses(clientId)
            const nextAddresses = addresses.some((item) => item.id === savedAddress.id)
                ? addresses.map((item) => item.id === savedAddress.id ? savedAddress : item)
                : [...addresses, savedAddress]
            await this.localDatasource.saveAddresses(clientId, nextAddresses)
        }
        return savedAddress
    }

    async deleteAddress(clientId: number | null, addressId: number): Promise<void> {
        await this.apiDatasource.deleteAddress(clientId, addressId)
        if (clientId !== null) {
            const addresses = await this.localDatasource.getAddresses(clientId)
            await this.localDatasource.saveAddresses(
                clientId,
                addresses.filter((address) => address.id !== addressId),
            )
        }
    }

    async getContasReceber(clienteId: number): Promise<Titulo[]> {
        return this.apiDatasource.getContasReceber(clienteId)
    }

    async lookupZipCode(zipCode: string): Promise<Partial<Endereco>> {
        return this.apiDatasource.lookupZipCode(zipCode)
    }

    private async refreshList(options?: { busca?: string; limit?: number }): Promise<void> {
        if (!this.isOnline()) {
            return
        }

        try {
            const remoteClients = await this.apiDatasource.list(options)
            for (const remoteClient of remoteClients) {
                const localClient = remoteClient.id === null
                    ? null
                    : await this.localDatasource.getById(remoteClient.id)
                if (!localClient || localClient.syncStatus === 'synced') {
                    await this.localDatasource.save({
                        ...remoteClient,
                        updated_at: remoteClient.updated_at ?? new Date().toISOString(),
                    }, 'synced')
                }
            }
        } catch (error) {
            logger.warn('Unable to refresh clientes from the API.', error)
        }
    }

    private async refreshClient(id: number): Promise<void> {
        if (!this.isOnline()) {
            return
        }

        try {
            const remoteClient = await this.apiDatasource.getById(id)
            if (!remoteClient) {
                return
            }
            const localClient = await this.localDatasource.getById(id)
            if (!localClient || localClient.syncStatus === 'synced') {
                await this.localDatasource.save({
                    ...remoteClient,
                    updated_at: remoteClient.updated_at ?? new Date().toISOString(),
                }, 'synced')
            }
        } catch (error) {
            logger.warn(`Unable to refresh cliente ${id} from the API.`, error)
        }
    }

    private dispatchSync(): void {
        if (!this.isOnline()) {
            return
        }

        void this.syncEngine.processQueue().catch((error: unknown) => {
            logger.error('Unable to process the cliente sync queue.', error)
        })
    }

    private isOnline(): boolean {
        return typeof navigator !== 'undefined' && navigator.onLine
    }

    private createTemporaryId(): string {
        const randomId = typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto
            ? globalThis.crypto.randomUUID()
            : Math.random().toString(36).slice(2, 10)
        return `temp-${Date.now()}-${randomId}`
    }
}
