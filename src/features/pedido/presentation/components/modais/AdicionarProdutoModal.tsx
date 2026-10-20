import { useEffect, useMemo, useState } from 'react'
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
    onSearchProducts: PedidoEditorViewModel['searchProducts']
    isSearchingProducts: boolean
    productSearchError: string | null
}

export function AdicionarProdutoModal({ open, products, priceTables, nextSequence, onOpenChange, onAdd, onSearchProducts, isSearchingProducts, productSearchError }: AdicionarProdutoModalProps): React.JSX.Element {
    const [search, setSearch] = useState('')
    const [family, setFamily] = useState('all')
    const [brand, setBrand] = useState('all')
    const [selectedProduct, setSelectedProduct] = useState<PedidoEditorViewModel['catalogs']['products'][number] | null>(null)
    const form = useForm<ProductSelectionValues>({ resolver: zodResolver(productSelectionSchema), defaultValues: { productId: 0, quantity: 1 } })
    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = form
    const filteredProducts = useMemo(() => {
        const filtered = products.filter((product) => (family === 'all' || product.family === family) && (brand === 'all' || product.brand === brand))
        return selectedProduct && (family === 'all' || selectedProduct.family === family) && (brand === 'all' || selectedProduct.brand === brand) && !filtered.some((product) => product.id === selectedProduct.id)
            ? [selectedProduct, ...filtered]
            : filtered
    }, [brand, family, products, selectedProduct])
    const productId = useWatch({ control, name: 'productId' })
    const quantity = useWatch({ control, name: 'quantity' })

    useEffect(() => {
        const timeout = window.setTimeout(() => { void onSearchProducts(search) }, 300)
        return () => window.clearTimeout(timeout)
    }, [onSearchProducts, search])

    function selectProduct(id: number): void {
        setSelectedProduct(products.find((product) => product.id === id) ?? selectedProduct)
        setValue('productId', id, { shouldValidate: true })
    }

    function submit(values: ProductSelectionValues): void {
        const availableProducts = selectedProduct && !products.some((product) => product.id === selectedProduct.id)
            ? [selectedProduct, ...products]
            : products
        const item = createOrderItem({ values, products: availableProducts, priceTables, sequence: nextSequence })
        if (item) onAdd(item)
    }

    const families = [...new Set(products.map((product) => product.family))]
    const brands = [...new Set(products.map((product) => product.brand))]
    function handleOpenChange(nextOpen: boolean): void {
        setSelectedProduct(null)
        reset({ productId: 0, quantity: 1 })
        setSearch('')
        setFamily('all')
        setBrand('all')
        onOpenChange(nextOpen)
    }

    return <AdicionarProdutoDialog open={open} register={register} onSubmit={handleSubmit(submit)} search={search} onSearchChange={setSearch} family={family} onFamilyChange={setFamily} families={families} brand={brand} onBrandChange={setBrand} brands={brands} selectedId={productId || null} onSelect={selectProduct} quantity={quantity} onQuantityChange={(delta) => setValue('quantity', Math.max(1, quantity + delta), { shouldValidate: true })} products={filteredProducts} error={errors.quantity?.message} isSearching={isSearchingProducts} searchError={productSearchError} onOpenChange={handleOpenChange} />
}