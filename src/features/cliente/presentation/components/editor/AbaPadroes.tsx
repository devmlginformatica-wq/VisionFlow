import type { UseFormRegister } from 'react-hook-form'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import { clienteStrings } from '../../cliente.constants'
import type { ClienteEditorCatalogs } from '../../viewmodels/useClienteEditorViewModel'

interface AbaPadroesProps {
    register: UseFormRegister<ClienteFormValues>
    catalogs: ClienteEditorCatalogs
    catalogsLoading: boolean
}

interface ClienteSelectFieldProps {
    name: 'carrierId' | 'paymentConditionId' | 'paymentMethodId' | 'priceTableId'
    label: string
    register: UseFormRegister<ClienteFormValues>
    options: ReadonlyArray<{ id: number; label: string }>
    disabled: boolean
}

function ClienteSelectField({ name, label, register, options, disabled }: ClienteSelectFieldProps): React.JSX.Element {
    return (
        <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center">
            <label htmlFor={name} className="text-sm font-medium">{label}</label>
            <select disabled={disabled} {...register(name, { setValueAs: (value: string) => value ? Number(value) : null })} id={name} className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm disabled:opacity-60">
                <option value="">Selecione</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
        </div>
    )
}

export function AbaPadroes({ register, catalogs, catalogsLoading }: AbaPadroesProps): React.JSX.Element {
    const disabled = catalogsLoading
    const carrierOptions = catalogs.carriers.map((item) => ({ id: item.id, label: item.nome }))
    const conditionOptions = catalogs.paymentConditions.map((item) => ({ id: item.id, label: item.descricao }))
    const methodOptions = catalogs.paymentMethods.map((item) => ({ id: item.id, label: item.descricao }))
    const tableOptions = catalogs.priceTables.map((item) => ({ id: item.id, label: item.nome }))

    return (
        <div className="space-y-4">
            {catalogsLoading && <p role="status" className="text-sm text-[var(--color-muted)]">{clienteStrings.loadingDefaults}</p>}
            <p className="text-sm text-[var(--color-muted)]">{clienteStrings.defaultsPersisted}</p>
            <ClienteSelectField name="carrierId" label={clienteStrings.carrier} register={register} options={carrierOptions} disabled={disabled} />
            <ClienteSelectField name="paymentConditionId" label={clienteStrings.paymentCondition} register={register} options={conditionOptions} disabled={disabled} />
            <ClienteSelectField name="paymentMethodId" label={clienteStrings.paymentMethod} register={register} options={methodOptions} disabled={disabled} />
            <ClienteSelectField name="priceTableId" label={clienteStrings.priceTable} register={register} options={tableOptions} disabled={disabled} />
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center"><label htmlFor="lastVisit" className="text-sm font-medium">{clienteStrings.lastVisit}</label><input {...register('lastVisit')} id="lastVisit" type="date" className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" /></div>
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center"><label htmlFor="integrationId" className="text-sm font-medium">{clienteStrings.integrationId}</label><input {...register('integrationId')} id="integrationId" readOnly className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 text-sm" /></div>
        </div>
    )
}