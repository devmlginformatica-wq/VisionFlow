import { db, type StoredCliente, type StoredCnpjLookup, type StoredCustomerAddresses, type SyncStatus } from '../../../../core/storage/db'
import type { Cliente, CnpjLookup } from '../../domain/entities/Cliente'
import type { Endereco } from '../../domain/entities/Endereco'

export class LocalClienteDatasource {
    async getCnpjLookup(taxId: string): Promise<CnpjLookup | null> {
        const record = await db.catalogo_cnpj.get(taxId)
        return record?.data ?? null
    }

    async saveCnpjLookup(taxId: string, lookup: CnpjLookup): Promise<void> {
        const record: StoredCnpjLookup = { taxId, data: lookup }
        await db.catalogo_cnpj.put(record)
    }

    async getAddresses(clientId: number): Promise<Endereco[]> {
        const record = await db.customer_addresses.get(clientId)
        if (record) return record.data
        return (await this.getById(clientId))?.addresses ?? []
    }

    async saveAddresses(clientId: number, addresses: Endereco[]): Promise<void> {
        const record: StoredCustomerAddresses = { customerId: clientId, data: addresses }
        await db.customer_addresses.put(record)
    }

    async getAll(): Promise<Cliente[]> {
        const records = await db.clientes.toArray()
        return records.map((record) => this.toCliente(record))
    }

    async getById(id: number | string): Promise<Cliente | null> {
        const record = await db.clientes.get(id)
        return record ? this.toCliente(record) : null
    }

    async save(
        cliente: Cliente,
        syncStatus: SyncStatus = 'pending',
        storageId: number | string | null = cliente.id,
    ): Promise<Cliente> {
        if (storageId === null) {
            throw new Error('A storage id is required for local cliente storage.')
        }

        const data: Cliente = { ...cliente, syncStatus }
        const record: StoredCliente = {
            id: storageId,
            updated_at: cliente.updated_at ?? new Date().toISOString(),
            syncStatus,
            data,
            name: cliente.name,
            legalName: cliente.legalName,
            tradeName: cliente.tradeName,
            taxId: cliente.taxId,
            carrierId: cliente.carrierId,
            paymentConditionId: cliente.paymentConditionId,
            paymentMethodId: cliente.paymentMethodId,
            priceTableId: cliente.priceTableId,
        }
        await db.clientes.put(record)
        if (typeof storageId === 'number') {
            const cachedAddresses = await db.customer_addresses.get(storageId)
            if (cliente.addresses.length > 0 || !cachedAddresses) {
                await this.saveAddresses(storageId, cliente.addresses)
            }
        }

        return {
            ...data,
            id: typeof record.id === 'number' ? record.id : null,
            updated_at: record.updated_at,
            syncStatus: record.syncStatus,
        }
    }

    async delete(id: number | string): Promise<void> {
        await db.clientes.delete(id)
    }

    private toCliente(record: StoredCliente): Cliente {
        if (!record.data) {
            throw new Error(`Local cliente ${record.id} is missing its stored data.`)
        }

        return {
            ...record.data,
            id: typeof record.id === 'number' ? record.id : null,
            updated_at: record.updated_at,
            syncStatus: record.syncStatus,
        }
    }
}
