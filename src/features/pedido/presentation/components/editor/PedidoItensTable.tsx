import type { ItemPedido } from '../../../domain/entities/ItemPedido'
import { pedidoStrings } from '../../pedido.constants'
import { PedidoItemRow } from './PedidoItemRow'

interface PedidoItensTableProps {
    items: ItemPedido[]
    onEdit: (item: ItemPedido) => void
}

const columns = [pedidoStrings.sequence, pedidoStrings.description, pedidoStrings.unit, pedidoStrings.quantity, pedidoStrings.unitPrice, pedidoStrings.discount, pedidoStrings.total, '']

export function PedidoItensTable({ items, onEdit }: PedidoItensTableProps): React.JSX.Element {
    return (
        <div className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="min-w-[44rem]"><div className="grid grid-cols-[2rem_minmax(6rem,1fr)_3rem_4rem_5.5rem_4.5rem_5.5rem_2.5rem] gap-2 bg-[var(--color-canvas)] px-3 py-2 text-[10px] font-semibold uppercase text-[var(--color-muted)]">{columns.map((column, index) => <span key={`${column}-${index}`} className={index > 2 ? 'text-right' : ''}>{column}</span>)}</div>{items.map((item) => <PedidoItemRow key={item.sequence} item={item} onEdit={() => onEdit(item)} />)}</div>
        </div>
    )
}