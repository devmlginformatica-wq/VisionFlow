import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import logger from 'loglevel'
import { ApiClienteRepository } from '../../data/repositories/ApiClienteRepository'
import type { Cliente, CnpjLookup } from '../../domain/entities/Cliente'
import { clienteSchema, type ClienteFormValues } from '../../domain/validators/clienteSchema'

const clienteRepository = new ApiClienteRepository()

export const clientFilters = [
    { value: 'todos', label: 'Todos' },
    { value: 'inatividade', label: 'Inatividade' },
    { value: 'em_digitacao', label: 'Em digitação' },
    { value: 'prospects', label: 'Prospects' },
    { value: 'efetivos', label: 'Efetivos' },
    { value: 'bloqueado', label: 'Bloqueados' },
    { value: 'sem_followup', label: 'Sem Followup (+30d)' },
    { value: 'vencidos', label: 'Vencidos' },
] as const

export interface ClienteViewModel {
    clientes: Cliente[]
    visibleClients: Cliente[]
    loading: boolean
    error: string | null
    filtros: string
    search: string
    setSearch: (value: string) => void
    setFilter: (value: string) => void
    setGridView: (value: boolean) => void
    gridView: boolean
    listar: () => Promise<void>
    salvar: (values: ClienteFormValues) => Promise<Cliente>
    excluir: (id: number) => Promise<void>
    consultarCnpj: (taxId: string) => Promise<CnpjLookup>
}

export function useClienteViewModel(): ClienteViewModel {
    const [searchParams, setSearchParams] = useSearchParams()
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [gridView, setGridView] = useState(true)
    const filtros = searchParams.get('filtro') ?? 'todos'

    const listar = useCallback(async (): Promise<void> => {
        setLoading(true)
        setError(null)
        try {
            setClientes(await clienteRepository.list())
        } catch (loadError: unknown) {
            logger.error('Não foi possível carregar clientes.', loadError)
            setError('Não foi possível carregar os clientes.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timeoutId = window.setTimeout(() => { void listar() }, 0)
        return () => window.clearTimeout(timeoutId)
    }, [listar])

    const visibleClients = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
        return clientes.filter((client) => {
            const matchesSearch = !normalizedSearch || [client.name, client.legalName, client.tradeName, client.taxId, String(client.id ?? '')]
                .some((value) => value.toLocaleLowerCase('pt-BR').includes(normalizedSearch))
            if (!matchesSearch) return false
            switch (filtros) {
                case 'inatividade': return client.status !== 'aberto'
                case 'em_digitacao': return client.registrationStatus === 'em_digitacao'
                case 'prospects': return client.prospect
                case 'efetivos': return !client.prospect
                case 'bloqueado': return client.status === 'bloqueado'
                case 'sem_followup': return !client.lastAttendance
                case 'vencidos': return client.titles.some((title) => new Date(title.dueDate) < new Date())
                default: return true
            }
        })
    }, [clientes, filtros, search])

    function setFilter(value: string): void {
        const nextParams = new URLSearchParams(searchParams)
        if (value === 'todos') nextParams.delete('filtro')
        else nextParams.set('filtro', value)
        setSearchParams(nextParams, { replace: true })
    }

    async function salvar(values: ClienteFormValues): Promise<Cliente> {
        const parsedValues = clienteSchema.parse(values)
        const saved = await clienteRepository.save(parsedValues)
        setClientes((current) => [saved, ...current.filter((client) => client.id !== saved.id)])
        return saved
    }

    async function excluir(id: number): Promise<void> {
        await clienteRepository.delete(id)
        setClientes((current) => current.filter((client) => client.id !== id))
    }

    async function consultarCnpj(taxId: string): Promise<CnpjLookup> {
        return clienteRepository.lookupTaxId(taxId)
    }

    return { clientes, visibleClients, loading, error, filtros, search, setSearch, setFilter, setGridView, gridView, listar, salvar, excluir, consultarCnpj }
}