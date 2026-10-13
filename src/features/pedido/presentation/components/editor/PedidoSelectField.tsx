import type { ReactNode } from 'react'

interface PedidoSelectFieldProps {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    children: ReactNode
    disabled?: boolean
}

export function PedidoSelectField({
    id,
    label,
    value,
    onChange,
    children,
    disabled = false,
}: PedidoSelectFieldProps): React.JSX.Element {
    return (
        <div className="grid gap-1.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
            <label
                htmlFor={id}
                className="text-sm font-medium"
            >
                {label}
            </label>

            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                className="h-10 min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm disabled:bg-[var(--color-canvas)] disabled:opacity-60"
            >
                {children}
            </select>
        </div>
    )
}