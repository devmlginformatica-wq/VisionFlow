import indicatorsMock from '../../../../mocks/home/indicadores.json'
import notificationsMock from '../../../../mocks/notificacoes/listar.json'
import type { Aviso } from '../../domain/entities/Aviso'
import type { Indicador } from '../../domain/entities/Indicador'
import type { HomeRepository } from '../../domain/repositories/HomeRepository'

export class MockHomeRepository implements HomeRepository {
    async getIndicadores(): Promise<Indicador> {
        const data = indicatorsMock.data
        return {
            salesThisMonth: data.vendas_mes,
            salesToday: data.vendas_hoje,
            ordersInDraft: data.pedidos_em_digitacao,
            budgetsInDraft: data.orcamentos_em_digitacao,
            clientsInDraft: data.clientes_em_digitacao,
            ordersAwaitingApproval: data.pedidos_aguardando_aprovacao,
            pendingAgendas: data.agendas_pendentes,
            pendingTasks: data.tarefas_pendentes,
            unreadNotifications: data.notificacoes_nao_lidas,
        }
    }

    async getAvisos(): Promise<Aviso[]> {
        return notificationsMock.data
            .filter((notification) => !notification.lida)
            .map((notification) => ({
                id: notification.id,
                title: notification.titulo,
                date: notification.data,
            }))
    }
}