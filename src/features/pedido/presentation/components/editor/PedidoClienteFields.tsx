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

const labelFieldGrid = 'grid gap-1.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center'

export function PedidoClienteFields({
    form,
    viewModel,
}: PedidoClienteFieldsProps): React.JSX.Element {
    const { register, watch, setValue, formState: { errors } } = form

    const customerId = watch('customerId')

    const selectedAddress = (id: string): number | null => optionId(id)

    return (
        <div className="space-y-4">

            {/* Empresa */}
            <PedidoSelectField
                id="pedido-company"
                label={pedidoStrings.company}
                value={String(watch('companyId') ?? '')}
                onChange={(value) =>
                    setValue('companyId', optionId(value))
                }
                options={[
                    { value: '', label: 'Selecione' },
                    ...viewModel.catalogs.companies.map((company) => ({
                        value: String(company.id),
                        label: company.nome,
                    })),
                ]}
            />

            {/* Cliente */}
            <PedidoCustomerSelect
                customerId={customerId}
                catalogs={viewModel.catalogs}
                setValue={setValue}
                setCustomer={viewModel.setCustomer}
                searchClients={viewModel.searchClients}
                isSearchingClients={viewModel.isSearchingClients}
            />

            {/* Data de emissão */}
            <div className={labelFieldGrid}>
                <label
                    htmlFor="pedido-issueDate"
                    className="text-sm font-medium"
                >
                    {pedidoStrings.issueDate}
                </label>

                <input
                    {...register('issueDate')}
                    id="pedido-issueDate"
                    type="date"
                    readOnly
                    className="h-10 min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 text-sm"
                />
            </div>

            {/* Condição de pagamento / Forma de pagamento */}
            <div className="grid gap-4 md:grid-cols-2">
                <PedidoSelectField
                    id="pedido-condition"
                    label={pedidoStrings.paymentCondition}
                    value={String(watch('paymentConditionId') ?? '')}
                    onChange={(value) =>
                        setValue('paymentConditionId', optionId(value))
                    }
                    options={[
                        { value: '', label: 'Selecione' },
                        ...viewModel.catalogs.paymentConditions.map((entry) => ({
                            value: String(entry.id),
                            label: entry.descricao,
                        })),
                    ]}
                />

                <PedidoSelectField
                    id="pedido-method"
                    label={pedidoStrings.paymentMethod}
                    value={String(watch('paymentMethodId') ?? '')}
                    onChange={(value) =>
                        setValue('paymentMethodId', optionId(value))
                    }
                    options={[
                        { value: '', label: 'Selecione' },
                        ...viewModel.catalogs.paymentMethods.map((entry) => ({
                            value: String(entry.id),
                            label: entry.descricao,
                        })),
                    ]}
                />
            </div>

            {/* Data de entrega */}
            <div className={labelFieldGrid}>
                <label
                    htmlFor="pedido-deliveryDate"
                    className="text-sm font-medium"
                >
                    {pedidoStrings.deliveryDate}
                </label>

                <input
                    {...register('deliveryDate')}
                    id="pedido-deliveryDate"
                    type="date"
                    className="h-10 min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                />
            </div>

            {/* Endereços */}
            <div className="grid gap-4 md:grid-cols-2">
                <PedidoBillingAddress
                    value={watch('billingAddressId')}
                    viewModel={viewModel}
                    disabled={!customerId}
                />

                <PedidoAddressSelect
                    id="delivery"
                    label={pedidoStrings.deliveryAddress}
                    value={watch('deliveryAddressId')}
                    viewModel={viewModel}
                    onChange={(value) =>
                        setValue(
                            'deliveryAddressId',
                            selectedAddress(value),
                        )
                    }
                    disabled={!customerId}
                />

                <PedidoAddressSelect
                    id="collection"
                    label={pedidoStrings.collectionAddress}
                    value={watch('collectionAddressId')}
                    viewModel={viewModel}
                    onChange={(value) =>
                        setValue(
                            'collectionAddressId',
                            selectedAddress(value),
                            { shouldValidate: true },
                        )
                    }
                    disabled={!customerId}
                    error={errors.collectionAddressId?.message}
                />
            </div>

            {/* Transportadora */}
            <PedidoSelectField
                id="pedido-carrier"
                label={pedidoStrings.carrier}
                value={String(watch('carrierId') ?? '')}
                onChange={(value) =>
                    setValue('carrierId', optionId(value))
                }
                options={[
                    { value: '', label: 'Selecione' },
                    ...viewModel.catalogs.carriers.map((entry) => ({
                        value: String(entry.id),
                        label: entry.nome,
                    })),
                ]}
            />
        </div>
    )
}

function PedidoBillingAddress({
    value,
    viewModel,
    disabled,
}: {
    value: number | null
    viewModel: PedidoEditorViewModel
    disabled: boolean
}): React.JSX.Element {
    const address = value === null
        ? undefined
        : viewModel.addresses.find((entry) => entry.id === value)

    const label = address
        ? `${address.street}, ${address.number} · ${address.city}`
        : value === null && !disabled
          ? pedidoStrings.undefinedAddress
        : disabled
          ? pedidoStrings.selectCustomerFirst
          : pedidoStrings.addressUnavailable

    return (
        <div className={labelFieldGrid}>
            <label
                htmlFor="pedido-billing-address"
                className="text-sm font-medium"
            >
                {pedidoStrings.billingAddress}
            </label>

            <input
                id="pedido-billing-address"
                value={label}
                readOnly
                className="h-10 min-w-0 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 text-sm"
            />
        </div>
    )
}

function PedidoAddressSelect({
    id,
    label,
    value,
    viewModel,
    onChange,
    disabled,
    error,
}: {
    id: string
    label: string
    value: number | null
    viewModel: PedidoEditorViewModel
    onChange: (value: string) => void
    disabled: boolean
    error?: string
}): React.JSX.Element {
    return (
        <PedidoSelectField
            id={`pedido-${id}-address`}
            label={label}
            value={String(value ?? '')}
            onChange={onChange}
            disabled={disabled}
            error={error}
            options={[
                {
                    value: '',
                    label: disabled
                        ? pedidoStrings.selectCustomerFirst
                        : value === null
                          ? pedidoStrings.undefinedAddress
                          : pedidoStrings.addressUnavailable,
                },
                ...viewModel.addresses.map((address) => ({
                    value: String(address.id),
                    label: `${address.street}, ${address.number} · ${address.city}`,
                })),
            ]}
        />
    )
}