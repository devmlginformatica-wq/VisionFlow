import { useState } from 'react'
import clsx from 'clsx'
import { PanelLeft } from 'lucide-react'
import { AppMenuItem } from './AppMenuItem'
import { kStr, shellNavigation } from './shell.constants'
import { useBreakpoint } from './useBreakpoint'

const storageKey = 'visionflow:shell:sidebar-expanded'

function readPinnedState(): boolean {
    try {
        return window.sessionStorage.getItem(storageKey) === 'true'
    } catch {
        return false
    }
}

export function AppSideMenu(): React.JSX.Element {
    const breakpoint = useBreakpoint()
    const [pinnedOpen, setPinnedOpen] = useState(readPinnedState)
    const [hovered, setHovered] = useState(false)
    const expanded = breakpoint === 'desktop' && (pinnedOpen || hovered)
    const toggleLabel = pinnedOpen ? kStr.collapseMenu : expanded ? kStr.pinMenu : kStr.expandMenu

    function togglePinnedState(): void {
        const nextState = !pinnedOpen
        setPinnedOpen(nextState)
        try {
            window.sessionStorage.setItem(storageKey, String(nextState))
        } catch {
            return
        }
    }

    return (
        <aside
            aria-label={kStr.appName}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={clsx(
                'hidden shrink-0 flex-col bg-[var(--color-sidebar)] py-3 text-[var(--color-sidebar-foreground)] transition-[width] duration-200 md:flex',
                expanded ? 'w-16 lg:w-64' : 'w-16',
            )}
        >
            <nav aria-label={kStr.menuOpen} className="flex-1 space-y-1 px-2">
                {shellNavigation.map((item) => (
                    <AppMenuItem key={item.path} item={item} expanded={expanded} />
                ))}
            </nav>
            <button
                type="button"
                onClick={togglePinnedState}
                aria-label={toggleLabel}
                aria-pressed={pinnedOpen}
                title={toggleLabel}
                className="mx-2 hidden h-11 items-center gap-3 rounded-md px-3 text-sm hover:bg-[var(--color-sidebar-hover)] lg:flex"
            >
                <PanelLeft aria-hidden="true" size={20} />
                {expanded && <span>{toggleLabel}</span>}
            </button>
        </aside>
    )
}