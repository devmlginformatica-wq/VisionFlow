export type RelatorioValor = string | number | boolean | null

export interface EstatisticaNumerica {
    soma: number
    media: number
    minimo: number
    maximo: number
    desvioPadrao: number
}

export interface RelatorioEstatisticas {
    totalRegistros: number
    colunasNumericas: Record<string, EstatisticaNumerica>
}

export interface GraficoSugerido {
    tipo: string
    eixoX: string
    eixoY: string
}

export interface RelatorioResultado {
    colunas: string[]
    linhas: RelatorioValor[][]
    estatisticas: RelatorioEstatisticas
    graficoSugerido: GraficoSugerido | null
}

function asRecord(value: unknown, field: string): Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new TypeError(`Campo inválido no relatório: ${field}`)
    }

    return value as Record<string, unknown>
}

function readNumber(value: unknown, field: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new TypeError(`Campo numérico inválido no relatório: ${field}`)
    }

    return value
}

function readString(value: unknown, field: string): string {
    if (typeof value !== 'string') {
        throw new TypeError(`Campo textual inválido no relatório: ${field}`)
    }

    return value
}

function parseValue(value: unknown): RelatorioValor {
    if (
        value === null
        || typeof value === 'string'
        || typeof value === 'boolean'
        || (typeof value === 'number' && Number.isFinite(value))
    ) {
        return value
    }

    throw new TypeError('O relatório contém um valor de célula inválido.')
}

function parseStatistics(value: unknown): RelatorioEstatisticas {
    const source = asRecord(value, 'estatisticas')
    const total = source.total_registros ?? source.totalRegistros
    const numericColumns = source.colunas_numericas ?? source.colunasNumericas

    if (typeof total !== 'number' || !Number.isInteger(total) || total < 0) {
        throw new TypeError('Campo inválido no relatório: estatisticas.total_registros')
    }

    const columns = asRecord(numericColumns, 'estatisticas.colunas_numericas')
    const colunasNumericas = Object.fromEntries(
        Object.entries(columns).map(([name, value]) => {
            const stats = asRecord(value, `estatisticas.colunas_numericas.${name}`)
            return [name, {
                soma: readNumber(stats.soma, `${name}.soma`),
                media: readNumber(stats.media, `${name}.media`),
                minimo: readNumber(stats.minimo, `${name}.minimo`),
                maximo: readNumber(stats.maximo, `${name}.maximo`),
                desvioPadrao: readNumber(stats.desvio_padrao ?? stats.desvioPadrao, `${name}.desvio_padrao`),
            }]
        }),
    )

    return { totalRegistros: total, colunasNumericas }
}

function parseSuggestedChart(value: unknown): GraficoSugerido | null {
    if (value === undefined || value === null) return null

    const source = asRecord(value, 'grafico_sugerido')
    return {
        tipo: readString(source.tipo, 'grafico_sugerido.tipo'),
        eixoX: readString(source.eixo_x ?? source.eixoX, 'grafico_sugerido.eixo_x'),
        eixoY: readString(source.eixo_y ?? source.eixoY, 'grafico_sugerido.eixo_y'),
    }
}

export const RelatorioResultado = {
    fromJson(json: unknown): RelatorioResultado {
        const source = asRecord(json, 'relatorio')
        if (!Array.isArray(source.colunas) || !source.colunas.every((column) => typeof column === 'string')) {
            throw new TypeError('Campo inválido no relatório: colunas')
        }
        if (!Array.isArray(source.linhas) || !source.linhas.every(Array.isArray)) {
            throw new TypeError('Campo inválido no relatório: linhas')
        }

        return {
            colunas: source.colunas,
            linhas: source.linhas.map((row) => row.map(parseValue)),
            estatisticas: parseStatistics(source.estatisticas),
            graficoSugerido: parseSuggestedChart(source.grafico_sugerido ?? source.graficoSugerido),
        }
    },

    toJson(result: RelatorioResultado): Record<string, unknown> {
        return {
            colunas: result.colunas,
            linhas: result.linhas,
            estatisticas: {
                total_registros: result.estatisticas.totalRegistros,
                colunas_numericas: Object.fromEntries(
                    Object.entries(result.estatisticas.colunasNumericas).map(([name, stats]) => [
                        name,
                        {
                            soma: stats.soma,
                            media: stats.media,
                            minimo: stats.minimo,
                            maximo: stats.maximo,
                            desvio_padrao: stats.desvioPadrao,
                        },
                    ]),
                ),
            },
            grafico_sugerido: result.graficoSugerido
                ? {
                    tipo: result.graficoSugerido.tipo,
                    eixo_x: result.graficoSugerido.eixoX,
                    eixo_y: result.graficoSugerido.eixoY,
                }
                : null,
        }
    },
}
