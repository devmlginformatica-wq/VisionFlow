import clsx from 'clsx'

interface VfCardProps {
    children: React.ReactNode
    className?: string
}

export function VfCard({ children, className }: VfCardProps): React.JSX.Element {
    return (
        <div className={clsx('rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]', className)}>
            {children}
        </div>
    )
}