import * as Tabs from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'
import { pedidoStrings } from '../../pedido.constants'

interface PedidoEditorTabsProps {
    data: ReactNode
    products: ReactNode
    completion: ReactNode
}

const tabs = [
    { value: 'data', label: pedidoStrings.data },
    { value: 'products', label: pedidoStrings.products },
    { value: 'completion', label: pedidoStrings.completion },
]

export function PedidoEditorTabs({ data, products, completion }: PedidoEditorTabsProps): React.JSX.Element {
    return (
        <Tabs.Root defaultValue="data" className="mt-4"><Tabs.List aria-label="Seções do pedido" className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)]">{tabs.map((tab) => <Tabs.Trigger key={tab.value} value={tab.value} className="shrink-0 border-b-2 border-transparent px-4 py-3 text-sm text-[var(--color-muted)] data-[state=active]:border-[var(--color-primary)] data-[state=active]:font-semibold data-[state=active]:text-[var(--color-primary)]">{tab.label}</Tabs.Trigger>)}</Tabs.List><div className="py-5 pb-24 md:pb-8"><Tabs.Content value="data">{data}</Tabs.Content><Tabs.Content value="products">{products}</Tabs.Content><Tabs.Content value="completion">{completion}</Tabs.Content></div></Tabs.Root>
    )
}