import { useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { ItemPedido } from '../../../domain/entities/ItemPedido'
import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import { itemPedidoSchema } from '../../../domain/validators/itemPedidoSchema'
import { pedidoStrings } from '../../pedido.constants'
import type { ItemPedidoEditValues } from './itemPedidoModal.types'
import { ItemAdditionalData } from './ItemAdditionalData'
import { ItemEditFields } from './ItemEditFields'
import { ItemPriceTable } from './ItemPriceTable'

interface EditarItemModalProps {
    item: ItemPedido | null
    priceTables: PedidoEditorViewModel['catalogs']['priceTables']
    onOpenChange: (open: boolean) => void
    onSave: (item: ItemPedido) => void
    onDelete: (sequence: number) => void
}

export function EditarItemModal({ item, priceTables, onOpenChange, onSave, onDelete }: EditarItemModalProps): React.JSX.Element {
    const form = useForm<ItemPedidoEditValues>({ resolver: zodResolver(itemPedidoSchema), defaultValues: { quantity: 1, salePrice: 0, discountAmount: 0, priceTableId: 1, observation: '', customerCode: '' } })
    const { register, reset, handleSubmit, control, formState: { isSubmitting } } = form
    const priceTableId = useWatch({ control, name: 'priceTableId' })

    useEffect(() => {
        if (item) reset({ quantity: item.quantity, salePrice: item.salePrice, discountAmount: item.discountAmount, priceTableId: item.priceTableId, observation: item.observation, customerCode: item.customerCode })
    }, [item, reset])

    function submit(values: ItemPedidoEditValues): void {
        if (!item) return
        const table = priceTables.find((entry) => entry.id === values.priceTableId)
        onSave({ ...item, ...values, priceTableName: table?.nome ?? item.priceTableName, priceTableValidity: table?.vigencia ?? item.priceTableValidity, total: values.quantity * values.salePrice - values.discountAmount })
    }

    function stopSubmitPropagation(event: React.FormEvent<HTMLFormElement>): void {
        event.stopPropagation()
        void handleSubmit(submit)(event)
    }

    return (
        <Dialog.Root open={item !== null} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--color-overlay)]" /><Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-[var(--color-foreground)] shadow-xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[88dvh] md:w-[min(54rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md">
            <Dialog.Title className="mb-4 text-lg font-semibold">{pedidoStrings.itemTitle}</Dialog.Title>{item && <form onSubmit={stopSubmitPropagation} className="space-y-5"><ItemEditFields register={register} control={control} priceTables={priceTables} /><ItemAdditionalData product={item.product} /><ItemPriceTable selectedId={priceTableId} tables={priceTables} /><div className="flex justify-between border-t border-[var(--color-border)] pt-4"><button type="button" onClick={() => { onDelete(item.sequence); onOpenChange(false) }} className="h-10 rounded-md px-3 text-sm text-[var(--color-danger)]">Remover item</button><div className="flex gap-2"><Dialog.Close asChild><button type="button" className="h-10 rounded-md border border-[var(--color-border)] px-4 text-sm">{pedidoStrings.cancel}</button></Dialog.Close><button type="submit" disabled={isSubmitting} className="h-10 rounded-md bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)]">{pedidoStrings.save}</button></div></div></form>}
            <Dialog.Description className="sr-only">Edite as informações comerciais do item selecionado.</Dialog.Description>
        </Dialog.Content></Dialog.Portal></Dialog.Root>
    )
}