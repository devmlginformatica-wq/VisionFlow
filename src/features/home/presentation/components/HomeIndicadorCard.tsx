import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { VfCard } from '../../../../core/components/VfCard'
import type { HomeIndicatorCardData } from '../home.constants'

interface HomeIndicadorCardProps {
    indicator: HomeIndicatorCardData
}

export function HomeIndicadorCard({ indicator }: HomeIndicadorCardProps): React.JSX.Element {
    const Icon = indicator.icon

    return (
        <VfCard className="min-h-36 transition-colors hover:border-[var(--color-primary)]">
            <Link to={indicator.to} className="group flex h-full min-h-36 flex-col p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]">
                <div className="mb-4 flex items-start justify-between">
                    <span className="flex size-9 items-center justify-center rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                        <Icon aria-hidden="true" size={18} />
                    </span>
                    <ArrowUpRight aria-hidden="true" size={17} className="text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-primary)]" />
                </div>
                <span className="text-sm leading-5 text-[var(--color-muted)]">{indicator.label}</span>
                <span className="mt-auto pt-2 text-2xl font-semibold tabular-nums">{indicator.value}</span>
            </Link>
        </VfCard>
    )
}