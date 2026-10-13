import { Search } from 'lucide-react'
import { pedidoStrings } from '../../pedido.constants'

interface PedidoBuscaProps {
    value: string
    onChange: (value: string) => void
}

export function PedidoBusca({ value, onChange }: PedidoBuscaProps): React.JSX.Element {
    return (
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 focus-within:border-[var(--color-primary)]">
            <Search aria-hidden="true" size={18} className="shrink-0 text-[var(--color-muted)]" />
            <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={pedidoStrings.findOrder} aria-label={pedidoStrings.findOrder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]" />
        </label>
    )
}