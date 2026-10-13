import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import logger from 'loglevel'
import { useApiRepository } from '../../../../core/api/apiClient'
import { ApiPedidoRepository } from '../../data/repositories/ApiPedidoRepository'
import { mockPedidoRepository } from '../../data/repositories/MockPedidoRepository'
import type { Pedido } from '../../domain/entities/Pedido'
import type { PedidoTipo } from '../../domain/entities/PedidoTipo'
import { pedidoStrings } from '../pedido.constants'

const pedidoRepository = useApiRepository ? new ApiPedidoRepository() : mockPedidoRepository

export interface PedidoListaViewModel {
    pedidos: Pedido[]
    filteredOrders: Pedido[]
    filtros: string
    search: string
    loading: boolean
    error: string | null
    setSearch: (value: string) => void
    setFilter: (value: string) => void
    listar: () => Promise<void>
}

export function usePedidoListaViewModel(type: PedidoTipo): PedidoListaViewModel {
    const [searchParams, setSearchParams] = useSearchParams()
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const filtros = searchParams.get('filtro') ?? 'todos'

    const listar = useCallback(async (): Promise<void> => {
        setLoading(true)
        setError(null)
        try {
            setPedidos(await pedidoRepository.list(type))
        } catch (loadError: unknown) {
            logger.error(pedidoStrings.loadFailed, loadError)
            setError(pedidoStrings.loadFailed)
        } finally {
            setLoading(false)
        }
    }, [type])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => { void listar() }, 0)
        return () => window.clearTimeout(timeoutId)
    }, [listar])

    const filteredOrders = useMemo(() => {
        const query = search.trim().toLocaleLowerCase('pt-BR')
        return pedidos.filter((order) => {
            const matchesFilter = filtros === 'todos' || order.status === filtros
            const issueDate = order.issueDate.slice(0, 10)
            const [year, month, day] = issueDate.split('-').map(Number)
            const localizedDate = new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day))
            const matchesSearch = !query || [order.number, order.customerName, issueDate, localizedDate].some((value) => value.toLocaleLowerCase('pt-BR').includes(query))
            return matchesFilter && matchesSearch
        })
    }, [filtros, pedidos, search])

    function setFilter(value: string): void {
        const nextParams = new URLSearchParams(searchParams)
        if (value === 'todos') nextParams.delete('filtro')
        else nextParams.set('filtro', value)
        setSearchParams(nextParams, { replace: true })
    }

    return { pedidos, filteredOrders, filtros, search, loading, error, setSearch, setFilter, listar }
}