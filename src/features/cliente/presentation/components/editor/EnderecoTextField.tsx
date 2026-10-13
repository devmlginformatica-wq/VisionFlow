import type { UseFormRegister } from 'react-hook-form'
import type { EnderecoFormValues } from './EnderecoFormValues'

interface EnderecoTextFieldProps {
    name: keyof EnderecoFormValues
    label: string
    register: UseFormRegister<EnderecoFormValues>
    required?: boolean
    multiline?: boolean
}

export function EnderecoTextField({ name, label, register, required = false, multiline = false }: EnderecoTextFieldProps): React.JSX.Element {
    const style = 'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]'
    return (
        <div className="space-y-1.5">
            <label htmlFor={`address-${name}`} className="text-xs font-medium">{label}{required && ' *'}</label>
            {multiline ? <textarea {...register(name)} id={`address-${name}`} rows={3} className={`${style} min-h-20 py-2`} /> : <input {...register(name)} id={`address-${name}`} className={`${style} h-10`} />}
        </div>
    )
}