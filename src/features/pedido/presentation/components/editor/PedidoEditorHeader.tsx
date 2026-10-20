import { Check, Save, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PedidoTipo } from '../../../domain/entities/PedidoTipo'
import { getOrderBasePath, pedidoStrings } from '../../pedido.constants'

interface PedidoEditorHeaderProps {
    type: PedidoTipo
    number: string
    saving: boolean
    locked: boolean
    onCancel: () => void
}

export function PedidoEditorHeader({ type, number, saving, locked, onCancel }: PedidoEditorHeaderProps): React.JSX.Element {
    const budget = type === 'orcamento'
    const title = number ? `${budget ? pedidoStrings.budget : pedidoStrings.order} ${number}` : budget ? pedidoStrings.newBudget : pedidoStrings.newOrder
    return (
        <header className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-4 md:flex-row md:items-center md:justify-between">
            <div><Link to={getOrderBasePath(type)} onClick={(event) => { event.preventDefault(); onCancel() }} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)]">{budget ? pedidoStrings.budgets : pedidoStrings.orders}</Link><h1 className="mt-1 text-xl font-semibold">{title}</h1></div>
            <div className="hidden items-center gap-2 md:flex"><button type="submit" form="pedido-editor-form" data-finalize="true" disabled={saving || locked} className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)] disabled:opacity-60"><Check size={16} />{budget ? pedidoStrings.finishBudget : pedidoStrings.finishOrder}</button><button type="submit" form="pedido-editor-form" disabled={saving || locked} className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-3 text-sm disabled:opacity-60"><Save size={16} />{pedidoStrings.save}</button><button type="button" onClick={onCancel} className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-3 text-sm"><X size={16} />{pedidoStrings.cancel}</button></div>
            <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3 md:hidden"><button type="submit" form="pedido-editor-form" data-finalize="true" disabled={saving || locked} className="h-11 flex-1 rounded-md bg-[var(--color-primary)] px-2 text-xs font-semibold text-[var(--color-primary-foreground)] disabled:opacity-60">{budget ? pedidoStrings.finishBudget : pedidoStrings.finishOrder}</button><button type="submit" form="pedido-editor-form" disabled={saving || locked} className="h-11 flex-1 rounded-md border border-[var(--color-border)] px-2 text-xs disabled:opacity-60">{pedidoStrings.save}</button><button type="button" onClick={onCancel} aria-label={pedidoStrings.cancel} className="flex size-11 items-center justify-center rounded-md border border-[var(--color-border)]"><X size={17} /></button></div>
        </header>
    )
}