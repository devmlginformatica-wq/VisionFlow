import clsx from 'clsx'
import { clientFilters } from '../../viewmodels/useClienteViewModel'

interface ClienteFiltrosChipsProps {
    value: string
    onChange: (filter: string) => void
}

export function ClienteFiltrosChips({ value, onChange }: ClienteFiltrosChipsProps): React.JSX.Element {
    return (
        <div role="group" aria-label="Filtrar clientes" className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {clientFilters.map((filter) => (
                <button
                    key={filter.value}
                    type="button"
                    aria-pressed={value === filter.value}
                    onClick={() => onChange(filter.value)}
                    className={clsx(
                        'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        value === filter.value
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                            : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface)]',
                    )}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}