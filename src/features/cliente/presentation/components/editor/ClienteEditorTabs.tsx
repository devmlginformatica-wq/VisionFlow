import * as Tabs from '@radix-ui/react-tabs'
import { clienteStrings } from '../../cliente.constants'

interface ClienteEditorTabsProps {
    children: React.ReactNode
    value: string
    onValueChange: (value: string) => void
}

const tabs = [
    { value: 'general', label: clienteStrings.generalData },
    { value: 'addresses', label: clienteStrings.addresses },
    { value: 'defaults', label: clienteStrings.defaults },
    { value: 'titles', label: clienteStrings.titles },
    { value: 'other', label: clienteStrings.other },
]

export function ClienteEditorTabs({ children, value, onValueChange }: ClienteEditorTabsProps): React.JSX.Element {
    return (
        <Tabs.Root value={value} onValueChange={onValueChange} className="mt-4">
            <Tabs.List aria-label="Seções do cadastro de cliente" className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)]">
                {tabs.map((tab) => <Tabs.Trigger key={tab.value} value={tab.value} className="shrink-0 border-b-2 border-transparent px-4 py-3 text-sm text-[var(--color-muted)] data-[state=active]:border-[var(--color-primary)] data-[state=active]:font-semibold data-[state=active]:text-[var(--color-primary)]">{tab.label}</Tabs.Trigger>)}
            </Tabs.List>
            <div className="py-5 pb-24 md:pb-8">{children}</div>
        </Tabs.Root>
    )
}