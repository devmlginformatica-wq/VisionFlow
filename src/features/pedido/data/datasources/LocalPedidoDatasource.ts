import { db, type StoredCatalogRecord, type StoredCustomerAddresses, type StoredPedido, type SyncStatus } from '../../../../core/storage/db'
import type { Endereco } from '../../../cliente/domain/entities/Endereco'
import type { Pedido } from '../../domain/entities/Pedido'
import { normalizePedidoId } from '../../domain/entities/PedidoId'
import type { PedidoTipo } from '../../domain/entities/PedidoTipo'

type CatalogProduct = {
    id: number
    code: string
    description: string
    family: string
    brand: string
    unit: string
    priceTableId: number
    salePrice: number
}

export class LocalPedidoDatasource {
    async getCompanies(): Promise<Array<{ id: number; nome: string }>> {
        return this.readCatalog(db.catalogo_empresas)
    }

    async saveCompanies(items: Array<{ id: number; nome: string }>): Promise<void> {
        await this.replaceCatalog(db.catalogo_empresas, items)
    }

    async getPaymentConditions(): Promise<Array<{ id: number; descricao: string }>> {
        return this.readCatalog(db.catalogo_condicoes_pagamento)
    }

    async savePaymentConditions(items: Array<{ id: number; descricao: string }>): Promise<void> {
        await this.replaceCatalog(db.catalogo_condicoes_pagamento, items)
    }

    async getPaymentMethods(): Promise<Array<{ id: number; descricao: string }>> {
        return this.readCatalog(db.catalogo_formas_pagamento)
    }

    async savePaymentMethods(items: Array<{ id: number; descricao: string }>): Promise<void> {
        await this.replaceCatalog(db.catalogo_formas_pagamento, items)
    }

    async getCarriers(): Promise<Array<{ id: number; nome: string }>> {
        return this.readCatalog(db.catalogo_transportadoras)
    }

    async saveCarriers(items: Array<{ id: number; nome: string }>): Promise<void> {
        await this.replaceCatalog(db.catalogo_transportadoras, items)
    }

    async getPriceTables(): Promise<Array<{ id: number; nome: string; vigencia: string }>> {
        return this.readCatalog(db.catalogo_tabelas_preco)
    }

    async savePriceTables(items: Array<{ id: number; nome: string; vigencia: string }>): Promise<void> {
        await this.replaceCatalog(db.catalogo_tabelas_preco, items)
    }

    async getProducts(): Promise<CatalogProduct[]> {
        return this.readCatalog(db.catalogo_produtos)
    }

    async saveProducts(items: CatalogProduct[]): Promise<void> {
        await this.mergeCatalog(db.catalogo_produtos, items)
    }

    async getCustomerAddresses(customerId: number | string): Promise<Endereco[]> {
        if (typeof customerId === 'string') {
            return (await db.clientes.get(customerId))?.data?.addresses ?? []
        }
        const stored = await db.customer_addresses.get(customerId)
        if (stored) return stored.data
        const customer = await db.clientes.get(customerId)
        return customer?.data?.addresses ?? []
    }

    async saveCustomerAddresses(customerId: number, addresses: Endereco[]): Promise<void> {
        const record: StoredCustomerAddresses = { customerId, data: addresses }
        await db.customer_addresses.put(record)
    }

    async getAll(type?: PedidoTipo): Promise<Pedido[]> {
        const records = await db.pedidos.toArray()
        return records
            .filter((record) => type === undefined || record.type === type || record.data?.type === type)
            .map((record) => this.toPedido(record))
    }

    async getById(id: number | string, type?: PedidoTipo): Promise<Pedido | null> {
        const record = await db.pedidos.get(normalizePedidoId(id))
        if (!record) {
            return null
        }

        const pedido = this.toPedido(record)
        if (type !== undefined && pedido.type !== type) {
            return null
        }

        return pedido
    }

    async save(
        pedido: Pedido,
        syncStatus: SyncStatus = 'pending',
        storageId: number | string | null = pedido.id,
    ): Promise<Pedido> {
        if (storageId === null) {
            throw new Error('A storage id is required for local pedido storage.')
        }

        const data: Pedido = { ...pedido, updated_at: pedido.updated_at ?? new Date().toISOString(), syncStatus }
        const record: StoredPedido = {
            id: storageId,
            updated_at: data.updated_at ?? new Date().toISOString(),
            syncStatus,
            data,
            type: pedido.type,
            customerName: pedido.customerName,
            number: pedido.number,
            status: pedido.status,
            clientId: pedido.customerId,
            paymentConditionId: pedido.paymentConditionId,
            paymentMethodId: pedido.paymentMethodId,
            carrierId: pedido.carrierId,
        }

        await db.pedidos.put(record)

        return {
            ...data,
            id: record.id,
            updated_at: record.updated_at,
            syncStatus: record.syncStatus,
        }
    }

    async delete(id: number | string): Promise<void> {
        await db.pedidos.delete(normalizePedidoId(id))
    }

    private toPedido(record: StoredPedido): Pedido {
        if (!record.data) {
            throw new Error(`Local pedido ${record.id} is missing its stored data.`)
        }

        return {
            ...record.data,
            id: record.id,
            updated_at: record.updated_at,
            syncStatus: record.syncStatus,
        }
    }

    private readCatalog<T>(table: { toArray: () => Promise<Array<StoredCatalogRecord<T>>> }): Promise<T[]> {
        return table.toArray().then((records) => records.map(({ data }) => data))
    }

    private async replaceCatalog<T extends { id: number }>(
        table: { clear: () => Promise<void>; bulkPut: (records: Array<StoredCatalogRecord<T>>) => Promise<unknown> },
        items: T[],
    ): Promise<void> {
        await table.clear()
        if (items.length > 0) {
            await table.bulkPut(items.map((data) => ({ id: data.id, data })))
        }
    }

    private async mergeCatalog<T extends { id: number }>(
        table: { bulkPut: (records: Array<StoredCatalogRecord<T>>) => Promise<unknown> },
        items: T[],
    ): Promise<void> {
        if (items.length > 0) {
            await table.bulkPut(items.map((data) => ({ id: data.id, data })))
        }
    }
}
