import { useCallback, useEffect, useRef, useState } from 'react'
import logger from 'loglevel'
import { ApiClienteRepository } from '../../data/repositories/ApiClienteRepository'
import type { Endereco, EnderecoInput } from '../../domain/entities/Endereco'
import type { CnpjLookup } from '../../domain/entities/Cliente'

const clienteRepository = new ApiClienteRepository()

export interface EnderecoViewModel {
    enderecos: Endereco[]
    loading: boolean
    error: string | null
    listar: () => Promise<void>
    adicionar: (address: EnderecoInput) => Promise<Endereco>
    adicionarConsultaCnpj: (address: CnpjLookup['address']) => Promise<void>
    editar: (address: EnderecoInput) => Promise<Endereco>
    remover: (addressId: number) => Promise<void>
    consultarCep: (zipCode: string) => Promise<Partial<Endereco>>
}

export function useEnderecoViewModel(clientId: number | null): EnderecoViewModel {
    const nextTemporaryId = useRef(-1)
    const [enderecos, setEnderecos] = useState<Endereco[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const listar = useCallback(async (): Promise<void> => {
        setLoading(true)
        setError(null)
        try {
            setEnderecos(await clienteRepository.getAddresses(clientId))
        } catch (loadError: unknown) {
            logger.error('Não foi possível carregar endereços.', loadError)
            setError('Não foi possível carregar os endereços.')
        } finally {
            setLoading(false)
        }
    }, [clientId])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => { void listar() }, 0)
        return () => window.clearTimeout(timeoutId)
    }, [listar])

    async function adicionar(address: EnderecoInput): Promise<Endereco> {
        const localAddress = { ...address, id: address.id ?? nextTemporaryId.current-- }

        if (clientId === null) {
            setEnderecos((current) => [localAddress, ...current])
            return localAddress
        }

        try {
            const saved = await clienteRepository.saveAddress(clientId, address)
            setEnderecos((current) => [saved, ...current.filter((item) => item.id !== saved.id)])
            return saved
        } catch (saveError: unknown) {
            logger.error('Não foi possível salvar o endereço.', saveError)
            setError('Não foi possível salvar o endereço.')
            throw saveError
        }
    }

    async function adicionarConsultaCnpj(address: CnpjLookup['address']): Promise<void> {
        const newAddress: EnderecoInput = {
            ...address,
            type: 'entrega',
            purpose: 'principal',
            reference: '',
            deliveryRestrictions: '',
        }
        await adicionar(newAddress)
    }

    async function editar(address: EnderecoInput): Promise<Endereco> {
        if (clientId === null || address.id === undefined || address.id <= 0) {
            const saved = { ...address, id: address.id ?? nextTemporaryId.current-- }
            setEnderecos((current) => current.map((item) => item.id === saved.id ? saved : item))
            return saved
        }

        try {
            const saved = await clienteRepository.saveAddress(clientId, address)
            setEnderecos((current) => current.map((item) => item.id === address.id ? saved : item))
            return saved
        } catch (saveError: unknown) {
            logger.error('Não foi possível atualizar o endereço.', saveError)
            setError('Não foi possível atualizar o endereço.')
            throw saveError
        }
    }

    async function remover(addressId: number): Promise<void> {
        if (clientId !== null && addressId > 0) {
            try {
                await clienteRepository.deleteAddress(clientId, addressId)
            } catch (deleteError: unknown) {
                logger.error('Não foi possível remover o endereço.', deleteError)
                setError('Não foi possível remover o endereço.')
                throw deleteError
            }
        }
        setEnderecos((current) => current.filter((address) => address.id !== addressId))
    }

    async function consultarCep(zipCode: string): Promise<Partial<Endereco>> {
        return clienteRepository.lookupZipCode(zipCode)
    }

    return { enderecos, loading, error, listar, adicionar, adicionarConsultaCnpj, editar, remover, consultarCep }
}