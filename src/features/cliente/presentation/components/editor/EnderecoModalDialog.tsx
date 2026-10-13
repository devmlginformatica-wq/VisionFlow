import * as Dialog from '@radix-ui/react-dialog'
import type { FormEventHandler } from 'react'
import type { UseFormRegister } from 'react-hook-form'
import { clienteStrings } from '../../cliente.constants'
import type { EnderecoFormValues } from './EnderecoFormValues'
import { EnderecoModalActions } from './EnderecoModalActions'
import { EnderecoModalFields } from './EnderecoModalFields'
import { EnderecoModalHeader } from './EnderecoModalHeader'

interface EnderecoModalDialogProps {
    open: boolean
    register: UseFormRegister<EnderecoFormValues>
    onSubmit: FormEventHandler<HTMLFormElement>
    submitting: boolean
    error: string | null
    onOpenChange: (open: boolean) => void
    onLookupZipCode: () => void
}

export function EnderecoModalDialog(props: EnderecoModalDialogProps): React.JSX.Element {
    const { open, register, onSubmit, submitting, error, onOpenChange, onLookupZipCode } = props

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--color-overlay)]" />
                <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-[var(--color-foreground)] shadow-xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[88dvh] md:w-[min(46rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md">
                    <EnderecoModalHeader />
                    <form onSubmit={onSubmit} className="space-y-4">
                        <EnderecoModalFields register={register} onLookupZipCode={onLookupZipCode} />
                        {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
                        <EnderecoModalActions submitting={submitting} />
                    </form>
                    <Dialog.Description className="sr-only">{clienteStrings.addressTitle}</Dialog.Description>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}