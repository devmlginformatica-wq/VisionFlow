import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { shellRoutes } from '../../../../core/shell/shell.constants'
import { useNetworkStatus } from '../../../../core/utils/useNetworkStatus'
import { useRelatorioViewModel } from '../viewmodels/useRelatorioViewModel'
import { RelatorioPerguntaForm } from '../components/RelatorioPerguntaForm'
import { EstatisticasResumo } from '../components/EstatisticasResumo'
import { ResultadoTabela } from '../components/ResultadoTabela'

const GraficoResultado = lazy(async () => {
    const module = await import('../components/GraficoResultado')
    return { default: module.GraficoResultado }
})

export function RelatoriosIAPage(): React.JSX.Element {
    const { t } = useTranslation()
    const { isOnline } = useNetworkStatus()
    const { loading, error, data, syncStatus, gerarRelatorio } = useRelatorioViewModel()

    return (
        <section className="mx-auto w-full max-w-7xl space-y-6" aria-busy={loading}>
            <Link to={shellRoutes.reports} className="text-sm font-medium text-[var(--color-primary)] hover:underline">{t('reports.ai.back')}</Link>
            <header>
                <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">{t('reports.ai.title')}</h1>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{t('reports.ai.description')}</p>
            </header>
            <RelatorioPerguntaForm loading={loading} isOnline={isOnline} onGenerate={gerarRelatorio} />
            {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
            {syncStatus === 'synced' && <p role="status" className="text-sm text-[var(--color-success)]">{t('reports.ai.statusReady')}</p>}
            {syncStatus === 'error' && !error && <p role="status" className="text-sm text-[var(--color-danger)]">{t('reports.ai.statusError')}</p>}
            {data && <div className="space-y-6"><h2 className="text-xl font-semibold text-[var(--color-foreground)]">{t('reports.ai.result')}</h2><EstatisticasResumo statistics={data.estatisticas} /><Suspense fallback={<p role="status" className="text-sm text-[var(--color-muted)]">{t('reports.ai.chartLoading')}</p>}><GraficoResultado result={data} /></Suspense><ResultadoTabela result={data} /></div>}
        </section>
    )
}
