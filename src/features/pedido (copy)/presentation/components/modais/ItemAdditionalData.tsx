import type { ProdutoPedido } from '../../../domain/entities/ItemPedido'
import { pedidoStrings } from '../../pedido.constants'

interface ItemAdditionalDataProps {
    product: ProdutoPedido
}

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 })

export function ItemAdditionalData({ product }: ItemAdditionalDataProps): React.JSX.Element {
    const fields = [
        [pedidoStrings.code, product.code],
        [pedidoStrings.description, product.description],
        [pedidoStrings.family, product.family],
        [pedidoStrings.brand, product.brand],
        [pedidoStrings.netWeight, numberFormatter.format(product.netWeight)],
        [pedidoStrings.grossWeight, numberFormatter.format(product.grossWeight)],
        [pedidoStrings.cubicVolume, numberFormatter.format(product.cubicVolume)],
        ['Dimensões (C × L × A)', `${numberFormatter.format(product.length)} × ${numberFormatter.format(product.width)} × ${numberFormatter.format(product.height)}`],
        ['Qtde. embalagem', numberFormatter.format(product.packageQuantity)],
        [pedidoStrings.unit, product.unit],
        [pedidoStrings.stock, numberFormatter.format(product.stock)],
        [pedidoStrings.outOfStockSale, product.allowsOutOfStockSale ? 'Sim' : 'Não'],
    ]
    return <section><h3 className="mb-2 text-sm font-semibold">{pedidoStrings.additionalData}</h3><dl className="grid grid-cols-2 gap-2">{fields.map(([label, value]) => <div key={label} className="rounded bg-[var(--color-canvas)] p-2"><dt className="text-[10px] text-[var(--color-muted)]">{label}</dt><dd className="mt-1 truncate text-xs font-medium">{value}</dd></div>)}</dl></section>
}