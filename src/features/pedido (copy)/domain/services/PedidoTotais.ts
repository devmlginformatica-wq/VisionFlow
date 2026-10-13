import type { ItemPedido } from '../entities/ItemPedido'
import type { PedidoTotals } from '../entities/Pedido'

export function calcularPedidoTotais(items: readonly ItemPedido[], freightAmount: number): PedidoTotals {
    const itemTotals = items.reduce((totals, item) => {
        totals.mixQuantity += item.quantity
        totals.volumeQuantity += item.product.packageQuantity > 0
            ? Math.ceil(item.quantity / item.product.packageQuantity)
            : item.quantity
        totals.totalCubicVolume += item.quantity * item.product.cubicVolume
        totals.netWeight += item.quantity * item.product.netWeight
        totals.grossWeight += item.quantity * item.product.grossWeight
        totals.grossTotal += item.quantity * item.salePrice
        totals.discountTotal += item.discountAmount
        return totals
    }, {
        mixQuantity: 0,
        volumeQuantity: 0,
        totalCubicVolume: 0,
        netWeight: 0,
        grossWeight: 0,
        grossTotal: 0,
        discountTotal: 0,
        netTotal: 0,
    })

    return {
        ...itemTotals,
        netTotal: itemTotals.grossTotal - itemTotals.discountTotal + freightAmount,
    }
}