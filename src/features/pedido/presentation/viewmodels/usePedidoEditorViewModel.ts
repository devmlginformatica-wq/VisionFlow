import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logger from 'loglevel'
import { ApiClienteRepository } from '../../../cliente/data/repositories/ApiClienteRepository'
import type { Cliente } from '../../../cliente/domain/entities/Cliente'
import { ApiPedidoRepository } from '../../data/repositories/ApiPedidoRepository'
import type { ItemPedido } from '../../domain/entities/ItemPedido'
import type { Pedido } from '../../domain/entities/Pedido'
import { PedidoTipo } from '../../domain/entities/PedidoTipo'
import { calcularPedidoTotais } from '../../domain/services/PedidoTotais'
import type { PedidoFormValues } from '../../domain/validators/pedidoSchema'
import { getOrderBasePath, pedidoStrings } from '../pedido.constants'

const pedidoRepository = new ApiPedidoRepository()
const clienteRepository = new ApiClienteRepository()

type PedidoEditorClient = { id: number; nome: string; razaoSocial: string; nomeFantasia: string; codigo: string; cpf_cnpj: string }

function mapPedidoEditorClients(clients: Cliente[]): PedidoEditorClient[] {
    return clients.flatMap((client) => client.id === null ? [] : [{
        id: client.id,
        nome: client.name,
        razaoSocial: client.legalName,
        nomeFantasia: client.tradeName,
        codigo: client.integrationId,
        cpf_cnpj: client.taxId,
    }])
}

type PedidoEditorCatalogs = {
    companies: Awaited<ReturnType<ApiPedidoRepository['listCompanies']>>
    clients: PedidoEditorClient[]
    paymentConditions: Awaited<ReturnType<ApiPedidoRepository['listPaymentConditions']>>
    paymentMethods: Awaited<ReturnType<ApiPedidoRepository['listPaymentMethods']>>
    carriers: Awaited<ReturnType<ApiPedidoRepository['listCarriers']>>
    priceTables: Awaited<ReturnType<ApiPedidoRepository['listPriceTables']>>
    products: Awaited<ReturnType<ApiPedidoRepository['listProducts']>>
}

export interface PedidoEditorViewModel {
    pedido: Pedido
    itens: ItemPedido[]
    totais: Pedido['totals']
    addresses: Awaited<ReturnType<ApiPedidoRepository['getCustomerAddresses']>>
    catalogs: PedidoEditorCatalogs
    loading: boolean
    saving: boolean
    error: string | null
    productSearchError: string | null
    isSearchingClients: boolean
    isSearchingProducts: boolean
    searchClients: (query: string) => Promise<void>
    searchProducts: (query: string) => Promise<void>
    setCustomer: (customerId: number | null) => Promise<PedidoEditorViewModel['addresses']>
    adicionarItem: (item: ItemPedido) => void
    atualizarItem: (item: ItemPedido) => void
    removerItem: (sequence: number) => void
    recalcularTotais: (items?: ItemPedido[], freightAmount?: number) => void
    salvar: (values: PedidoFormValues, finalize?: boolean) => Promise<void>
    cancelar: () => void
    retry: () => void
}

