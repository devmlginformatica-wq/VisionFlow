import { Controller } from 'react-hook-form'
import type { UseFormRegister } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { ItemPedidoEditValues } from './itemPedidoModal.types'
import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import { pedidoStrings } from '../../pedido.constants'
import { SearchableSelect } from '../../../../../core/components/SearchableSelect'

interface ItemEditFieldsProps {
    register: UseFormRegister<ItemPedidoEditValues>
    control: Control<ItemPedidoEditValues>
    priceTables: PedidoEditorViewModel['catalogs']['priceTables']
}

export function ItemEditFields({ register, control, priceTables }: ItemEditFieldsProps): React.JSX.Element {
    return (
        <section className="space-y-3">
            <h3 className="text-sm font-semibold">{pedidoStrings.generalInfo}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs">
                    {pedidoStrings.quantity}
                    <input {...register('quantity', { valueAsNumber: true })} type="number" min="1" className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
                </label>
                <label className="space-y-1 text-xs">
                    {pedidoStrings.unitPrice}
                    <input {...register('salePrice', { valueAsNumber: true })} type="number" readOnly className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 text-sm" />
                </label>
                <label className="space-y-1 text-xs">
                    {pedidoStrings.discount}
                    <input {...register('discountAmount', { valueAsNumber: true })} type="number" min="0" step="0.01" className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
                </label>
                <label className="space-y-1 text-xs">
                    {pedidoStrings.customerCode}
                    <input {...register('customerCode')} className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" />
                </label>
                <label className="space-y-1 text-xs sm:col-span-2">
                    {pedidoStrings.priceTable}
                    <Controller
                        control={control}
                        name="priceTableId"
                        render={({ field }) => (
                            <SearchableSelect
                                id="item-price-table"
                                value={String(field.value)}
                                onValueChange={(value) => field.onChange(Number(value))}
                                options={priceTables.map((table) => ({
                                    value: String(table.id),
                                    label: table.nome,
                                }))}
                                onBlur={field.onBlur}
                                triggerRef={field.ref}
                            />
                        )}
                    />
                </label>
                <label className="space-y-1 text-xs sm:col-span-2">
                    Observação
                    <textarea {...register('observation')} rows={2} className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm" />
                </label>
            </div>
        </section>
    )
}