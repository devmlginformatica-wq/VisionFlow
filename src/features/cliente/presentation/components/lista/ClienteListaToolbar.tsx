import { LayoutGrid, List } from 'lucide-react'
import { ClienteBusca } from './ClienteBusca'
import { ClienteAdvancedFilters } from './ClienteAdvancedFilters'

interface ClienteListaToolbarProps {
    search: string
    onSearchChange: (value: string) => void
    filter: string
    onFilterChange: (value: string) => void
    gridView: boolean
    onViewChange: (grid: boolean) => void
}

export function ClienteListaToolbar({ search, onSearchChange, filter, onFilterChange, gridView, onViewChange }: ClienteListaToolbarProps): React.JSX.Element {
    return (
        <div className="flex min-w-0 items-center gap-2">
            <ClienteBusca value={search} onChange={onSearchChange} />
            <div className="flex shrink-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
                <button type="button" aria-label="Visualização em lista" aria-pressed={!gridView} onClick={() => onViewChange(false)} className="flex size-9 items-center justify-center rounded aria-pressed:bg-[var(--color-primary-soft)] aria-pressed:text-[var(--color-primary)]"><List size={18} /></button>
                <button type="button" aria-label="Visualização em grade" aria-pressed={gridView} onClick={() => onViewChange(true)} className="flex size-9 items-center justify-center rounded aria-pressed:bg-[var(--color-primary-soft)] aria-pressed:text-[var(--color-primary)]"><LayoutGrid size={18} /></button>
            </div>
            <ClienteAdvancedFilters value={filter} onChange={onFilterChange} />
        </div>
    )
}