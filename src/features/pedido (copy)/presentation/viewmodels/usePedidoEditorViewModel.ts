import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import logger from 'loglevel'
import { useApiRepository } from '../../../../core/api/apiClient'
import { ApiPedidoRepository } from '../../data/repositories/ApiPedidoRepository'
import { mockPedidoRepository, orderCatalogs } from '../../data/repositories/MockPedidoRepository'
import type { ItemPedido } from '../../domain/entities/ItemPedido'
import type { Pedido } from '../../domain/entities/Pedido'
import { PedidoTipo } from '../../domain/entities/PedidoTipo'
import { calcularPedidoTotais } from '../../domain/services/PedidoTotais'
import type { PedidoFormValues } from '../../domain/validators/pedidoSchema'
import { getOrderBasePath, pedidoStrings } from '../pedido.constants'

const pedidoRepository = useApiRepository ? new ApiPedidoRepository() : mockPedidoRepository

export interface PedidoEditorViewModel {
    pedido: Pedido
    itens: ItemPedido[]
    totais: Pedido['totals']
    addresses: Awaited<ReturnType<typeof mockPedidoRepository.getCustomerAddresses>>
    catalogs: typeof orderCatalogs
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
    const [loading, setLoading] = useState(orderId !== null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

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
        const customer = orderCatalogs.clients.find((item) => item.id === customerId)
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

    return { pedido, itens: pedido.items, totais: pedido.totals, addresses, catalogs: orderCatalogs, loading, saving, error, setCustomer, adicionarItem, atualizarItem, removerItem, recalcularTotais, salvar, cancelar, retry }
}