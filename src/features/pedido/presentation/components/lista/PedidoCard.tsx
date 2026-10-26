import { ArrowUpRight, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { VfCard } from '../../../../../core/components/VfCard'
import { SyncStatusBadge } from '../../../../../core/components/SyncStatusBadge'
import type { Pedido } from '../../../domain/entities/Pedido'
import type { PedidoTipo } from '../../../domain/entities/PedidoTipo'
import { getOrderBasePath, pedidoStrings } from '../../pedido.constants'
import { preservePedidoListScroll } from '../../listScroll'

interface PedidoCardProps {
    pedido: Pedido
    type: PedidoTipo
    listSearch: string
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function formatIssueDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number)
    return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day))
}

function getStatusLabel(status: Pedido['status']): string {
    if (status === 'em_integracao') return pedidoStrings.integrationPending
    if (status === 'erro_integracao') return pedidoStrings.integrationError
    if (status === 'integrado') return pedidoStrings.integrated
    if (status === 'aguardando_aprovacao') return pedidoStrings.approval
    if (status === 'aprovado') return pedidoStrings.approved
    if (status === 'cancelado') return pedidoStrings.cancelled
    return pedidoStrings.draft
}

export function PedidoCard({ pedido, type, listSearch }: PedidoCardProps): React.JSX.Element {
    const href = `${getOrderBasePath(type)}/${pedido.id}${listSearch}`
    return (
        <VfCard className="overflow-hidden transition-shadow hover:shadow-sm">
            <Link to={href} onClick={preservePedidoListScroll} className="block p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]">
                <div className="flex items-start justify-between gap-3"><span className="flex size-9 items-center justify-center rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary)]"><ClipboardList aria-hidden="true" size={18} /></span><span className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)]"><ArrowUpRight size={15} />{pedido.number}</span></div>
                <p className="mt-4 truncate text-sm font-semibold">{pedido.customerName || pedidoStrings.customer}</p>
                <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-[var(--color-muted)]">{formatIssueDate(pedido.issueDate)}</span><span className="text-sm font-semibold tabular-nums">{currency.format(pedido.totals.netTotal)}</span></div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-[var(--color-canvas)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-muted)]">{getStatusLabel(pedido.status)}</span>
                    <SyncStatusBadge syncStatus={pedido.syncStatus} />
                </div>
            </Link>
        </VfCard>
    )
}