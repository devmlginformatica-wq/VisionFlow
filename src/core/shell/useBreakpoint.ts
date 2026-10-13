import { useEffect, useState } from 'react'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

function resolveBreakpoint(width: number): Breakpoint {
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
}

export function useBreakpoint(): Breakpoint {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => resolveBreakpoint(window.innerWidth))

    useEffect(() => {
        const updateBreakpoint = (): void => setBreakpoint(resolveBreakpoint(window.innerWidth))
        window.addEventListener('resize', updateBreakpoint)
        return () => window.removeEventListener('resize', updateBreakpoint)
    }, [])

    return breakpoint
}