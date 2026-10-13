import { Bell } from 'lucide-react'
import { VfCard } from '../../../../core/components/VfCard'
import { VfSkeleton } from '../../../../core/components/VfSkeleton'
import type { HomeNotificationViewData } from '../viewmodels/useHomeViewModel'
import { homeStrings } from '../home.constants'
import { HomeAvisoContent } from './HomeAvisoContent'

interface HomeAvisosProps {
    notifications: HomeNotificationViewData[]
    loading: boolean
}

export function HomeAvisos({ notifications, loading }: HomeAvisosProps): React.JSX.Element {
    if (loading) {
        return <VfCard className="w-full space-y-3 p-5 lg:w-[21rem]">
            <VfSkeleton className="h-4 w-36" />
            <VfSkeleton className="h-5 w-48 max-w-full" />
            <VfSkeleton className="h-10 w-full" />
        </VfCard>
    }

    return (
        <VfCard className="w-full p-5 lg:w-[21rem]">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{homeStrings.noticesTitle}</h2>
                <Bell aria-hidden="true" size={17} className="text-[var(--color-muted)]" />
            </div>
            <HomeAvisoContent notifications={notifications} />
        </VfCard>
    )
}