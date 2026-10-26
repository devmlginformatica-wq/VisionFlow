import type { SyncStatus } from '../../../../core/storage/db'
import type { ItemPedido } from './ItemPedido'
import type { PedidoStatus, PedidoTipo } from './PedidoTipo'

export interface PedidoTotals {
    mixQuantity: number
    volumeQuantity: number
    totalCubicVolume: number
    netWeight: number
    grossWeight: number
    grossTotal: number
    discountTotal: number
    netTotal: number
}

export interface Pedido {
    id: number | null
    updated_at?: string
    syncStatus?: SyncStatus
    type: PedidoTipo
    number: string
    customerOrderNumber: string
    status: PedidoStatus
    rejectionReason?: string | null
    issueDate: string
    deliveryDate: string
    companyId: number | null
    customerId: number | string | null
    customerName: string
    customerTaxId: string
    paymentConditionId: number | null
    paymentMethodId: number | null
    carrierId: number | null
    billingAddressId: number | null
    deliveryAddressId: number | null
    collectionAddressId: number | null
    freightAmount: number
    observation: string
    invoiceObservation: string
    items: ItemPedido[]
    totals: PedidoTotals
}