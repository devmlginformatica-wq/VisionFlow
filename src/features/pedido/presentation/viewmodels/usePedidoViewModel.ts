import type { PedidoTipo } from '../../domain/entities/PedidoTipo'
import { usePedidoEditorViewModel } from './usePedidoEditorViewModel'

export function usePedidoViewModel(type: PedidoTipo, orderId: number | null) {
    return usePedidoEditorViewModel(type, orderId)
}