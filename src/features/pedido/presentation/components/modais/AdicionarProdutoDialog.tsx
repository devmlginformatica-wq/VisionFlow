import * as Dialog from '@radix-ui/react-dialog'
import type { UseFormRegister } from 'react-hook-form'
import type { ProductSelectionValues, ProductSelectionProduct } from './productModal.types'
import { pedidoStrings } from '../../pedido.constants'
import { ProdutoPickerFields } from './ProdutoPickerFields'

interface AdicionarProdutoDialogProps {
    open: boolean
    register: UseFormRegister<ProductSelectionValues>
    onSubmit: React.FormEventHandler<HTMLFormElement>
    search: string
    onSearchChange: (search: string) => void
    family: string
    onFamilyChange: (family: string) => void
    families: string[]
    brand: string
    onBrandChange: (brand: string) => void
    brands: string[]
    selectedId: number | null
    onSelect: (id: number) => void
    quantity: number
    onQuantityChange: (delta: number) => void
    products: readonly ProductSelectionProduct[]
    error: string | undefined
    onOpenChange: (open: boolean) => void
}

export function AdicionarProdutoDialog(props: AdicionarProdutoDialogProps): React.JSX.Element {
    const { open, register, onSubmit, search, onSearchChange, family, onFamilyChange, families, brand, onBrandChange, brands, selectedId, onSelect, quantity, onQuantityChange, products, error, onOpenChange } = props

    function submit(event: React.FormEvent<HTMLFormElement>): void {
        event.stopPropagation()
        onSubmit(event)
    }
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--color-overlay)]" /><Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-[var(--color-foreground)] shadow-xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[85dvh] md:w-[min(36rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md">
                <Dialog.Title className="mb-4 text-lg font-semibold">{pedidoStrings.productTitle}</Dialog.Title><form onSubmit={submit} className="space-y-4"><div className="grid grid-cols-2 gap-2"><label className="space-y-1 text-xs">{pedidoStrings.family}<select value={family} onChange={(event) => onFamilyChange(event.target.value)} className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"><option value="all">Todas</option>{families.map((option) => <option key={option}>{option}</option>)}</select></label><label className="space-y-1 text-xs">{pedidoStrings.brand}<select value={brand} onChange={(event) => onBrandChange(event.target.value)} className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"><option value="all">Todas</option>{brands.map((option) => <option key={option}>{option}</option>)}</select></label></div><ProdutoPickerFields register={register} search={search} onSearchChange={onSearchChange} selectedId={selectedId} onSelect={onSelect} quantity={quantity} onQuantityChange={onQuantityChange} products={products} />{error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}<div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4"><Dialog.Close asChild><button type="button" className="h-10 rounded-md border border-[var(--color-border)] px-4 text-sm">{pedidoStrings.cancel}</button></Dialog.Close><button type="submit" disabled={!selectedId} className="h-10 rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] disabled:opacity-50">{pedidoStrings.addProduct}</button></div></form><Dialog.Description className="sr-only">Selecione o produto e a quantidade desejada.</Dialog.Description>
            </Dialog.Content></Dialog.Portal>
        </Dialog.Root>
    )
}