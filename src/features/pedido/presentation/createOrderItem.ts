import type { ItemPedido } from '../domain/entities/ItemPedido'
import type { PedidoEditorViewModel } from './viewmodels/usePedidoEditorViewModel'
import type { ProductSelectionProduct, ProductSelectionValues } from './components/modais/productModal.types'

interface CreateOrderItemInput {
    values: ProductSelectionValues
    products: PedidoEditorViewModel['catalogs']['products']
    priceTables: PedidoEditorViewModel['catalogs']['priceTables']
    sequence: number
}

function fullProduct(product: ProductSelectionProduct) {
    return { ...product, netWeight: 0, grossWeight: 0, cubicVolume: 0, length: 0, width: 0, height: 0, packageQuantity: 1, allowsOutOfStockSale: true, stock: 0 }
}

export function createOrderItem({ values, products, priceTables, sequence }: CreateOrderItemInput): ItemPedido | null {
    const selected = products.find((product) => product.id === values.productId)
    if (!selected) return null
    const table = priceTables.find((entry) => entry.id === selected.priceTableId)
    return {
        sequence,
        customerCode: '',
        product: fullProduct(selected),
        priceTableId: selected.priceTableId,
        priceTableName: table?.nome ?? '',
        priceTableValidity: table?.vigencia ?? '',
        quantity: values.quantity,
        salePrice: selected.salePrice,
        discountAmount: 0,
        total: values.quantity * selected.salePrice,
        observation: '',
    }
}