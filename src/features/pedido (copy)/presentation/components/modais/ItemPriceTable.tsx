import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import { pedidoStrings } from '../../pedido.constants'

interface ItemPriceTableProps {
    selectedId: number
    tables: PedidoEditorViewModel['catalogs']['priceTables']
}

export function ItemPriceTable({ selectedId, tables }: ItemPriceTableProps): React.JSX.Element {
    return (
        <section><h3 className="mb-2 text-sm font-semibold">{pedidoStrings.priceInfo}</h3><div className="overflow-hidden rounded-md border border-[var(--color-border)]"><div className="grid grid-cols-3 gap-2 bg-[var(--color-canvas)] px-3 py-2 text-[10px] font-semibold"><span>{pedidoStrings.priceTable}</span><span>Faixa</span><span>{pedidoStrings.validity}</span></div>{tables.map((table) => <div key={table.id} className={table.id === selectedId ? 'grid grid-cols-3 gap-2 bg-[var(--color-primary-soft)] px-3 py-2 text-xs text-[var(--color-primary)]' : 'grid grid-cols-3 gap-2 border-t border-[var(--color-border)] px-3 py-2 text-xs'}><span>{table.nome}</span><span>Unitária</span><span>{table.vigencia}</span></div>)}</div></section>
    )
}