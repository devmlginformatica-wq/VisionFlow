import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { ItemPedido } from '../../../domain/entities/ItemPedido'
import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import { productSelectionSchema } from '../../../domain/validators/itemPedidoSchema'
import { AdicionarProdutoDialog } from './AdicionarProdutoDialog'
import { createOrderItem } from '../../createOrderItem'
import type { ProductSelectionValues } from './productModal.types'

interface AdicionarProdutoModalProps {
    open: boolean
    products: PedidoEditorViewModel['catalogs']['products']
    priceTables: PedidoEditorViewModel['catalogs']['priceTables']
    nextSequence: number
    onOpenChange: (open: boolean) => void
    onAdd: (item: ItemPedido) => void
}

export function AdicionarProdutoModal({ open, products, priceTables, nextSequence, onOpenChange, onAdd }: AdicionarProdutoModalProps): React.JSX.Element {
    const [search, setSearch] = useState('')
    const [family, setFamily] = useState('all')
    const [brand, setBrand] = useState('all')
    const form = useForm<ProductSelectionValues>({ resolver: zodResolver(productSelectionSchema), defaultValues: { productId: 0, quantity: 1 } })
    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = form
    const filteredProducts = useMemo(() => products.filter((product) => `${product.code} ${product.description}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')) && (family === 'all' || product.family === family) && (brand === 'all' || product.brand === brand)), [brand, family, products, search])
    const productId = useWatch({ control, name: 'productId' })
    const quantity = useWatch({ control, name: 'quantity' })

    function selectProduct(id: number): void { setValue('productId', id, { shouldValidate: true }) }

    function submit(values: ProductSelectionValues): void {
        const item = createOrderItem({ values, products, priceTables, sequence: nextSequence })
        if (item) onAdd(item)
    }

    const families = [...new Set(products.map((product) => product.family))]
    const brands = [...new Set(products.map((product) => product.brand))]
    function handleOpenChange(nextOpen: boolean): void {
        if (nextOpen) {
            reset({ productId: 0, quantity: 1 })
            setSearch('')
            setFamily('all')
            setBrand('all')
        }
        onOpenChange(nextOpen)
    }

    return <AdicionarProdutoDialog open={open} register={register} onSubmit={handleSubmit(submit)} search={search} onSearchChange={setSearch} family={family} onFamilyChange={setFamily} families={families} brand={brand} onBrandChange={setBrand} brands={brands} selectedId={productId || null} onSelect={selectProduct} quantity={quantity} onQuantityChange={(delta) => setValue('quantity', Math.max(1, quantity + delta), { shouldValidate: true })} products={filteredProducts} error={errors.quantity?.message} onOpenChange={handleOpenChange} />
}