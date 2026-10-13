import { apiRequest } from '../../../api/apiClient'
import type { ShellData } from '../../domain/entities/ShellData'
import type { ShellRepository } from '../../domain/repositories/ShellRepository'

interface ApiCompanyResponse {
    nome: string
    cnpj: string
    regional: string
    contato: string
    usuario_logado: {
        id: number
        nome: string
        email: string
    }
}

interface ApiNotificationsCounterResponse {
    nao_lidas: number
}

export class ApiShellRepository implements ShellRepository {
    async getShellData(): Promise<ShellData> {
        const [company, notifications] = await Promise.all([
            apiRequest<ApiCompanyResponse>('/shell/empresa'),
            apiRequest<ApiNotificationsCounterResponse>('/shell/notificacoes'),
        ])

        return {
            company: {
                name: company.nome,
                taxId: company.cnpj,
                region: company.regional,
                contact: company.contato,
            },
            loggedInUser: {
                id: company.usuario_logado.id,
                name: company.usuario_logado.nome,
                email: company.usuario_logado.email,
            },
            unreadNotifications: notifications.nao_lidas,
        }
    }
}