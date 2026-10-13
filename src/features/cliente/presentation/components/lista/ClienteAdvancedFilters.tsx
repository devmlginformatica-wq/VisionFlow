import * as Dialog from '@radix-ui/react-dialog'
import { SlidersHorizontal, X } from 'lucide-react'
import { clientFilters } from '../../viewmodels/useClienteViewModel'

interface ClienteAdvancedFiltersProps {
    value: string
    onChange: (value: string) => void
}

export function ClienteAdvancedFilters({ value, onChange }: ClienteAdvancedFiltersProps): React.JSX.Element {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button type="button" aria-label="Abrir filtros avançados" title="Filtros avançados" className="flex size-11 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-canvas)]"><SlidersHorizontal aria-hidden="true" size={18} /></button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--color-overlay)]" />
                <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-[var(--color-foreground)] shadow-xl md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(28rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md">
                    <div className="mb-4 flex items-center justify-between"><Dialog.Title className="text-base font-semibold">Filtros de clientes</Dialog.Title><Dialog.Close aria-label="Fechar filtros" className="rounded-md p-2 hover:bg-[var(--color-canvas)]"><X size={18} /></Dialog.Close></div>
                    <div className="grid grid-cols-2 gap-2">
                        {clientFilters.map((filter) => <Dialog.Close key={filter.value} asChild><button type="button" aria-pressed={value === filter.value} onClick={() => onChange(filter.value)} className="rounded-md border border-[var(--color-border)] px-3 py-2.5 text-left text-sm aria-pressed:border-[var(--color-primary)] aria-pressed:bg-[var(--color-primary-soft)]">{filter.label}</button></Dialog.Close>)}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}