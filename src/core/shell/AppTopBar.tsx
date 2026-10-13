import { Link } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { useAuthStore } from '../../features/auth/presentation/stores/useAuthStore'
import { kStr, shellRoutes } from './shell.constants'
import { ThemeSelectorButton } from './ThemeSelectorButton'
import type { LoggedInUser, ShellCompany } from './domain/entities/ShellData'

interface AppTopBarProps {
    company: ShellCompany | null
    user: LoggedInUser | null
    unreadNotifications: number
    onMenuOpen: () => void
}

interface CompanyDetailsProps {
    company: ShellCompany | null
}

function CompanyDetails({ company }: CompanyDetailsProps): React.JSX.Element {
    return (
        <div className="hidden min-w-0 flex-1 items-center gap-5 lg:flex">
            <p className="truncate text-sm font-semibold">{company?.name ?? kStr.companyFallback}</p>
            <p className="text-xs text-[var(--color-muted)]">{company?.taxId}</p>
            <p className="text-xs text-[var(--color-muted)]">{company?.region}</p>
            <p className="text-xs text-[var(--color-muted)]">{company?.contact}</p>
        </div>
    )
}

function NotificationAction({ count }: { count: number }): React.JSX.Element {
    return (
        <Link
            to={shellRoutes.notifications}
            aria-label={`${count} ${kStr.unreadNotifications}`}
            title={kStr.notifications}
            className="relative inline-flex size-10 items-center justify-center rounded-md hover:bg-[var(--color-canvas)]"
        >
            <Bell aria-hidden="true" size={19} />
            {count > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-full bg-[var(--color-primary)] px-1 text-center text-[10px] leading-4 text-[var(--color-primary-foreground)]">{count}</span>}
        </Link>
    )
}

function UserMenu({ user }: { user: LoggedInUser | null }): React.JSX.Element {
    const initials = user?.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('') ?? 'VF'
    const clearSession = useAuthStore((state) => state.clearSession)

    return (
        <details className="relative lg:hidden">
            <summary aria-label={kStr.userMenu} className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-xs font-semibold text-[var(--color-primary)]">
                {initials}
            </summary>
            <div className="absolute right-0 top-12 z-30 w-56 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg">
                <p className="truncate text-sm font-semibold">{user?.name ?? kStr.userMenu}</p>
                <p className="mb-3 truncate text-xs text-[var(--color-muted)]">{user?.email}</p>
                <Link to={shellRoutes.login} onClick={clearSession} className="flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-[var(--color-canvas)]">
                    {kStr.logout}
                </Link>
            </div>
        </details>
    )
}

export function AppTopBar({ company, user, unreadNotifications, onMenuOpen }: AppTopBarProps): React.JSX.Element {
    const { mode } = useTheme()
    const clearSession = useAuthStore((state) => state.clearSession)

    return (
        <header className="z-20 flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 md:px-5">
            <button type="button" onClick={onMenuOpen} aria-label={kStr.menuOpen} className="inline-flex size-10 items-center justify-center rounded-md hover:bg-[var(--color-canvas)] md:hidden">
                <Menu aria-hidden="true" size={21} />
            </button>
            <Link to={shellRoutes.home} className="flex shrink-0 items-center gap-2" aria-label={kStr.appName}>
                <span className="flex size-9 items-center justify-center rounded-md bg-[var(--color-primary)] text-xs font-bold text-[var(--color-primary-foreground)]">VF</span>
                <span className="hidden max-w-56 truncate text-sm font-semibold md:block lg:hidden">{company?.name ?? kStr.companyFallback}</span>
            </Link>
            <CompanyDetails company={company} />
            <div className="ml-auto flex shrink-0 items-center gap-2">
                <ThemeSelectorButton mode={mode} />
                <div className="hidden md:block"><NotificationAction count={unreadNotifications} /></div>
                <UserMenu user={user} />
                <Link to={shellRoutes.login} onClick={clearSession} className="hidden h-10 items-center gap-2 rounded-md px-3 text-sm hover:bg-[var(--color-canvas)] lg:inline-flex">
                    {kStr.logout}
                </Link>
            </div>
        </header>
    )
}