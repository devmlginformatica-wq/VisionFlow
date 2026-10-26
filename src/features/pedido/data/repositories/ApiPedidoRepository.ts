import { ApiPedidoDatasource } from '../datasources/ApiPedidoDatasource'
import { LocalPedidoDatasource } from '../datasources/LocalPedidoDatasource'
import { OfflineFirstPedidoRepository } from './OfflineFirstPedidoRepository'
import { DexieSyncQueueRepository } from '../../../sync/data/repositories/DexieSyncQueueRepository'

import type { Endereco } from '../../../cliente/domain/entities/Endereco'
import type { Pedido } from '../../domain/entities/Pedido'
import type { PedidoTipo } from '../../domain/entities/PedidoTipo'
import type { PedidoRepository } from '../../domain/repositories/PedidoRepository'

export class ApiPedidoRepository implements PedidoRepository {
    private readonly offlineRepository: OfflineFirstPedidoRepository

    constructor(
        apiDatasource: ApiPedidoDatasource = new ApiPedidoDatasource(),
        localDatasource = new LocalPedidoDatasource(),
        syncQueueRepository = new DexieSyncQueueRepository(),
    ) {
        this.offlineRepository = new OfflineFirstPedidoRepository(
            apiDatasource,
            localDatasource,
            syncQueueRepository,
        )
    }

    async list(type: PedidoTipo): Promise<Pedido[]> {
        return this.offlineRepository.list(type)
    }

    async getById(id: number | string, type: PedidoTipo): Promise<Pedido | null> {
        return this.offlineRepository.getById(Number(id) || id, type)
    }

    async save(pedido: Pedido): Promise<Pedido> {
        return this.offlineRepository.save(pedido)
    }

    async delete(id: number | string): Promise<void> {
        await this.offlineRepository.delete(Number(id) || id)
    }

    async getCustomerAddresses(customerId: number): Promise<Endereco[]> {
        return this.offlineRepository.getCustomerAddresses(customerId)
    }

    async listCompanies(): Promise<Array<{ id: number; nome: string }>> {
        return this.offlineRepository.listCompanies()
    }

    async listPaymentConditions(): Promise<Array<{ id: number; descricao: string }>> {
        return this.offlineRepository.listPaymentConditions()
    }

    async listPaymentMethods(): Promise<Array<{ id: number; descricao: string }>> {
        return this.offlineRepository.listPaymentMethods()
    }

    async listCarriers(): Promise<Array<{ id: number; nome: string }>> {
        return this.offlineRepository.listCarriers()
    }

    async listPriceTables(): Promise<Array<{ id: number; nome: string; vigencia: string }>> {
        return this.offlineRepository.listPriceTables()
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
        return this.offlineRepository.listProducts(options)
    }

    async finalize(id: number, type: PedidoTipo): Promise<void> {
        await this.offlineRepository.finalize(id, type)
    }

    createDraft(type: PedidoTipo): Pedido {
        return this.offlineRepository.createDraft(type)
    }
}
