import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { Endereco, EnderecoInput } from '../../../domain/entities/Endereco'
import { enderecoSchema } from '../../../domain/validators/enderecoSchema'
import type { EnderecoFormValues } from './EnderecoFormValues'
import { EnderecoModalDialog } from './EnderecoModalDialog'
import { useEnderecoModalViewModel } from '../../viewmodels/useEnderecoModalViewModel'

const emptyAddress: EnderecoFormValues = {
    type: 'entrega', purpose: 'principal', zipCode: '', street: '', number: '', complement: '',
    district: '', city: '', state: '', reference: '', deliveryRestrictions: '',
}

interface EnderecoModalProps {
    open: boolean
    address: Endereco | null
    onOpenChange: (open: boolean) => void
    onSave: (address: EnderecoInput) => Promise<void>
    onLookupZipCode: (zipCode: string) => Promise<Partial<Endereco>>
}

export function EnderecoModal({ open, address, onOpenChange, onSave, onLookupZipCode }: EnderecoModalProps): React.JSX.Element {
    const { register, handleSubmit, reset, setValue, control, formState: { isSubmitting } } = useForm<EnderecoFormValues>({ resolver: zodResolver(enderecoSchema), defaultValues: emptyAddress })
    const zipCode = useWatch({ control, name: 'zipCode' })
    const viewModel = useEnderecoModalViewModel({ address, onSave, onLookupZipCode, setValue })

    useEffect(() => {
        reset(address ?? emptyAddress)
    }, [address, open, reset])

    return (
        <EnderecoModalDialog
            open={open}
            register={register}
            onSubmit={handleSubmit((values) => viewModel.submit(values, () => onOpenChange(false)))}
            submitting={isSubmitting}
            error={viewModel.error}
            onOpenChange={(nextOpen) => { if (nextOpen) viewModel.setError(null); onOpenChange(nextOpen) }}
            onLookupZipCode={() => void viewModel.lookupZipCode(zipCode)}
        />
    )
}