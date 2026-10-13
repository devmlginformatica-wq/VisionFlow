import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppDrawer } from './AppDrawer'
import { AppSideMenu } from './AppSideMenu'
import { AppTopBar } from './AppTopBar'
import { kStr } from './shell.constants'
import { useShellViewModel } from './useShellViewModel'

export function AppShell(): React.JSX.Element {
    const { company, loggedInUser, unreadNotifications, loading, error } = useShellViewModel()
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        const closeDrawerOutsideMobile = (): void => {
            if (window.innerWidth >= 768) setDrawerOpen(false)
        }
        window.addEventListener('resize', closeDrawerOutsideMobile)
        return () => window.removeEventListener('resize', closeDrawerOutsideMobile)
    }, [])

    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-[var(--color-canvas)] text-[var(--color-foreground)]">
            <AppTopBar company={company} user={loggedInUser} unreadNotifications={unreadNotifications} onMenuOpen={() => setDrawerOpen(true)} />
            <div className="flex min-h-0 flex-1">
                <AppSideMenu />
                <main data-shell-content className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {loading && <p role="status" className="sr-only">{kStr.loading}</p>}
                    {error && <p role="alert" className="mb-5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">{error}</p>}
                    <Outlet />
                </main>
            </div>
            <AppDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
        </div>
    )
}