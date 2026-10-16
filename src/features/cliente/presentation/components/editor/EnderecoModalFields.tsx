import { Search } from 'lucide-react'
import type { UseFormRegister } from 'react-hook-form'
import type { EnderecoFormValues } from './EnderecoFormValues'
import { clienteStrings } from '../../cliente.constants'
import { EnderecoTextField } from './EnderecoTextField'

interface EnderecoModalFieldsProps {
    register: UseFormRegister<EnderecoFormValues>
    onLookupZipCode: () => void
}

export function EnderecoModalFields({ register, onLookupZipCode }: EnderecoModalFieldsProps): React.JSX.Element {
    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1.5 text-xs font-medium"><span>{clienteStrings.addressType}</span><select {...register('type')} className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"><option value="entrega">Entrega</option><option value="cobranca">Cobrança</option><option value="ambos">Ambos</option></select></label>
                <label className="space-y-1.5 text-xs font-medium"><span>{clienteStrings.purpose}</span><select {...register('purpose')} className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"><option value="principal">Principal</option><option value="secundario">Secundário</option></select></label>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-end gap-2"><EnderecoTextField name="zipCode" label={clienteStrings.zipCode} register={register} required /><button type="button" onClick={onLookupZipCode} aria-label={clienteStrings.lookupZipCode} className="flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] px-3 text-sm hover:bg-[var(--color-canvas)]"><Search size={16} />Buscar</button></div>
            <div className="grid gap-3 sm:grid-cols-2"><EnderecoTextField name="street" label={clienteStrings.street} register={register} required /><EnderecoTextField name="number" label={clienteStrings.number} register={register} required /><EnderecoTextField name="complement" label={clienteStrings.complement} register={register} /><EnderecoTextField name="district" label={clienteStrings.district} register={register} required /><EnderecoTextField name="city" label={clienteStrings.city} register={register} required /><EnderecoTextField name="state" label={clienteStrings.state} register={register} required /></div>
            <div className="grid gap-3 sm:grid-cols-2"><EnderecoTextField name="reference" label={clienteStrings.reference} register={register} /><EnderecoTextField name="deliveryRestrictions" label={clienteStrings.deliveryRestrictions} register={register} multiline /></div>
        </>
    )
}