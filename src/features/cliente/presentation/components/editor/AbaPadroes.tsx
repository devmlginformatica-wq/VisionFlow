import { Controller } from 'react-hook-form'
import type { Control, UseFormRegister } from 'react-hook-form'
import { SearchableSelect } from '../../../../../core/components/SearchableSelect'
import type { SearchableSelectOption } from '../../../../../core/components/SearchableSelect'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import { clienteStrings } from '../../cliente.constants'
import type { ClienteEditorCatalogs } from '../../viewmodels/useClienteEditorViewModel'

interface AbaPadroesProps {
    control: Control<ClienteFormValues>
    register: UseFormRegister<ClienteFormValues>
    catalogs: ClienteEditorCatalogs
    catalogsLoading: boolean
}

interface ClienteSelectFieldProps {
    name: 'carrierId' | 'paymentConditionId' | 'paymentMethodId' | 'priceTableId'
    label: string
    control: Control<ClienteFormValues>
    options: readonly SearchableSelectOption[]
    disabled: boolean
}

function ClienteSelectField({ name, label, control, options, disabled }: ClienteSelectFieldProps): React.JSX.Element {
    return (
        <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center">
            <label htmlFor={name} className="text-sm font-medium">{label}</label>
            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <SearchableSelect
                        id={name}
                        value={field.value === null ? '' : String(field.value)}
                        onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                        options={options}
                        disabled={disabled}
                        onBlur={field.onBlur}
                        triggerRef={field.ref}
                    />
                )}
            />
        </div>
    )
}

export function AbaPadroes({ control, register, catalogs, catalogsLoading }: AbaPadroesProps): React.JSX.Element {
    const disabled = catalogsLoading
    const carrierOptions = [{ value: '', label: 'Selecione' }, ...catalogs.carriers.map((item) => ({ value: String(item.id), label: item.nome }))]
    const conditionOptions = [{ value: '', label: 'Selecione' }, ...catalogs.paymentConditions.map((item) => ({ value: String(item.id), label: item.descricao }))]
    const methodOptions = [{ value: '', label: 'Selecione' }, ...catalogs.paymentMethods.map((item) => ({ value: String(item.id), label: item.descricao }))]
    const tableOptions = [{ value: '', label: 'Selecione' }, ...catalogs.priceTables.map((item) => ({ value: String(item.id), label: item.nome }))]

    return (
        <div className="space-y-4">
            {catalogsLoading && <p role="status" className="text-sm text-[var(--color-muted)]">{clienteStrings.loadingDefaults}</p>}
            <p className="text-sm text-[var(--color-muted)]">{clienteStrings.defaultsPersisted}</p>
            <ClienteSelectField name="carrierId" label={clienteStrings.carrier} control={control} options={carrierOptions} disabled={disabled} />
            <ClienteSelectField name="paymentConditionId" label={clienteStrings.paymentCondition} control={control} options={conditionOptions} disabled={disabled} />
            <ClienteSelectField name="paymentMethodId" label={clienteStrings.paymentMethod} control={control} options={methodOptions} disabled={disabled} />
            <ClienteSelectField name="priceTableId" label={clienteStrings.priceTable} control={control} options={tableOptions} disabled={disabled} />
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center"><label htmlFor="lastVisit" className="text-sm font-medium">{clienteStrings.lastVisit}</label><input {...register('lastVisit')} id="lastVisit" type="date" className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" /></div>
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center"><label htmlFor="integrationId" className="text-sm font-medium">{clienteStrings.integrationId}</label><input {...register('integrationId')} id="integrationId" readOnly className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 text-sm" /></div>
        </div>
    )
}