import { Building2, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Cliente } from '../../../domain/entities/Cliente'
import { clienteRoutes } from '../../cliente.constants'
import { ClienteMenuAcoes } from './ClienteMenuAcoes'
import { preserveClientListScroll } from '../../listScroll'

interface ClienteCardHeadingProps {
    cliente: Cliente
    listSearch: string
    onDelete: (id: number) => void
}

export function ClienteCardHeading({ cliente, listSearch, onDelete }: ClienteCardHeadingProps): React.JSX.Element {
    const PersonIcon = cliente.personType === 'PJ' ? Building2 : UserRound
    return (
        <div className="flex items-start justify-between gap-2">
            <Link to={`${clienteRoutes.edit(cliente.localId ?? cliente.id ?? 0)}${listSearch}`} onClick={preserveClientListScroll} className="min-w-0 flex-1 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]">
                <span className="flex items-center gap-2"><PersonIcon aria-hidden="true" size={16} className="shrink-0 text-[var(--color-muted)]" /><span className="truncate text-base font-semibold">{cliente.name}</span></span>
                <p className="mt-1 truncate text-xs text-[var(--color-muted)]">{cliente.legalName}</p>
            </Link>
            <ClienteMenuAcoes onDelete={() => cliente.id !== null && onDelete(cliente.id)} />
        </div>
    )
}