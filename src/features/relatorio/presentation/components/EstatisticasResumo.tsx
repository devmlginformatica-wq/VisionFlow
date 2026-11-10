import { useTranslation } from 'react-i18next'
import { VfCard } from '../../../../core/components/VfCard'
import type { RelatorioEstatisticas } from '../../domain/entities/RelatorioResultado'

interface EstatisticasResumoProps {
    statistics: RelatorioEstatisticas
}

export function EstatisticasResumo({ statistics }: EstatisticasResumoProps): React.JSX.Element {
    const { t, i18n } = useTranslation()
    const locale = (i18n.resolvedLanguage ?? i18n.language).replace('_', '-')
    const formatter = new Intl.NumberFormat(locale)

    return (
        <section className="space-y-3" aria-labelledby="report-statistics-title">
            <h2 id="report-statistics-title" className="text-lg font-semibold text-[var(--color-foreground)]">{t('reports.stats.title')}</h2>
            <p className="text-sm text-[var(--color-muted)]">{t('reports.stats.totalRecords', { count: statistics.totalRegistros })}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Object.entries(statistics.colunasNumericas).map(([column, values]) => (
                    <VfCard key={column} className="p-4">
                        <h3 className="truncate text-sm font-semibold text-[var(--color-foreground)]">{column}</h3>
                        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div><dt className="text-[var(--color-muted)]">{t('reports.stats.sum')}</dt><dd className="font-medium text-[var(--color-foreground)]">{formatter.format(values.soma)}</dd></div>
                            <div><dt className="text-[var(--color-muted)]">{t('reports.stats.average')}</dt><dd className="font-medium text-[var(--color-foreground)]">{formatter.format(values.media)}</dd></div>
                        </dl>
                    </VfCard>
                ))}
            </div>
        </section>
    )
}
