import { MoreVertical } from 'lucide-react'
import type { ItemPedido } from '../../../domain/entities/ItemPedido'
import { pedidoStrings } from '../../pedido.constants'

interface PedidoItemRowProps {
    item: ItemPedido
    onEdit: () => void
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function PedidoItemRow({ item, onEdit }: PedidoItemRowProps): React.JSX.Element {
    return (
        <button type="button" onClick={onEdit} className="grid w-full grid-cols-[2rem_minmax(6rem,1fr)_3rem_4rem_5.5rem_4.5rem_5.5rem_2.5rem] items-center gap-2 border-t border-[var(--color-border)] px-3 py-3 text-left text-xs hover:bg-[var(--color-canvas)]">
            <span>{item.sequence}</span><span className="min-w-0"><span className="block truncate font-medium">{item.product.description}</span><span className="mt-1 block truncate text-[var(--color-muted)]">{item.product.code}</span></span><span>{item.product.unit}</span><span className="text-right">{item.quantity}</span><span className="text-right">{currency.format(item.salePrice)}</span><span className="text-right">{currency.format(item.discountAmount)}</span><span className="text-right font-semibold">{currency.format(item.total)}</span><span><MoreVertical aria-label={pedidoStrings.itemTitle} size={16} /></span>
        </button>
    )
}