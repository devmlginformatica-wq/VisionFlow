import { VfCard } from '../../../../../core/components/VfCard'
import { VfSkeleton } from '../../../../../core/components/VfSkeleton'

export function PedidoCardSkeleton(): React.JSX.Element {
    return <VfCard className="space-y-4 p-4"><div className="flex justify-between"><VfSkeleton className="size-9" /><VfSkeleton className="h-4 w-16" /></div><VfSkeleton className="h-5 w-40" /><div className="flex justify-between"><VfSkeleton className="h-4 w-20" /><VfSkeleton className="h-4 w-24" /></div><VfSkeleton className="h-6 w-28 rounded-full" /></VfCard>
}