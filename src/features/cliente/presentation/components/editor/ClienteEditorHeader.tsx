import { Check, Save, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { clienteRoutes, clienteStrings } from '../../cliente.constants'
import { ClienteEditorActionsMenu } from './ClienteEditorActionsMenu'

interface ClienteEditorHeaderProps {
    clientId: number | null
    saving: boolean
    locked: boolean
    onCancel: () => void
    onDelete: () => void
}

export function ClienteEditorHeader({ clientId, saving, locked, onCancel, onDelete }: ClienteEditorHeaderProps): React.JSX.Element {
    return (
        <header className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0"><Link to={clienteRoutes.list} onClick={(event) => { event.preventDefault(); onCancel() }} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)]">{clienteStrings.title}</Link><h1 className="mt-1 text-xl font-semibold">{clienteStrings.editorTitle}</h1><p className="mt-1 text-xs text-[var(--color-muted)]">{clientId ? `#${clientId}` : clienteStrings.newClient}</p></div>
            <div className="hidden items-center gap-2 md:flex"><button form="cliente-editor-form" type="submit" data-finalize="true" disabled={saving || locked} className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)] disabled:opacity-60"><Check size={16} />{clienteStrings.finish}</button><button form="cliente-editor-form" type="submit" disabled={saving || locked} className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-3 text-sm disabled:opacity-60"><Save size={16} />{clienteStrings.save}</button><button type="button" onClick={onCancel} className="inline-flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-3 text-sm"><X size={16} />{clienteStrings.cancel}</button><ClienteEditorActionsMenu disabled={locked} onDelete={onDelete} /></div>
            <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3 md:hidden"><button form="cliente-editor-form" type="submit" data-finalize="true" disabled={saving || locked} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-2 text-xs font-medium text-[var(--color-primary-foreground)] disabled:opacity-60"><Check size={15} />{clienteStrings.finish}</button><button form="cliente-editor-form" type="submit" disabled={saving || locked} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-2 text-xs disabled:opacity-60"><Save size={15} />{clienteStrings.save}</button><button type="button" onClick={onCancel} aria-label={clienteStrings.cancel} className="flex size-11 items-center justify-center rounded-md border border-[var(--color-border)]"><X size={17} /></button><ClienteEditorActionsMenu disabled={locked} onDelete={onDelete} /></div>
        </header>
    )
}