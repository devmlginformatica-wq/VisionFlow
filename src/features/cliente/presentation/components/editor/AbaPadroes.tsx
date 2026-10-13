import carrierMock from '../../../../../mocks/transportadoras/listar.json'
import paymentConditionsMock from '../../../../../mocks/condicoes_pagamento/listar.json'
import paymentMethodsMock from '../../../../../mocks/formas_pagamento/listar.json'
import priceTablesMock from '../../../../../mocks/tabelas_preco/listar.json'
import type { UseFormRegister } from 'react-hook-form'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import { clienteStrings } from '../../cliente.constants'

interface AbaPadroesProps {
    register: UseFormRegister<ClienteFormValues>
}

interface ClienteSelectFieldProps {
    name: 'carrierId' | 'paymentConditionId' | 'paymentMethodId' | 'priceTableId'
    label: string
    register: UseFormRegister<ClienteFormValues>
    options: ReadonlyArray<{ id: number; label: string }>
}

function ClienteSelectField({ name, label, register, options }: ClienteSelectFieldProps): React.JSX.Element {
    return (
        <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center">
            <label htmlFor={name} className="text-sm font-medium">{label}</label>
            <select {...register(name, { setValueAs: (value: string) => value ? Number(value) : null })} id={name} className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm">
                <option value="">Selecione</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
        </div>
    )
}

const carrierOptions = carrierMock.data.map((item) => ({ id: item.id, label: item.nome }))
const conditionOptions = paymentConditionsMock.data.map((item) => ({ id: item.id, label: item.descricao }))
const methodOptions = paymentMethodsMock.data.map((item) => ({ id: item.id, label: item.descricao }))
const tableOptions = priceTablesMock.data.map((item) => ({ id: item.id, label: item.nome }))

export function AbaPadroes({ register }: AbaPadroesProps): React.JSX.Element {
    return (
        <div className="space-y-4">
            <ClienteSelectField name="carrierId" label={clienteStrings.carrier} register={register} options={carrierOptions} />
            <ClienteSelectField name="paymentConditionId" label={clienteStrings.paymentCondition} register={register} options={conditionOptions} />
            <ClienteSelectField name="paymentMethodId" label={clienteStrings.paymentMethod} register={register} options={methodOptions} />
            <ClienteSelectField name="priceTableId" label={clienteStrings.priceTable} register={register} options={tableOptions} />
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center"><label htmlFor="lastVisit" className="text-sm font-medium">{clienteStrings.lastVisit}</label><input {...register('lastVisit')} id="lastVisit" type="date" className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm" /></div>
            <div className="grid gap-1.5 md:grid-cols-[minmax(9rem,0.75fr)_minmax(0,1.5fr)] md:items-center"><label htmlFor="integrationId" className="text-sm font-medium">{clienteStrings.integrationId}</label><input {...register('integrationId')} id="integrationId" readOnly className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 text-sm" /></div>
        </div>
    )
}