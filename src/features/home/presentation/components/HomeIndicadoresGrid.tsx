import { VfCard } from '../../../../core/components/VfCard'
import { VfSkeleton } from '../../../../core/components/VfSkeleton'
import type { HomeIndicatorCardData } from '../home.constants'
import { homeStrings } from '../home.constants'
import { HomeIndicadorCard } from './HomeIndicadorCard'

interface HomeIndicadoresGridProps {
    indicators: HomeIndicatorCardData[]
    loading: boolean
}

function IndicatorSkeleton({ index }: { index: number }): React.JSX.Element {
    return (
        <VfCard key={index} className="min-h-36 space-y-4 p-4">
            <VfSkeleton className="size-9" />
            <VfSkeleton className="h-4 w-32 max-w-full" />
            <VfSkeleton className="h-7 w-24" />
        </VfCard>
    )
}

export function HomeIndicadoresGrid({ indicators, loading }: HomeIndicadoresGridProps): React.JSX.Element {
    return (
        <section aria-labelledby="home-indicators-title" aria-busy={loading}>
            <h2 id="home-indicators-title" className="mb-3 text-sm font-semibold">{homeStrings.indicatorsTitle}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {loading
                    ? Array.from({ length: 8 }, (_, index) => <IndicatorSkeleton key={index} index={index} />)
                    : indicators.map((indicator) => <HomeIndicadorCard key={indicator.id} indicator={indicator} />)}
            </div>
        </section>
    )
}