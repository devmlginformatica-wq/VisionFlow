import { Minus, Plus, Search } from 'lucide-react'
import type { UseFormRegister } from 'react-hook-form'
import { pedidoStrings } from '../../pedido.constants'
import type { ProductSelectionProduct, ProductSelectionValues } from './productModal.types'

interface ProdutoPickerFieldsProps {
    register: UseFormRegister<ProductSelectionValues>
    search: string
    onSearchChange: (search: string) => void
    selectedId: number | null
    onSelect: (id: number) => void
    onQuantityChange: (delta: number) => void
    quantity: number
    products: ReadonlyArray<ProductSelectionProduct>
}

export function ProdutoPickerFields(props: ProdutoPickerFieldsProps): React.JSX.Element {
    const { register, search, onSearchChange, selectedId, onSelect, onQuantityChange, quantity, products } = props
    return (
        <>
            <label className="flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-3"><Search size={16} className="text-[var(--color-muted)]" /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={pedidoStrings.productSearch} aria-label={pedidoStrings.productSearch} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
            <div className="max-h-64 divide-y divide-[var(--color-border)] overflow-y-auto rounded-md border border-[var(--color-border)]">{products.map((product) => <button key={product.id} type="button" onClick={() => onSelect(product.id)} aria-pressed={selectedId === product.id} className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 p-3 text-left text-sm hover:bg-[var(--color-canvas)] aria-pressed:bg-[var(--color-primary-soft)]"><span className="min-w-0"><span className="block truncate font-medium">{product.description}</span><span className="mt-1 block text-xs text-[var(--color-muted)]">{product.code} · {product.brand} · {product.unit}</span></span><span className="text-right text-xs font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.salePrice)}<span className="mt-1 block font-normal text-[var(--color-muted)]">{product.family}</span></span></button>)}</div>
            <input type="hidden" {...register('productId', { valueAsNumber: true })} />
            <div className="flex items-center justify-between"><span className="text-sm font-medium">{pedidoStrings.quantity}</span><div className="flex items-center gap-3"><button type="button" aria-label="Diminuir quantidade" onClick={() => onQuantityChange(-1)} className="flex size-9 items-center justify-center rounded-md border border-[var(--color-border)]"><Minus size={16} /></button><span className="min-w-8 text-center text-sm font-semibold">{quantity}</span><button type="button" aria-label="Aumentar quantidade" onClick={() => onQuantityChange(1)} className="flex size-9 items-center justify-center rounded-md border border-[var(--color-border)]"><Plus size={16} /></button></div></div>
        </>
    )
}