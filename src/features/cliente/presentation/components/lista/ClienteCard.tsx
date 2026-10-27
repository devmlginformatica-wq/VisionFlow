import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { VfCard } from '../../../../../core/components/VfCard'
import { SyncStatusBadge } from '../../../../../core/components/SyncStatusBadge'
import type { Cliente } from '../../../domain/entities/Cliente'
import { clienteStrings } from '../../cliente.constants'
import { ClienteCardDetalhes } from './ClienteCardDetalhes'
import { ClienteCardHeading } from './ClienteCardHeading'
import { ClienteCardIdentity } from './ClienteCardIdentity'

interface ClienteCardProps {
    cliente: Cliente
    listSearch: string
    onDelete: (id: number) => void
}

export function ClienteCard({ cliente, listSearch, onDelete }: ClienteCardProps): React.JSX.Element {
    const [expanded, setExpanded] = useState(false)
    const statusLabel = cliente.status === 'bloqueado' ? clienteStrings.blocked : cliente.prospect ? clienteStrings.prospect : clienteStrings.effective

    return (
        <VfCard className="relative overflow-hidden transition-shadow hover:shadow-sm">
            <span aria-hidden="true" className={clsx('absolute inset-y-0 left-0 w-1', cliente.indicatorColor === 'verde' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]')} />
            <div className="p-4 pl-5">
                <ClienteCardHeading cliente={cliente} listSearch={listSearch} onDelete={onDelete} />
                <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[var(--color-canvas)] px-2 py-1 text-[11px] text-[var(--color-muted)]">{cliente.openedAt}</span>
                    <span className="rounded-full bg-[var(--color-primary-soft)] px-2 py-1 text-[11px] font-medium text-[var(--color-primary)]">{cliente.registrationStatus === 'em_digitacao' ? clienteStrings.statusDraft : statusLabel}</span>
                    {cliente.status === 'bloqueado' && <span className="rounded-full bg-[var(--color-danger-soft)] px-2 py-1 text-[11px] font-medium text-[var(--color-danger)]">{clienteStrings.blocked}</span>}
                    <SyncStatusBadge syncStatus={cliente.syncStatus} syncError={cliente.syncError} />
                </div>
                <ClienteCardIdentity taxId={cliente.taxId} addressSummary={cliente.addressSummary} clientId={cliente.id} />
                {expanded && <ClienteCardDetalhes cliente={cliente} />}
                <button type="button" aria-expanded={expanded} onClick={() => setExpanded((current) => !current)} className="mt-3 inline-flex h-8 items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline">
                    {expanded ? clienteStrings.closeDetails : clienteStrings.details}<ChevronDown aria-hidden="true" size={15} className={clsx('transition-transform', expanded && 'rotate-180')} />
                </button>
            </div>
        </VfCard>
    )
}