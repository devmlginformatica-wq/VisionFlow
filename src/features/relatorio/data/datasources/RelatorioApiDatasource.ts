import { apiRequest } from '../../../../core/api/apiClient'
import { RelatorioResultado } from '../../domain/entities/RelatorioResultado'

export class RelatorioApiDatasource {
    async gerarRelatorioIA(pergunta: string): Promise<RelatorioResultado> {
        const response = await apiRequest<unknown>('/relatorios/ia', {
            method: 'POST',
            body: JSON.stringify({ pergunta }),
        })

        return RelatorioResultado.fromJson(response)
    }
}
