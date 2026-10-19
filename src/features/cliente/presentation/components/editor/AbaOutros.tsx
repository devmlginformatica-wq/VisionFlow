import type { FieldError, UseFormRegister } from 'react-hook-form'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import { clienteStrings } from '../../cliente.constants'

interface AbaOutrosProps {
    register: UseFormRegister<ClienteFormValues>
    error?: FieldError
}

export function AbaOutros({ register, error }: AbaOutrosProps): React.JSX.Element {
    return (
        <div className="space-y-4">
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center"><label htmlFor="creditLimit" className="text-sm font-medium">{clienteStrings.creditLimit}</label><input {...register('creditLimit', { valueAsNumber: true })} id="creditLimit" type="number" min="0" step="0.01" aria-invalid={Boolean(error)} className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />{error?.message && <p className="text-xs text-[var(--color-danger)] md:col-start-2">{error.message}</p>}</div>
            <p className="text-sm text-[var(--color-muted)]">{clienteStrings.userNotesPersisted}</p>
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-start"><label htmlFor="userNotes" className="pt-2 text-sm font-medium">{clienteStrings.userNotes}</label><textarea {...register('userNotes')} id="userNotes" rows={4} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm" /></div>
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-start"><label htmlFor="erpNotes" className="pt-2 text-sm font-medium">{clienteStrings.erpNotes}</label><textarea {...register('erpNotes')} id="erpNotes" rows={4} className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm" /></div>
        </div>
    )
}