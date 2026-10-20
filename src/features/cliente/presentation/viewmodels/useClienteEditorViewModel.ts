import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logger from 'loglevel'
import { ApiClienteRepository } from '../../data/repositories/ApiClienteRepository'
import { ApiPedidoRepository } from '../../../pedido/data/repositories/ApiPedidoRepository'
import type { Cliente, CnpjLookup } from '../../domain/entities/Cliente'
import type { ClienteFormValues } from '../../domain/validators/clienteSchema'
import { clienteRoutes, clienteStrings } from '../cliente.constants'

const clienteRepository = new ApiClienteRepository()
const catalogRepository = new ApiPedidoRepository()

export interface ClienteEditorCatalogs {
    carriers: Awaited<ReturnType<ApiPedidoRepository['listCarriers']>>
    paymentConditions: Awaited<ReturnType<ApiPedidoRepository['listPaymentConditions']>>
    paymentMethods: Awaited<ReturnType<ApiPedidoRepository['listPaymentMethods']>>
    priceTables: Awaited<ReturnType<ApiPedidoRepository['listPriceTables']>>
}

const emptyCatalogs: ClienteEditorCatalogs = {
    carriers: [],
    paymentConditions: [],
    paymentMethods: [],
    priceTables: [],
}

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
    catalogs: ClienteEditorCatalogs
    catalogsLoading: boolean
    loading: boolean
    saving: boolean
    locked: boolean
    error: string | null
    consultarCnpj: (taxId: string) => Promise<CnpjLookup>
    salvar: (values: ClienteFormValues, finalize?: boolean) => Promise<void>
    excluir: () => Promise<void>
    cancelar: () => void
    retry: () => void
}

export function useClienteEditorViewModel(clientId: number | null): ClienteEditorViewModel {
    const location = useLocation()
    const navigate = useNavigate()
    const [cliente, setCliente] = useState<Cliente>(emptyClient)
    const [catalogs, setCatalogs] = useState<ClienteEditorCatalogs>(emptyCatalogs)
    const [catalogsLoading, setCatalogsLoading] = useState(true)
    const [loading, setLoading] = useState(clientId !== null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)
    const isDefaultHistoryEntry = useRef(location.key === 'default')

    useEffect(() => {
        let active = true

        async function loadCatalogs(): Promise<void> {
            try {
                const [carriers, paymentConditions, paymentMethods, priceTables] = await Promise.all([
                    catalogRepository.listCarriers(),
                    catalogRepository.listPaymentConditions(),
                    catalogRepository.listPaymentMethods(),
                    catalogRepository.listPriceTables(),
                ])
                if (active) setCatalogs({ carriers, paymentConditions, paymentMethods, priceTables })
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar os catálogos do cliente.', loadError)
                if (active) setError(clienteStrings.catalogLoadFailed)
            } finally {
                if (active) setCatalogsLoading(false)
            }
        }

        void loadCatalogs()
        return () => { active = false }
    }, [reloadKey])

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

    async function salvar(values: ClienteFormValues, finalize = false): Promise<void> {
        if (cliente.integrationStatus === 'em_integracao' || cliente.integrationStatus === 'integrado') return
        setSaving(true)
        setError(null)
        try {
            const saved = await clienteRepository.save({
                ...values,
                legalName: values.legalName || values.name,
            })
            if (finalize) {
                if (saved.id === null) throw new Error('A API não retornou o identificador do cliente.')
                await clienteRepository.finalize(saved.id)
                const finalized = { ...saved, integrationStatus: 'em_integracao' as const, rejectionReason: null }
                setCliente(finalized)
                if (clientId === null) navigate(clienteRoutes.edit(saved.id) + location.search, { replace: true })
            } else {
                setCliente(saved)
                navigate(`${clienteRoutes.list}${location.search}`, { replace: true })
            }
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
        setLoading(clientId !== null)
        setCatalogsLoading(true)
        setReloadKey((key) => key + 1)
    }

    const locked = cliente.integrationStatus === 'em_integracao' || cliente.integrationStatus === 'integrado'
    return { cliente, catalogs, catalogsLoading, loading, saving, locked, error, consultarCnpj, salvar, excluir, cancelar, retry }
}