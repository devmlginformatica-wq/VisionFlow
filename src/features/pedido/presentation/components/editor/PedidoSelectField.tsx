import type { ReactNode } from 'react'

interface PedidoSelectFieldProps {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    children: ReactNode
    disabled?: boolean
    error?: string
}

export function PedidoSelectField({
    id,
    label,
    value,
    onChange,
    children,
    disabled = false,
    error,
}: PedidoSelectFieldProps): React.JSX.Element {
    return (
        <div className="grid gap-1.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
            <label
                htmlFor={id}
                className="text-sm font-medium"
            >
                {label}
            </label>

            <div className="min-w-0">
                <select
                    id={id}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className="h-10 w-full min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm disabled:bg-[var(--color-canvas)] disabled:opacity-60"
                >
                    {children}
                </select>
                {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
            </div>
        </div>
    )
}