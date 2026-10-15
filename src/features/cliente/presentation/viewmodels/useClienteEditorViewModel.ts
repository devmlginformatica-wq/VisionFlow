import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logger from 'loglevel'
import { useApiRepository } from '../../../../core/api/apiClient'
import { ApiClienteRepository } from '../../data/repositories/ApiClienteRepository'
import { mockClienteRepository } from '../../data/repositories/MockClienteRepository'
import type { Cliente, CnpjLookup } from '../../domain/entities/Cliente'
import type { ClienteFormValues } from '../../domain/validators/clienteSchema'
import { clienteRoutes } from '../cliente.constants'

const clienteRepository = useApiRepository ? new ApiClienteRepository() : mockClienteRepository

const emptyClient: Cliente = {
    id: null,
    name: '', legalName: '', tradeName: '', taxId: '', personType: 'PJ', stateRegistration: '',
    buyerContact: '', buyerEmail: '', billingContact: '', invoiceEmail: '', commercialPhone: '',
    mobilePhone: '', otherPhone: '', prospect: true, status: 'aberto', registrationStatus: 'em_digitacao',
    purchaseStatus: 'sem_compra', openedAt: new Date().toISOString().slice(0, 10), indicatorColor: 'verde',
    addressSummary: '', fullAddress: '', lastOrder: null, lastAttendance: null, carrierId: null,
    paymentConditionId: null, paymentMethodId: null, priceTableId: null, lastVisit: '', integrationId: '',
    creditLimit: 0, userNotes: '', erpNotes: '', addresses: [], titles: [],
}

export interface ClienteEditorViewModel {
    cliente: Cliente
    loading: boolean
    saving: boolean
    error: string | null
    consultarCnpj: (taxId: string) => Promise<CnpjLookup>
    salvar: (values: ClienteFormValues) => Promise<void>
    excluir: () => Promise<void>
    cancelar: () => void
    retry: () => void
}

export function useClienteEditorViewModel(clientId: number | null): ClienteEditorViewModel {
    const location = useLocation()
    const navigate = useNavigate()
    const [cliente, setCliente] = useState<Cliente>(emptyClient)
    const [loading, setLoading] = useState(clientId !== null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)
    const isDefaultHistoryEntry = useRef(location.key === 'default')

    useEffect(() => {
        if (clientId === null) return
        let active = true
        const timeoutId = window.setTimeout(async () => {
            try {
                const loadedClient = await clienteRepository.getById(clientId)
                if (!active) return
                if (!loadedClient) {
                    setError('Cliente não encontrado.')
                    return
                }
                const titles = await clienteRepository.getContasReceber(clientId)
                if (!active) return
                setCliente({ ...loadedClient, titles })
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar o cliente.', loadError)
                if (active) setError('Não foi possível carregar o cliente.')
            } finally {
                if (active) setLoading(false)
            }
        }, 0)
        return () => { active = false; window.clearTimeout(timeoutId) }
    }, [clientId, reloadKey])

    async function consultarCnpj(taxId: string): Promise<CnpjLookup> {
        return clienteRepository.lookupTaxId(taxId)
    }

    async function salvar(values: ClienteFormValues): Promise<void> {
        setSaving(true)
        setError(null)
        try {
            const saved = await clienteRepository.save({
                ...values,
                legalName: values.legalName || values.name,
            })
            setCliente(saved)
            navigate(`${clienteRoutes.list}${location.search}`, { replace: true })
        } catch (saveError: unknown) {
            logger.error('Não foi possível salvar o cliente.', saveError)
            setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar o cliente.')
        } finally {
            setSaving(false)
        }
    }

    async function excluir(): Promise<void> {
        if (clientId === null) return
        try {
            await clienteRepository.delete(clientId)
            navigate(`${clienteRoutes.list}${location.search}`, { replace: true })
        } catch (deleteError: unknown) {
            logger.error('Não foi possível excluir o cliente.', deleteError)
            setError('Não foi possível excluir o cliente.')
        }
    }

    function cancelar(): void {
        if (isDefaultHistoryEntry.current) navigate(`${clienteRoutes.list}${location.search}`, { replace: true })
        else navigate(-1)
    }

    function retry(): void {
        setError(null)
        if (clientId === null) return
        setLoading(true)
        setReloadKey((key) => key + 1)
    }

    return { cliente, loading, saving, error, consultarCnpj, salvar, excluir, cancelar, retry }
}