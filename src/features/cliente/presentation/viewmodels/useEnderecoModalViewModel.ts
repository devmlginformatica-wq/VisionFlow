import { useState } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import type { Endereco, EnderecoInput } from '../../domain/entities/Endereco'
import type { EnderecoFormValues } from '../components/editor/EnderecoFormValues'

interface UseEnderecoModalViewModelProps {
    address: Endereco | null
    onSave: (address: EnderecoInput) => Promise<void>
    onLookupZipCode: (zipCode: string) => Promise<Partial<Endereco>>
    setValue: UseFormSetValue<EnderecoFormValues>
}

export function useEnderecoModalViewModel({ address, onSave, onLookupZipCode, setValue }: UseEnderecoModalViewModelProps) {
    const [error, setError] = useState<string | null>(null)

    async function lookupZipCode(zipCode: string): Promise<void> {
        try {
            const result = await onLookupZipCode(zipCode)
            for (const key of ['street', 'number', 'complement', 'district', 'city', 'state'] as const) {
                const value = result[key]
                if (value !== undefined) setValue(key, value)
            }
        } catch (lookupError: unknown) {
            setError(lookupError instanceof Error ? lookupError.message : 'CEP não encontrado.')
        }
    }

    async function submit(values: EnderecoFormValues, close: () => void): Promise<void> {
        try {
            await onSave({ ...values, id: address?.id })
            close()
        } catch (saveError: unknown) {
            setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar o endereço.')
        }
    }

    return { error, setError, lookupZipCode, submit }
}