import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logger from 'loglevel'
import { ApiClienteRepository } from '../../../cliente/data/repositories/ApiClienteRepository'
import { ApiPedidoRepository } from '../../data/repositories/ApiPedidoRepository'
import type { ItemPedido } from '../../domain/entities/ItemPedido'
import type { Pedido } from '../../domain/entities/Pedido'
import { PedidoTipo } from '../../domain/entities/PedidoTipo'
import { calcularPedidoTotais } from '../../domain/services/PedidoTotais'
import type { PedidoFormValues } from '../../domain/validators/pedidoSchema'
import { getOrderBasePath, pedidoStrings } from '../pedido.constants'

const pedidoRepository = new ApiPedidoRepository()
const clienteRepository = new ApiClienteRepository()

type PedidoEditorCatalogs = {
    companies: Awaited<ReturnType<ApiPedidoRepository['listCompanies']>>
    clients: Array<{ id: number; nome: string; cpf_cnpj: string }>
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
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let active = true

        async function loadClients(): Promise<void> {
            try {
                const clients = await clienteRepository.list()
                if (!active) return
                setCatalogs((current) => ({
                    ...current,
                    clients: clients.flatMap((client) => client.id === null ? [] : [{
                        id: client.id,
                        nome: client.name,
                        cpf_cnpj: client.taxId,
                    }]),
                }))
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar os clientes do pedido.', loadError)
                if (active) setError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
            }
        }

        void loadClients()
        return () => { active = false }
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
                const products = await pedidoRepository.listProducts()
                if (active) setCatalogs((current) => ({ ...current, products }))
            } catch (loadError: unknown) {
                logger.error('Não foi possível carregar os produtos do pedido.', loadError)
                if (active) setError(loadError instanceof Error ? loadError.message : pedidoStrings.loadFailed)
            }
        }

        void loadProducts()
        return () => { active = false }
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
                    setAddresses(await pedidoRepository.getCustomerAddresses(loadedOrder.customerId))
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

    return { pedido, itens: pedido.items, totais: pedido.totals, addresses, catalogs, loading, saving, error, setCustomer, adicionarItem, atualizarItem, removerItem, recalcularTotais, salvar, cancelar, retry }
}