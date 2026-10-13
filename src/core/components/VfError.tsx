import { AlertCircle, RotateCcw } from 'lucide-react'

interface VfErrorProps {
    message: string
    retryLabel: string
    onRetry: () => void
}

export function VfError({ message, retryLabel, onRetry }: VfErrorProps): React.JSX.Element {
    return (
        <section role="alert" className="flex flex-col gap-4 rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] p-5 md:flex-row md:items-center md:justify-between">
            <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
                <AlertCircle aria-hidden="true" size={18} />{message}
            </p>
            <button type="button" onClick={onRetry} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium hover:bg-[var(--color-canvas)] md:self-auto">
                <RotateCcw aria-hidden="true" size={16} />{retryLabel}
            </button>
        </section>
    )
}