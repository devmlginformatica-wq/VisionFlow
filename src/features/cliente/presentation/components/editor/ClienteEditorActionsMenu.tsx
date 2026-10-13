import * as Dialog from '@radix-ui/react-dialog'
import { MoreVertical, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { shellRoutes } from '../../../../../core/shell/shell.constants'
import { clienteStrings } from '../../cliente.constants'

interface ClienteEditorActionsMenuProps {
    onDelete: () => void
}

const actions = [
    { label: 'Incluir pedido', path: shellRoutes.orders },
    { label: 'Incluir orçamento', path: shellRoutes.budget },
    { label: 'Incluir tarefa', path: shellRoutes.tasks },
    { label: 'Incluir rota', path: shellRoutes.agenda },
    { label: 'Ver pedidos', path: shellRoutes.orders },
    { label: 'Ver tarefas', path: shellRoutes.tasks },
]

export function ClienteEditorActionsMenu({ onDelete }: ClienteEditorActionsMenuProps): React.JSX.Element {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild><button type="button" aria-label={clienteStrings.actions} className="flex size-10 items-center justify-center rounded-md border border-[var(--color-border)] hover:bg-[var(--color-canvas)]"><MoreVertical size={18} /></button></Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--color-overlay)]" />
                <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-[var(--color-foreground)] shadow-xl md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(26rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md">
                    <div className="mb-4 flex items-center justify-between"><Dialog.Title className="text-base font-semibold">{clienteStrings.actions}</Dialog.Title><Dialog.Close aria-label="Fechar ações" className="rounded-md p-2 hover:bg-[var(--color-canvas)]"><X size={18} /></Dialog.Close></div>
                    <div className="grid grid-cols-2 gap-1">{actions.map((action) => <Dialog.Close key={action.label} asChild><Link to={action.path} className="rounded-md px-3 py-2.5 text-left text-sm hover:bg-[var(--color-canvas)]">{action.label}</Link></Dialog.Close>)}</div>
                    <Dialog.Close asChild><button type="button" onClick={onDelete} className="mt-3 w-full rounded-md px-3 py-2.5 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]">{clienteStrings.delete}</button></Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}