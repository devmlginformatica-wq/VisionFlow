import type { UseFormRegister } from 'react-hook-form'
import type { PedidoFormValues } from '../../../domain/validators/pedidoSchema'

interface PedidoFieldProps {
    name: keyof PedidoFormValues
    label: string
    register: UseFormRegister<PedidoFormValues>
    type?: string
    readOnly?: boolean
    numeric?: boolean
    onNumberChange?: (value: number) => void
}

export function PedidoField({ name, label, register, type = 'text', readOnly = false, numeric = false, onNumberChange }: PedidoFieldProps): React.JSX.Element {
    const field = register(name, numeric ? { valueAsNumber: true } : undefined)
    return (
        <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center">
            <label htmlFor={`pedido-${name}`} className="text-sm font-medium">{label}</label>
            <input {...field} onChange={(event) => { void field.onChange(event); onNumberChange?.(Number(event.currentTarget.value)) }} id={`pedido-${name}`} type={type} readOnly={readOnly} className="h-10 min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] read-only:bg-[var(--color-canvas)]" />
        </div>
    )
}