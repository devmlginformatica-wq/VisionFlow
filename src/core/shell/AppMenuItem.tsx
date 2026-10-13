import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/presentation/stores/useAuthStore'
import { shellRoutes, type ShellNavigationItem } from './shell.constants'

export interface AppMenuItemProps {
    item: ShellNavigationItem
    expanded: boolean
    onNavigate?: () => void
}

export function AppMenuItem({ item, expanded, onNavigate }: AppMenuItemProps): React.JSX.Element {
    const Icon = item.icon
    const clearSession = useAuthStore((state) => state.clearSession)

    function handleNavigate(): void {
        onNavigate?.()
        if (item.path === shellRoutes.login) clearSession()
    }

    return (
        <NavLink
            to={item.path}
            end={item.path === '/'}
            title={expanded ? undefined : item.label}
            onClick={handleNavigate}
            className={({ isActive }) => clsx(
                'flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                isActive
                    ? 'bg-[var(--color-primary-active)] font-semibold text-[var(--color-primary)]'
                    : 'text-inherit hover:bg-[var(--color-sidebar-hover)]',
            )}
        >
            <Icon aria-hidden="true" size={20} className="shrink-0" />
            <span className={clsx('truncate', expanded ? 'block' : 'sr-only')}>{item.label}</span>
        </NavLink>
    )
}