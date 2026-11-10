import type { RelatorioResultado } from '../entities/RelatorioResultado'

export interface RelatorioRepository {
    gerarRelatorioIA(pergunta: string): Promise<RelatorioResultado>
}
