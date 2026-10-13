import { apiRequest } from '../../../../core/api/apiClient'
import type { Aviso } from '../../domain/entities/Aviso'
import type { Indicador } from '../../domain/entities/Indicador'
import type { HomeRepository } from '../../domain/repositories/HomeRepository'

interface ApiIndicadoresResponse {
    vendas_mes: number
    vendas_hoje: number
    pedidos_em_digitacao: number
    orcamentos_em_digitacao: number
    clientes_em_digitacao: number
    pedidos_aguardando_aprovacao: number
    agendas_pendentes: number
    tarefas_pendentes: number
    notificacoes_nao_lidas: number
}

interface ApiNotificacaoResponse {
    id: number
    titulo: string
    lida: boolean
    data: string
}

export class ApiHomeRepository implements HomeRepository {
    async getIndicadores(): Promise<Indicador> {
        const response = await apiRequest<ApiIndicadoresResponse>('/home/indicadores')

        return {
            salesThisMonth: response.vendas_mes,
            salesToday: response.vendas_hoje,
            ordersInDraft: response.pedidos_em_digitacao,
            budgetsInDraft: response.orcamentos_em_digitacao,
            clientsInDraft: response.clientes_em_digitacao,
            ordersAwaitingApproval: response.pedidos_aguardando_aprovacao,
            pendingAgendas: response.agendas_pendentes,
            pendingTasks: response.tarefas_pendentes,
            unreadNotifications: response.notificacoes_nao_lidas,
        }
    }

    async getAvisos(): Promise<Aviso[]> {
        const response = await apiRequest<ApiNotificacaoResponse[]>('/notificacoes')

        return response
            .filter((notification) => !notification.lida)
            .map((notification) => ({
                id: notification.id,
                title: notification.titulo,
                date: notification.data,
            }))
    }
}