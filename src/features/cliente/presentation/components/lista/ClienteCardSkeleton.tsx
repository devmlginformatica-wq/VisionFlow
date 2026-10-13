import { VfCard } from '../../../../../core/components/VfCard'
import { VfSkeleton } from '../../../../../core/components/VfSkeleton'

export function ClienteCardSkeleton(): React.JSX.Element {
    return (
        <VfCard className="space-y-4 p-4">
            <div className="flex items-start justify-between"><div className="space-y-2"><VfSkeleton className="h-5 w-44" /><VfSkeleton className="h-3 w-36" /></div><VfSkeleton className="size-9 rounded-full" /></div>
            <div className="flex gap-2"><VfSkeleton className="h-6 w-24 rounded-full" /><VfSkeleton className="h-6 w-28 rounded-full" /></div>
            <VfSkeleton className="h-4 w-48" />
            <VfSkeleton className="h-4 w-full" />
        </VfCard>
    )
}