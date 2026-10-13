import { MapPin } from 'lucide-react'
import type { Cliente } from '../../../domain/entities/Cliente'
import { clienteStrings } from '../../cliente.constants'

interface ClienteCardDetalhesProps {
    cliente: Cliente
}

export function ClienteCardDetalhes({ cliente }: ClienteCardDetalhesProps): React.JSX.Element {
    return (
        <div className="mt-3 space-y-3 border-t border-[var(--color-border)] pt-3 text-xs">
            <p className="flex gap-2 text-[var(--color-muted)]"><MapPin aria-hidden="true" size={15} className="shrink-0" />{cliente.fullAddress || cliente.addressSummary}</p>
            <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[var(--color-muted)]">{clienteStrings.lastOrder}</p><p className="mt-1 font-medium">{cliente.lastOrder ?? '—'}</p></div>
                <div><p className="text-[var(--color-muted)]">{clienteStrings.lastAttendance}</p><p className="mt-1 font-medium">{cliente.lastAttendance ?? '—'}</p></div>
            </div>
        </div>
    )
}