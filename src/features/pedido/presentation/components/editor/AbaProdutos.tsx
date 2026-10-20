import { useState } from 'react'
import { Plus } from 'lucide-react'
import { VfEmpty } from '../../../../../core/components/VfEmpty'
import type { ItemPedido } from '../../../domain/entities/ItemPedido'
import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import { pedidoStrings } from '../../pedido.constants'
import { AdicionarProdutoModal } from '../modais/AdicionarProdutoModal'
import { EditarItemModal } from '../modais/EditarItemModal'
import { PedidoItensTable } from './PedidoItensTable'

interface AbaProdutosProps {
    viewModel: PedidoEditorViewModel
}

export function AbaProdutos({ viewModel }: AbaProdutosProps): React.JSX.Element {
    const [addOpen, setAddOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ItemPedido | null>(null)

    function addItem(item: ItemPedido): void { viewModel.adicionarItem(item); setAddOpen(false) }
    function updateItem(item: ItemPedido): void { viewModel.atualizarItem(item); setEditingItem(null) }

    return (
        <section className="space-y-4">
            <header className="flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold">{pedidoStrings.products}</h2><p className="mt-1 text-xs text-[var(--color-muted)]">{viewModel.itens.length} itens</p></div><button type="button" onClick={() => setAddOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)]"><Plus size={17} />{pedidoStrings.addProduct}</button></header>
            {viewModel.itens.length === 0 ? <VfEmpty title={pedidoStrings.noProducts} description="Adicione produtos para compor este documento." actionLabel={pedidoStrings.addProduct} onAction={() => setAddOpen(true)} /> : <PedidoItensTable items={viewModel.itens} onEdit={setEditingItem} />}
            <AdicionarProdutoModal open={addOpen} products={viewModel.catalogs.products} priceTables={viewModel.catalogs.priceTables} nextSequence={viewModel.itens.length + 1} onOpenChange={setAddOpen} onAdd={addItem} onSearchProducts={viewModel.searchProducts} isSearchingProducts={viewModel.isSearchingProducts} productSearchError={viewModel.productSearchError} />
            <EditarItemModal item={editingItem} priceTables={viewModel.catalogs.priceTables} onOpenChange={(open) => { if (!open) setEditingItem(null) }} onSave={updateItem} onDelete={(sequence) => viewModel.removerItem(sequence)} />
        </section>
    )
}