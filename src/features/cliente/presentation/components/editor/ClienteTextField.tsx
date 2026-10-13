import type { FieldError, UseFormRegister } from 'react-hook-form'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'

interface ClienteTextFieldProps {
    name: keyof ClienteFormValues
    label: string
    register: UseFormRegister<ClienteFormValues>
    error?: FieldError
    type?: string
    required?: boolean
    readOnly?: boolean
    multiline?: boolean
}

export function ClienteTextField({ name, label, register, error, type = 'text', required = false, readOnly = false, multiline = false }: ClienteTextFieldProps): React.JSX.Element {
    const commonClass = 'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:opacity-60'
    return (
        <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center">
            <label htmlFor={name} className="text-sm font-medium">{label}{required && <span aria-hidden="true"> *</span>}</label>
            {multiline ? <textarea {...register(name)} id={name} readOnly={readOnly} aria-invalid={Boolean(error)} rows={3} className={`${commonClass} min-h-24 py-2`} /> : <input {...register(name)} id={name} type={type} readOnly={readOnly} aria-invalid={Boolean(error)} className={`${commonClass} h-10`} />}
            {error?.message && <p role="alert" className="text-xs text-[var(--color-danger)] md:col-start-2">{error.message}</p>}
        </div>
    )
}