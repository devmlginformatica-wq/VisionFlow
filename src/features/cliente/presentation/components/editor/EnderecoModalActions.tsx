import * as Dialog from '@radix-ui/react-dialog'
import { clienteStrings } from '../../cliente.constants'

interface EnderecoModalActionsProps {
    submitting: boolean
}

export function EnderecoModalActions({ submitting }: EnderecoModalActionsProps): React.JSX.Element {
    return (
        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
            <Dialog.Close asChild><button type="button" className="h-10 rounded-md border border-[var(--color-border)] px-4 text-sm">{clienteStrings.cancel}</button></Dialog.Close>
            <button type="submit" disabled={submitting} className="h-10 rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)] disabled:opacity-60">{clienteStrings.save}</button>
        </div>
    )
}