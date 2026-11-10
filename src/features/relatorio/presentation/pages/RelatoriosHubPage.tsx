import { BarChart3, Users, PackageSearch, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { shellRoutes } from '../../../../core/shell/shell.constants'
import { RelatorioCard } from '../components/RelatorioCard'

const upcomingReports = [
    { title: 'reports.hub.sales', description: 'reports.hub.salesDescription', icon: BarChart3 },
    { title: 'reports.hub.customers', description: 'reports.hub.customersDescription', icon: Users },
    { title: 'reports.hub.products', description: 'reports.hub.productsDescription', icon: PackageSearch },
]

export function RelatoriosHubPage(): React.JSX.Element {
    const { t } = useTranslation()

    return (
        <section className="mx-auto w-full max-w-7xl space-y-6">
            <header>
                <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">{t('reports.hub.title')}</h1>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{t('reports.hub.description')}</p>
            </header>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <RelatorioCard title={t('reports.hub.intelligent')} description={t('reports.hub.intelligentDescription')} icon={Sparkles} destination={`${shellRoutes.reports}/ia`} />
                {upcomingReports.map((report) => (
                    <RelatorioCard key={report.title} title={t(report.title)} description={t(report.description)} icon={report.icon} />
                ))}
            </div>
        </section>
    )
}
