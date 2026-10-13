import { authStrings } from '../auth.constants'

interface LoginBrandMarkProps {
    compact?: boolean
}

export function LoginBrandMark({ compact = false }: LoginBrandMarkProps): React.JSX.Element {
    return (
        <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-md bg-[var(--color-primary)] text-sm font-bold text-[var(--color-primary-foreground)]">VF</span>
            <span className="leading-tight">
                <span className="block text-sm font-semibold">{authStrings.brandingTitle}</span>
                {!compact && <span className="mt-1 block text-xs text-[var(--color-muted)]">{authStrings.brandingSubtitle}</span>}
            </span>
        </div>
    )
}