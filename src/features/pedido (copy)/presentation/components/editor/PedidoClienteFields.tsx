import type { UseFormReturn } from 'react-hook-form'
import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import type { PedidoFormValues } from '../../../domain/validators/pedidoSchema'
import { pedidoStrings } from '../../pedido.constants'
import { PedidoSelectField } from './PedidoSelectField'
import { PedidoCustomerSelect } from './PedidoCustomerSelect'

interface PedidoClienteFieldsProps {
    form: UseFormReturn<PedidoFormValues>
    viewModel: PedidoEditorViewModel
}

function optionId(value: string): number | null {
    return value ? Number(value) : null
}

export function PedidoClienteFields({ form, viewModel }: PedidoClienteFieldsProps): React.JSX.Element {
    const { register, watch, setValue } = form
    const customerId = watch('customerId')
    const selectedAddress = (id: string): number | null => optionId(id)

    return (
        <div className="space-y-4">
            <PedidoSelectField id="pedido-company" label={pedidoStrings.company} value={String(watch('companyId') ?? '')} onChange={(value) => setValue('companyId', optionId(value))}><option value="">Selecione</option>{viewModel.catalogs.companies.map((company) => <option key={company.id} value={company.id}>{company.nome}</option>)}</PedidoSelectField>
            <PedidoCustomerSelect customerId={customerId} catalogs={viewModel.catalogs} setValue={setValue} setCustomer={viewModel.setCustomer} />
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center"><label htmlFor="pedido-issueDate" className="text-sm font-medium">{pedidoStrings.issueDate}</label><input {...register('issueDate')} id="pedido-issueDate" type="date" readOnly className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 text-sm" /></div>
            <div className="grid gap-4 md:grid-cols-2"><PedidoSelectField id="pedido-condition" label={pedidoStrings.paymentCondition} value={String(watch('paymentConditionId') ?? '')} onChange={(value) => setValue('paymentConditionId', optionId(value))}><option value="">Selecione</option>{viewModel.catalogs.paymentConditions.map((entry) => <option key={entry.id} value={entry.id}>{entry.descricao}</option>)}</PedidoSelectField><PedidoSelectField id="pedido-method" label={pedidoStrings.paymentMethod} value={String(watch('paymentMethodId') ?? '')} onChange={(value) => setValue('paymentMethodId', optionId(value))}><option value="">Selecione</option>{viewModel.catalogs.paymentMethods.map((entry) => <option key={entry.id} value={entry.id}>{entry.descricao}</option>)}</PedidoSelectField></div>
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center"><label htmlFor="pedido-deliveryDate" className="text-sm font-medium">{pedidoStrings.deliveryDate}</label><input {...register('deliveryDate')} id="pedido-deliveryDate" type="date" className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" /></div>
            <div className="grid gap-4 md:grid-cols-2"><PedidoBillingAddress value={watch('billingAddressId')} viewModel={viewModel} disabled={!customerId} /><PedidoAddressSelect id="delivery" label={pedidoStrings.deliveryAddress} value={watch('deliveryAddressId')} viewModel={viewModel} onChange={(value) => setValue('deliveryAddressId', selectedAddress(value))} disabled={!customerId} /><PedidoAddressSelect id="collection" label={pedidoStrings.collectionAddress} value={watch('collectionAddressId')} viewModel={viewModel} onChange={(value) => setValue('collectionAddressId', selectedAddress(value))} disabled={!customerId} /></div>
            <PedidoSelectField id="pedido-carrier" label={pedidoStrings.carrier} value={String(watch('carrierId') ?? '')} onChange={(value) => setValue('carrierId', optionId(value))}><option value="">Selecione</option>{viewModel.catalogs.carriers.map((entry) => <option key={entry.id} value={entry.id}>{entry.nome}</option>)}</PedidoSelectField>
        </div>
    )
}

function PedidoBillingAddress({ value, viewModel, disabled }: { value: number | null; viewModel: PedidoEditorViewModel; disabled: boolean }): React.JSX.Element {
    const address = viewModel.addresses.find((entry) => entry.id === value) ?? viewModel.addresses[0]
    const label = address ? `${address.street}, ${address.number} · ${address.city}` : disabled ? 'Selecione um cliente primeiro' : 'Endereço indisponível'
    return <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center"><label htmlFor="pedido-billing-address" className="text-sm font-medium">{pedidoStrings.billingAddress}</label><input id="pedido-billing-address" value={label} readOnly className="h-10 min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 text-sm" /></div>
}

function PedidoAddressSelect({ id, label, value, viewModel, onChange, disabled }: { id: string; label: string; value: number | null; viewModel: PedidoEditorViewModel; onChange: (value: string) => void; disabled: boolean }): React.JSX.Element {
    return <PedidoSelectField id={`pedido-${id}-address`} label={label} value={String(value ?? '')} onChange={onChange} disabled={disabled}><option value="">{disabled ? 'Selecione um cliente primeiro' : 'Selecione'}</option>{viewModel.addresses.map((address) => <option key={address.id} value={address.id}>{address.street}, {address.number} · {address.city}</option>)}</PedidoSelectField>
}