import { SearchX } from 'lucide-react'

interface VfEmptyProps {
    title: string
    description: string
    actionLabel: string
    onAction: () => void
}

export function VfEmpty({ title, description, actionLabel, onAction }: VfEmptyProps): React.JSX.Element {
    return (
        <section className="flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]"><SearchX aria-hidden="true" size={20} /></span>
            <h2 className="mt-4 text-base font-semibold">{title}</h2>
            <p className="mt-1 max-w-sm text-sm text-[var(--color-muted)]">{description}</p>
            <button type="button" onClick={onAction} className="mt-5 h-10 rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]">{actionLabel}</button>
        </section>
    )
}