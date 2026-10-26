import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import logger from 'loglevel'
import { ApiPedidoRepository } from '../../data/repositories/ApiPedidoRepository'
import type { Pedido } from '../../domain/entities/Pedido'
import type { PedidoTipo } from '../../domain/entities/PedidoTipo'
import { pedidoStrings } from '../pedido.constants'

const pedidoRepository = new ApiPedidoRepository()

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
    const isMountedRef = useRef(false)
    const requestIdRef = useRef(0)
    const filtros = searchParams.get('filtro') ?? 'todos'

    const listar = useCallback(async (isMounted: () => boolean = () => isMountedRef.current): Promise<void> => {
        if (!isMounted()) return
        const requestId = ++requestIdRef.current
        setLoading(true)
        setError(null)
        try {
            const loadedOrders = await pedidoRepository.list(type)
            if (!isMounted() || requestId !== requestIdRef.current) return
            setPedidos(loadedOrders)
        } catch (loadError: unknown) {
            if (!isMounted() || requestId !== requestIdRef.current) return
            logger.error(pedidoStrings.loadFailed, loadError)
            setError(pedidoStrings.loadFailed)
        } finally {
            if (isMounted() && requestId === requestIdRef.current) setLoading(false)
        }
    }, [type])

    useEffect(() => {
        let isMounted = true
        isMountedRef.current = true
        const timeoutId = window.setTimeout(() => { void listar(() => isMounted) }, 0)
        return () => {
            isMounted = false
            isMountedRef.current = false
            window.clearTimeout(timeoutId)
        }
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