import type { UseFormReturn } from 'react-hook-form'
import type { CnpjLookup } from '../../../domain/entities/Cliente'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import { clienteStrings } from '../../cliente.constants'
import { ClienteTextField } from './ClienteTextField'
import { ClienteTaxIdField } from './ClienteTaxIdField'

interface AbaDadosGeraisProps {
    form: UseFormReturn<ClienteFormValues>
    consultarCnpj: (taxId: string) => Promise<CnpjLookup>
    onAddressFound: (address: CnpjLookup['address']) => Promise<void>
}

export function AbaDadosGerais({ form, consultarCnpj, onAddressFound }: AbaDadosGeraisProps): React.JSX.Element {
    const { register, setValue, getValues, formState: { errors } } = form

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md bg-[var(--color-canvas)] px-3 py-2"><span className="text-sm font-medium">Cliente {getValues('id') ? `#${getValues('id')}` : `· ${clienteStrings.newClient}`}</span><label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('prospect')} className="size-4 accent-[var(--color-primary)]" />{clienteStrings.prospectQuestion}</label></div>
            <ClienteTaxIdField register={register} setValue={setValue} getTaxId={() => getValues('taxId')} consultarCnpj={consultarCnpj} onAddressFound={onAddressFound} />
            <ClienteTextField name="name" label={clienteStrings.name} register={register} error={errors.name} required />
            <ClienteTextField name="tradeName" label={clienteStrings.tradeName} register={register} />
            <ClienteTextField name="stateRegistration" label={clienteStrings.stateRegistration} register={register} />
            <ClienteTextField name="buyerContact" label={clienteStrings.buyerContact} register={register} />
            <ClienteTextField name="buyerEmail" label={clienteStrings.buyerEmail} register={register} type="email" error={errors.buyerEmail} />
            <ClienteTextField name="billingContact" label={clienteStrings.billingContact} register={register} />
            <ClienteTextField name="invoiceEmail" label={clienteStrings.invoiceEmail} register={register} type="email" error={errors.invoiceEmail} />
            <ClienteTextField name="commercialPhone" label={clienteStrings.commercialPhone} register={register} error={errors.commercialPhone} required />
            <ClienteTextField name="mobilePhone" label={clienteStrings.mobilePhone} register={register} />
            <ClienteTextField name="otherPhone" label={clienteStrings.otherPhone} register={register} />
        </div>
    )
}