import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { VfCard } from '../../../../core/components/VfCard'

interface RelatorioCardProps {
    title: string
    description: string
    icon: LucideIcon
    destination?: string
}

export function RelatorioCard({
    title,
    description,
    icon: Icon,
    destination,
}: RelatorioCardProps): React.JSX.Element {
    const { t } = useTranslation()
    const content = (
        <VfCard className="h-full p-5 transition-colors hover:border-[var(--color-primary)]">
            <div className="mb-4 flex items-center justify-between text-[var(--color-primary)]">
                <Icon aria-hidden="true" size={24} />
                {!destination && <span className="text-xs font-medium text-[var(--color-muted)]">{t('reports.hub.comingSoon')}</span>}
            </div>
            <h2 className="font-semibold text-[var(--color-foreground)]">{title}</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p>
        </VfCard>
    )

    return destination
        ? <Link className="block h-full rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]" to={destination} aria-label={t('reports.hub.open')}>{content}</Link>
        : <div className="h-full">{content}</div>
}
