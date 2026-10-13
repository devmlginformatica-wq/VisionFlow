import { Search, X } from 'lucide-react'
import { clienteStrings } from '../../cliente.constants'

interface ClienteBuscaProps {
    value: string
    onChange: (value: string) => void
}

export function ClienteBusca({ value, onChange }: ClienteBuscaProps): React.JSX.Element {
    return (
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 focus-within:border-[var(--color-primary)]">
            <Search aria-hidden="true" size={18} className="shrink-0 text-[var(--color-muted)]" />
            <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={clienteStrings.search} aria-label={clienteStrings.search} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]" />
            {value && <button type="button" aria-label="Limpar busca" onClick={() => onChange('')} className="rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-canvas)]"><X size={16} /></button>}
        </label>
    )
}