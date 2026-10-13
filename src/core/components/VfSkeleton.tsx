import clsx from 'clsx'

interface VfSkeletonProps {
    className?: string
}

export function VfSkeleton({ className }: VfSkeletonProps): React.JSX.Element {
    return <div aria-hidden="true" className={clsx('animate-pulse rounded bg-[var(--color-border)]/70', className)} />
}