import { VfSkeleton } from '../../../../../core/components/VfSkeleton'

export function ClienteEditorSkeleton(): React.JSX.Element {
    return <div className="space-y-5"><VfSkeleton className="h-8 w-64" /><VfSkeleton className="h-12 w-full" /><div className="space-y-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5"><VfSkeleton className="h-10 w-full" /><VfSkeleton className="h-10 w-full" /><VfSkeleton className="h-10 w-full" /><VfSkeleton className="h-10 w-full" /></div></div>
}