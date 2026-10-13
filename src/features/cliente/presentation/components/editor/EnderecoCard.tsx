import { MapPin, Trash2 } from 'lucide-react'
import { VfCard } from '../../../../../core/components/VfCard'
import type { Endereco } from '../../../domain/entities/Endereco'

interface EnderecoCardProps {
    address: Endereco
    onEdit: () => void
    onDelete: () => void
}

export function EnderecoCard({ address, onEdit, onDelete }: EnderecoCardProps): React.JSX.Element {
    return (
        <VfCard className="flex items-stretch">
            <button type="button" onClick={onEdit} className="flex min-w-0 flex-1 items-start gap-3 p-4 text-left hover:bg-[var(--color-canvas)]">
                <MapPin aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                <span className="min-w-0"><span className="block truncate text-sm font-semibold">{address.street}, {address.number}</span><span className="mt-1 block truncate text-xs text-[var(--color-muted)]">{address.district} · {address.city}, {address.state}</span><span className="mt-2 block text-[11px] text-[var(--color-primary)]">{address.type} · {address.purpose}</span></span>
            </button>
            <button type="button" aria-label="Excluir endereço" onClick={onDelete} className="m-2 flex size-9 shrink-0 items-center justify-center self-start rounded-md text-[var(--color-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"><Trash2 size={16} /></button>
        </VfCard>
    )
}