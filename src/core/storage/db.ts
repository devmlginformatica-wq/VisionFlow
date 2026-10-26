import Dexie, { type Table } from 'dexie'

import type { Cliente } from '../../features/cliente/domain/entities/Cliente'
import type { Pedido } from '../../features/pedido/domain/entities/Pedido'
import type { Endereco } from '../../features/cliente/domain/entities/Endereco'
import type { CnpjLookup } from '../../features/cliente/domain/entities/Cliente'

export type SyncStatus = 'synced' | 'pending' | 'error'

export interface StoredEntityBase {
    id: number | string
    updated_at: string
    syncStatus: SyncStatus
}

export interface StoredCliente extends StoredEntityBase {
    id: number | string
    data?: Cliente
    name?: string
    legalName?: string
    tradeName?: string
    taxId?: string
    carrierId?: number | null
    paymentConditionId?: number | null
    paymentMethodId?: number | null
    priceTableId?: number | null
}

export interface StoredPedido extends StoredEntityBase {
    id: number | string
    data?: Pedido
    type?: string
    clientId?: number | null
    status?: string
    customerName?: string
    number?: string
    paymentConditionId?: number | null
    paymentMethodId?: number | null
    carrierId?: number | null
}

export interface SyncQueueRecord {
    id: string
    entity: 'cliente' | 'pedido'
    entityId: number | string
    action: 'create' | 'update' | 'delete'
    payload: unknown
    createdAt: string
    attempts: number
    lastError: string | null
}

export interface StoredCatalogRecord<T> {
    id: number
    data: T
}

export interface StoredCnpjLookup {
    taxId: string
    data: CnpjLookup
}

export interface StoredCustomerAddresses {
    customerId: number
    data: Endereco[]
}

class VisionFlowDatabase extends Dexie {
    clientes!: Table<StoredCliente, number | string>
    pedidos!: Table<StoredPedido, number | string>
    sync_queue!: Table<SyncQueueRecord, string>
    catalogo_empresas!: Table<StoredCatalogRecord<{ id: number; nome: string }>, number>
    catalogo_condicoes_pagamento!: Table<StoredCatalogRecord<{ id: number; descricao: string }>, number>
    catalogo_formas_pagamento!: Table<StoredCatalogRecord<{ id: number; descricao: string }>, number>
    catalogo_transportadoras!: Table<StoredCatalogRecord<{ id: number; nome: string }>, number>
    catalogo_tabelas_preco!: Table<StoredCatalogRecord<{ id: number; nome: string; vigencia: string }>, number>
    catalogo_produtos!: Table<StoredCatalogRecord<{
        id: number
        code: string
        description: string
        family: string
        brand: string
        unit: string
        priceTableId: number
        salePrice: number
    }>, number>
    catalogo_cnpj!: Table<StoredCnpjLookup, string>
    customer_addresses!: Table<StoredCustomerAddresses, number>

    constructor() {
        super('VisionFlowDB')

        this.version(1).stores({
            clientes: '&id, updated_at, syncStatus',
            pedidos: '&id, updated_at, syncStatus',
            sync_queue: '&id, entity, entityId, action, createdAt, attempts, lastError',
        })
        this.version(2).stores({
            clientes: '&id, updated_at, syncStatus, carrierId, paymentConditionId, paymentMethodId, priceTableId',
            pedidos: '&id, updated_at, syncStatus, type, clientId, paymentConditionId, paymentMethodId, carrierId',
            sync_queue: '&id, entity, entityId, action, createdAt, attempts, lastError',
            catalogo_empresas: '&id',
            catalogo_condicoes_pagamento: '&id',
            catalogo_formas_pagamento: '&id',
            catalogo_transportadoras: '&id',
            catalogo_tabelas_preco: '&id',
            catalogo_produtos: '&id',
            catalogo_cnpj: '&taxId',
            customer_addresses: '&customerId',
        })
    }
}

export const db = new VisionFlowDatabase()
export default db
