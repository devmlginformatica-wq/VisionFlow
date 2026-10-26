import { ApiClienteDatasource } from '../datasources/ApiClienteDatasource'
import { LocalClienteDatasource } from '../datasources/LocalClienteDatasource'
import type { Cliente, CnpjLookup } from '../../domain/entities/Cliente'
import type { Endereco, EnderecoInput } from '../../domain/entities/Endereco'
import type { Titulo } from '../../domain/entities/Titulo'
import type { ClienteRepository } from '../../domain/repositories/ClienteRepository'
import { OfflineFirstClienteRepository } from './OfflineFirstClienteRepository'
import { DexieSyncQueueRepository } from '../../../sync/data/repositories/DexieSyncQueueRepository'

export class ApiClienteRepository implements ClienteRepository {
    private readonly apiDatasource: ApiClienteDatasource
    private readonly offlineRepository: OfflineFirstClienteRepository

    constructor(
        apiDatasource = new ApiClienteDatasource(),
        localDatasource = new LocalClienteDatasource(),
        syncQueueRepository = new DexieSyncQueueRepository(),
    ) {
        this.apiDatasource = apiDatasource
        this.offlineRepository = new OfflineFirstClienteRepository(
            apiDatasource,
            localDatasource,
            syncQueueRepository,
        )
    }

    async list(options?: { busca?: string; limit?: number }): Promise<Cliente[]> {
        return this.offlineRepository.list(options)
    }

    async getById(id: number | string): Promise<Cliente | null> {
        return this.offlineRepository.getById(id)
    }

    async save(cliente: Cliente): Promise<Cliente> {
        return this.offlineRepository.save(cliente)
    }

    async delete(id: number | string): Promise<void> {
        await this.offlineRepository.delete(id)
    }

    async lookupTaxId(taxId: string): Promise<CnpjLookup> {
        return this.offlineRepository.lookupTaxId(taxId)
    }

    async getAddresses(clientId: number | null): Promise<Endereco[]> {
        return this.offlineRepository.getAddresses(clientId)
    }

    async saveAddress(clientId: number | null, address: EnderecoInput): Promise<Endereco> {
        return this.offlineRepository.saveAddress(clientId, address)
    }

    async deleteAddress(clientId: number | null, addressId: number): Promise<void> {
        await this.offlineRepository.deleteAddress(clientId, addressId)
    }

    async getContasReceber(clienteId: number): Promise<Titulo[]> {
        return this.offlineRepository.getContasReceber(clienteId)
    }

    async lookupZipCode(zipCode: string): Promise<Partial<Endereco>> {
        return this.offlineRepository.lookupZipCode(zipCode)
    }

    async finalize(id: number): Promise<void> {
        await this.apiDatasource.finalize(id)
    }
}
