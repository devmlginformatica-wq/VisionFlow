import { useState } from 'react'
import { Search } from 'lucide-react'
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import type { CnpjLookup } from '../../../domain/entities/Cliente'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import { clienteStrings } from '../../cliente.constants'
import { ClienteTextField } from './ClienteTextField'

interface ClienteTaxIdFieldProps {
    register: UseFormRegister<ClienteFormValues>
    setValue: UseFormSetValue<ClienteFormValues>
    getTaxId: () => string
    consultarCnpj: (taxId: string) => Promise<CnpjLookup>
    onAddressFound: (address: CnpjLookup['address']) => Promise<void>
}

export function ClienteTaxIdField({ register, setValue, getTaxId, consultarCnpj, onAddressFound }: ClienteTaxIdFieldProps): React.JSX.Element {
    const [lookupError, setLookupError] = useState<string | null>(null)

    async function lookup(): Promise<void> {
        try {
            const result = await consultarCnpj(getTaxId())
            setValue('taxId', result.taxId, { shouldDirty: true })
            setValue('legalName', result.legalName, { shouldDirty: true })
            setValue('name', result.legalName, { shouldDirty: true, shouldValidate: true })
            setValue('tradeName', result.tradeName, { shouldDirty: true })
            setValue('stateRegistration', result.stateRegistration, { shouldDirty: true })
            setValue('buyerEmail', result.email, { shouldDirty: true })
            setValue('commercialPhone', result.phone, { shouldDirty: true })
            await onAddressFound(result.address)
            setLookupError(null)
        } catch (error: unknown) {
            setLookupError(error instanceof Error ? error.message : clienteStrings.consultFailed)
        }
    }

    return (
        <div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2"><ClienteTextField name="taxId" label={clienteStrings.taxId} register={register} /><button type="button" onClick={() => void lookup()} aria-label={clienteStrings.lookupCnpj} title={clienteStrings.lookupCnpj} className="flex size-10 items-center justify-center rounded-md border border-[var(--color-border)] hover:bg-[var(--color-canvas)]"><Search size={18} /></button></div>
            {lookupError && <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">{lookupError}</p>}
        </div>
    )
}