export function usePedidoEditorViewModel(type: PedidoTipo, orderId: number | null): PedidoEditorViewModel {
    const location = useLocation()
    const navigate = useNavigate()
    const [pedido, setPedido] = useState<Pedido>(() => pedidoRepository.createDraft(type))
    const [addresses, setAddresses] = useState<PedidoEditorViewModel['addresses']>([])
    const [catalogs, setCatalogs] = useState<PedidoEditorCatalogs>({
        companies: [],
        clients: [],
        paymentConditions: [],
        paymentMethods: [],
        carriers: [],
        priceTables: [],
        products: [],
    })
    const [loading, setLoading] = useState(orderId !== null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [productSearchError, setProductSearchError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)
    const [isSearchingClients, setIsSearchingClients] = useState(false)
    const [isSearchingProducts, setIsSearchingProducts] = useState(false)
    const initialClients = useRef<PedidoEditorClient[]>([])
    const initialProducts = useRef<PedidoEditorViewModel['catalogs']['products']>([])
    const currentClients = useRef<PedidoEditorClient[]>([])
    const clientSearchGeneration = useRef(0)
    const productSearchGeneration = useRef(0)
    const activeClientQuery = useRef('')
    const activeProductQuery = useRef('')
    const selectedClientId = useRef<number | null>(pedido.customerId)

    useEffect(() => {
        selectedClientId.current = pedido.customerId
    }, [pedido.customerId])

    useEffect(() => {
        currentClients.current = catalogs.clients
    }, [catalogs.clients])

    useEffect(() => {
        let active = true

        async function loadClients(): Promise<void> {
            try {
                const clients = await clienteRepository.list({ limit: 50 })
                if (!active) return
                initialClients.current = mapPedidoEditorClients(clients)
                if (!activeClientQuery.current) {
                    currentClients.current = initialClients.current
                    setCatalogs((current) => ({ ...current, clients: initialClients.current }))
                }
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar os clientes do pedido.', loadError)
                if (active) setError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
            }
        }

        void loadClients()
        return () => { active = false }
    }, [])

    const searchClients = useCallback(async (query: string): Promise<void> => {
        const generation = ++clientSearchGeneration.current
        const normalizedQuery = query.trim()
        activeClientQuery.current = normalizedQuery
        setIsSearchingClients(normalizedQuery.length > 0)

        try {
            const clients = normalizedQuery
                ? mapPedidoEditorClients(await clienteRepository.list({ busca: normalizedQuery, limit: 50 }))
                : initialClients.current
            if (generation !== clientSearchGeneration.current) return

            const selectedId = selectedClientId.current
            const selectedClient = currentClients.current.find((client) => client.id === selectedId)
                ?? initialClients.current.find((client) => client.id === selectedId)
            const nextClients = selectedClient && !clients.some((client) => client.id === selectedId)
                ? [selectedClient, ...clients]
                : clients
            currentClients.current = nextClients
            setCatalogs((current) => ({ ...current, clients: nextClients }))
        } catch (loadError: unknown) {
            if (generation !== clientSearchGeneration.current) return
            logger.error('Não foi possível pesquisar clientes para o pedido.', loadError)
            setError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
            throw loadError
        } finally {
            if (generation === clientSearchGeneration.current) setIsSearchingClients(false)
        }
    }, [])

    useEffect(() => {
        let active = true

        async function loadCompanies(): Promise<void> {
            try {
                const companies = await pedidoRepository.listCompanies()
                if (!active) return
                setCatalogs((current) => ({ ...current, companies }))
                if (orderId === null) {
                    setPedido((current) => ({ ...current, companyId: companies[0]?.id ?? null }))
                }
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar as empresas do pedido.', loadError)
                if (active) setError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
            }
        }

        void loadCompanies()
        return () => { active = false }
    }, [orderId])

    useEffect(() => {
        let active = true

        async function loadPaymentConditions(): Promise<void> {
            try {
                const paymentConditions = await pedidoRepository.listPaymentConditions()
                if (active) setCatalogs((current) => ({ ...current, paymentConditions }))
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar as condições de pagamento.', loadError)
                if (active) setError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
            }
        }

        void loadPaymentConditions()
        return () => { active = false }
    }, [])

    useEffect(() => {
        let active = true

        async function loadPaymentMethods(): Promise<void> {
            try {
                const paymentMethods = await pedidoRepository.listPaymentMethods()
                if (active) setCatalogs((current) => ({ ...current, paymentMethods }))
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar as formas de pagamento.', loadError)
                if (active) setError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
            }
        }

        void loadPaymentMethods()
        return () => { active = false }
    }, [])

    useEffect(() => {
        let active = true

        async function loadCarriers(): Promise<void> {
            try {
                const carriers = await pedidoRepository.listCarriers()
                if (active) setCatalogs((current) => ({ ...current, carriers }))
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar as transportadoras.', loadError)
                if (active) setError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
            }
        }

        void loadCarriers()
        return () => { active = false }
    }, [])

    useEffect(() => {
        let active = true

        async function loadPriceTables(): Promise<void> {
            try {
                const priceTables = await pedidoRepository.listPriceTables()
                if (active) setCatalogs((current) => ({ ...current, priceTables }))
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar as tabelas de preço.', loadError)
                if (active) setError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
            }
        }

        void loadPriceTables()
        return () => { active = false }
    }, [])

    useEffect(() => {
        let active = true

        async function loadProducts(): Promise<void> {
            try {
                const products = await pedidoRepository.listProducts({ limit: 50 })
                if (active) {
                    initialProducts.current = products
                    if (!activeProductQuery.current) setCatalogs((current) => ({ ...current, products }))
                }
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar os produtos do pedido.', loadError)
                if (active) setError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
            }
        }

        void loadProducts()
        return () => { active = false }
    }, [])

    const searchProducts = useCallback(async (query: string): Promise<void> => {
        const generation = ++productSearchGeneration.current
        const normalizedQuery = query.trim()
        activeProductQuery.current = normalizedQuery
        setIsSearchingProducts(normalizedQuery.length > 0)
        setProductSearchError(null)

        try {
            const products = normalizedQuery
                ? await pedidoRepository.listProducts({ busca: normalizedQuery, limit: 50 })
                : initialProducts.current
            if (generation !== productSearchGeneration.current) return
            setCatalogs((current) => ({ ...current, products }))
        } catch (loadError: unknown) {
            if (generation !== productSearchGeneration.current) return
            logger.error('Não foi possível pesquisar produtos para o pedido.', loadError)
            setProductSearchError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
        } finally {
            if (generation === productSearchGeneration.current) setIsSearchingProducts(false)
        }
    }, [])

    useEffect(() => {
        if (orderId === null) return
        let active = true
        const timeoutId = window.setTimeout(async () => {
            try {
                const loadedOrder = await pedidoRepository.getById(orderId, type)
                if (!active) return
                if (!loadedOrder) {
                    setError(pedidoStrings.notFound)
                    return
                }
                setPedido(loadedOrder)
                if (loadedOrder.customerId !== null) {
                    const [customer, customerAddresses] = await Promise.all([
                        clienteRepository.getById(loadedOrder.customerId),
                        pedidoRepository.getCustomerAddresses(loadedOrder.customerId),
                    ])
                    if (!active) return
                    if (customer) {
                        const selectedClient = mapPedidoEditorClients([customer])[0]
                        if (selectedClient) {
                            initialClients.current = [
                                selectedClient,
                                ...initialClients.current.filter((client) => client.id !== selectedClient.id),
                            ]
                            const nextClients = currentClients.current.some((client) => client.id === selectedClient.id)
                                ? currentClients.current
                                : [selectedClient, ...currentClients.current]
                            currentClients.current = nextClients
                            setCatalogs((current) => ({ ...current, clients: nextClients }))
                        }
                    }
                    setAddresses(customerAddresses)
                }
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar o pedido.', loadError)
                if (active) setError(pedidoStrings.loadFailed)
            } finally {
                if (active) setLoading(false)
            }
        }, 0)
        return () => { active = false; window.clearTimeout(timeoutId) }
    }, [orderId, reloadKey, type])

    async function setCustomer(customerId: number | null): Promise<PedidoEditorViewModel['addresses']> {
        const customer = catalogs.clients.find((item) => item.id === customerId)
        setAddresses([])
        setPedido((current) => ({ ...current, customerId, customerName: customer?.nome ?? '', customerTaxId: customer?.cpf_cnpj ?? '', billingAddressId: null, deliveryAddressId: null, collectionAddressId: null }))
        if (customerId === null) return []
        const customerAddresses = await pedidoRepository.getCustomerAddresses(customerId)
        const primaryAddress = customerAddresses.find((address) => address.purpose === 'principal') ?? customerAddresses[0]
        setAddresses(customerAddresses)
        setPedido((current) => ({ ...current, billingAddressId: primaryAddress?.id ?? null, deliveryAddressId: primaryAddress?.id ?? null, collectionAddressId: primaryAddress?.id ?? null }))
        return customerAddresses
    }

    function recalculate(items: ItemPedido[], freightAmount: number): void {
        setPedido((current) => ({ ...current, items, freightAmount, totals: calcularPedidoTotais(items, freightAmount) }))
    }

    function adicionarItem(item: ItemPedido): void { recalculate([...pedido.items, item], pedido.freightAmount) }
    function atualizarItem(item: ItemPedido): void { recalculate(pedido.items.map((current) => current.sequence === item.sequence ? item : current), pedido.freightAmount) }
    function removerItem(sequence: number): void { recalculate(pedido.items.filter((item) => item.sequence !== sequence), pedido.freightAmount) }
    function recalcularTotais(items = pedido.items, freightAmount = pedido.freightAmount): void { recalculate(items, freightAmount) }

    async function salvar(values: PedidoFormValues, finalize = false): Promise<void> {
        setSaving(true)
        setError(null)
        try {
            const nextStatus = finalize && type === PedidoTipo.Pedido ? 'aguardando_aprovacao' : values.status
            const saved = await pedidoRepository.save({ ...pedido, ...values, id: pedido.id, status: nextStatus, items: pedido.items, totals: calcularPedidoTotais(pedido.items, values.freightAmount) })
            setPedido(saved)
            navigate(`${getOrderBasePath(type)}${location.search}`, { replace: true })
        } catch (saveError: unknown) {
            logger.error('Não foi possível salvar o pedido.', saveError)
            setError(saveError instanceof Error ? saveError.message : pedidoStrings.saveFailed)
        } finally {
            setSaving(false)
        }
    }

    function cancelar(): void { navigate(-1) }
    function retry(): void { setError(null); setLoading(true); setReloadKey((key) => key + 1) }

    return { pedido, itens: pedido.items, totais: pedido.totals, addresses, catalogs, loading, saving, error, productSearchError, isSearchingClients, isSearchingProducts, searchClients, searchProducts, setCustomer, adicionarItem, atualizarItem, removerItem, recalcularTotais, salvar, cancelar, retry }
}