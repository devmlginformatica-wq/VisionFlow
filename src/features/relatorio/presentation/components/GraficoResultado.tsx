import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import type { GraficoSugerido, RelatorioResultado, RelatorioValor } from '../../domain/entities/RelatorioResultado'

interface GraficoResultadoProps {
    result: RelatorioResultado
}

interface ChartBodyProps {
    chart: GraficoSugerido
    data: Record<string, RelatorioValor>[]
}

function ChartBody({ chart, data }: ChartBodyProps): React.JSX.Element | null {
    if (chart.tipo === 'bar') {
        return <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={chart.eixoX} /><YAxis /><Tooltip /><Legend /><Bar dataKey={chart.eixoY} fill="var(--color-primary)" /></BarChart>
    }
    if (chart.tipo === 'line') {
        return <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={chart.eixoX} /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey={chart.eixoY} stroke="var(--color-primary)" /></LineChart>
    }
    if (chart.tipo === 'scatter') {
        return <ScatterChart><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={chart.eixoX} type="number" /><YAxis dataKey={chart.eixoY} type="number" /><Tooltip /><Scatter data={data} dataKey={chart.eixoY} fill="var(--color-primary)" /></ScatterChart>
    }
    return null
}

function mapChartData(result: RelatorioResultado): Record<string, RelatorioValor>[] {
    return result.linhas.map((row) => {
        const values: Record<string, RelatorioValor> = {}
        result.colunas.forEach((column, index) => { values[column] = row[index] ?? null })
        return values
    })
}

export function GraficoResultado({ result }: GraficoResultadoProps): React.JSX.Element | null {
    const { t } = useTranslation()
    const chart = result.graficoSugerido
    if (!chart || result.linhas.length === 0) return null

    const data = mapChartData(result)
    const content = <ChartBody chart={chart} data={data} />
    return (
        <section className="space-y-3" aria-labelledby="report-chart-title">
            <h2 id="report-chart-title" className="text-lg font-semibold text-[var(--color-foreground)]">{t('reports.chart.title')}</h2>
            {content ? (
                <div className="h-80 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                    <ResponsiveContainer width="100%" height="100%">{content}</ResponsiveContainer>
                </div>
            ) : (
                <p className="text-sm text-[var(--color-muted)]">{t('reports.chart.unsupported')}</p>
            )}
            <p className="text-xs text-[var(--color-muted)]">{t('reports.chart.xAxis', { name: chart.eixoX })} · {t('reports.chart.yAxis', { name: chart.eixoY })}</p>
        </section>
    )
}
