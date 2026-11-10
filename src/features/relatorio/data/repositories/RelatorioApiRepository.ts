import { RelatorioApiDatasource } from '../datasources/RelatorioApiDatasource'
import type { RelatorioRepository } from '../../domain/repositories/RelatorioRepository'
import type { RelatorioResultado } from '../../domain/entities/RelatorioResultado'

export class RelatorioApiRepository implements RelatorioRepository {
    constructor(private readonly datasource = new RelatorioApiDatasource()) {}

    async gerarRelatorioIA(pergunta: string): Promise<RelatorioResultado> {
        return this.datasource.gerarRelatorioIA(pergunta)
    }
}
