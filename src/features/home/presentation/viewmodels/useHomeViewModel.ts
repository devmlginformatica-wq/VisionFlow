import { useEffect, useState } from 'react'
import logger from 'loglevel'
import { useAuthStore } from '../../../auth/presentation/stores/useAuthStore'
import type { Usuario } from '../../../auth/domain/entities/Usuario'
import { useApiRepository } from '../../../../core/api/apiClient'
import { ApiHomeRepository } from '../../data/repositories/ApiHomeRepository'
import { MockHomeRepository } from '../../data/repositories/MockHomeRepository'
import type { Aviso } from '../../domain/entities/Aviso'
import type { Indicador } from '../../domain/entities/Indicador'
import { filteredRoute, homeIcons, homeStrings, type HomeIndicatorCardData } from '../home.constants'
import { shellRoutes } from '../../../../core/shell/shell.constants'

const homeRepository = useApiRepository ? new ApiHomeRepository() : new MockHomeRepository()
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

export interface HomeNotificationViewData extends Aviso {
    dateLabel: string
}

export interface HomeViewModel {
    usuario: Usuario | null
    pedidosEmDigitacao: number
    indicadores: HomeIndicatorCardData[]
    notificacoes: HomeNotificationViewData[]
    loading: boolean
    error: string | null
    retry: () => void
}

function buildIndicatorCards(data: Indicador): HomeIndicatorCardData[] {
    return [
        { id: 'sales-month', label: homeStrings.salesMonth, value: currencyFormatter.format(data.salesThisMonth), to: shellRoutes.dashboard, icon: homeIcons.salesMonth },
        { id: 'sales-today', label: homeStrings.salesToday, value: currencyFormatter.format(data.salesToday), to: shellRoutes.dashboard, icon: homeIcons.salesToday },
        { id: 'orders-draft', label: homeStrings.ordersDraft, value: String(data.ordersInDraft), to: filteredRoute(shellRoutes.orders, 'em_digitacao'), icon: homeIcons.ordersDraft },
        { id: 'budgets-draft', label: homeStrings.budgetsDraft, value: String(data.budgetsInDraft), to: filteredRoute(shellRoutes.budget, 'em_digitacao'), icon: homeIcons.budgetsDraft },
        { id: 'clients-draft', label: homeStrings.clientsDraft, value: String(data.clientsInDraft), to: filteredRoute(shellRoutes.clients, 'em_digitacao'), icon: homeIcons.clientsDraft },
        { id: 'orders-approval', label: homeStrings.ordersApproval, value: String(data.ordersAwaitingApproval), to: filteredRoute(shellRoutes.clients, 'bloqueado'), icon: homeIcons.approval },
        { id: 'agendas-pending', label: homeStrings.agendasPending, value: String(data.pendingAgendas), to: filteredRoute(shellRoutes.agenda, 'pendentes'), icon: homeIcons.agendas },
        { id: 'tasks-pending', label: homeStrings.tasksPending, value: String(data.pendingTasks), to: filteredRoute(shellRoutes.taskAlias, 'pendentes'), icon: homeIcons.tasks },
    ]
}

export function useHomeViewModel(): HomeViewModel {
    const usuario = useAuthStore((state) => state.user)
    const [indicatorData, setIndicatorData] = useState<Indicador | null>(null)
    const [notificacoes, setNotificacoes] = useState<HomeNotificationViewData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let isActive = true

        async function loadHomeData(): Promise<void> {
            setLoading(true)
            setError(null)
            try {
                const [indicators, notices] = await Promise.all([
                    homeRepository.getIndicadores(),
                    homeRepository.getAvisos(),
                ])
                if (!isActive) return
                setIndicatorData(indicators)
                setNotificacoes(notices.map((notice) => ({
                    ...notice,
                    dateLabel: dateFormatter.format(new Date(notice.date)),
                })))
            } catch (loadError: unknown) {
                logger.error(homeStrings.loadFailed, loadError)
                if (isActive) setError(homeStrings.loadFailed)
            } finally {
                if (isActive) setLoading(false)
            }
        }

        void loadHomeData()
        return () => { isActive = false }
    }, [reloadKey])

    return {
        usuario,
        pedidosEmDigitacao: indicatorData?.ordersInDraft ?? 0,
        indicadores: indicatorData ? buildIndicatorCards(indicatorData) : [],
        notificacoes,
        loading,
        error,
        retry: () => setReloadKey((key) => key + 1),
    }
}