import companyMock from '../../../../mocks/shell/empresa.json'
import notificationsMock from '../../../../mocks/shell/notificacoes.json'
import type { ShellData } from '../../domain/entities/ShellData'
import type { ShellRepository } from '../../domain/repositories/ShellRepository'

export class MockShellRepository implements ShellRepository {
    async getShellData(): Promise<ShellData> {
        const company = companyMock.data

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
            unreadNotifications: notificationsMock.data.nao_lidas,
        }
    }
}