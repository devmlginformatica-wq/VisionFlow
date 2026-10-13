import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { deriveSidebarColors, presetPrimaries } from './colors'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeContextValue {
    mode: ThemeMode
    resolvedMode: 'light' | 'dark'
    primaryColor: string
    setThemeMode: (mode: ThemeMode) => void
    setPrimaryColor: (color: string) => void
    presetPrimaries: typeof presetPrimaries
}

interface StoredTheme {
    mode: ThemeMode
    primaryColor: string
}

const storageKey = 'visionflow:theme'
const defaultPrimaryColor = '#1AA7A4'
const ThemeContext = createContext<ThemeContextValue | null>(null)

function isThemeMode(value: unknown): value is ThemeMode {
    return value === 'light' || value === 'dark' || value === 'system'
}

function isHexColor(value: unknown): value is string {
    return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function readStoredTheme(): StoredTheme {
    try {
        const storedValue = window.localStorage.getItem(storageKey)
        if (!storedValue) return { mode: 'system', primaryColor: defaultPrimaryColor }

        const parsedValue: unknown = JSON.parse(storedValue)
        if (!isRecord(parsedValue)) {
            return { mode: 'system', primaryColor: defaultPrimaryColor }
        }

        return {
            mode: isThemeMode(parsedValue.mode) ? parsedValue.mode : 'system',
            primaryColor: isHexColor(parsedValue.primaryColor) ? parsedValue.primaryColor : defaultPrimaryColor,
        }
    } catch {
        return { mode: 'system', primaryColor: defaultPrimaryColor }
    }
}

function getSystemMode(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(color: string, mode: 'light' | 'dark'): void {
    const red = Number.parseInt(color.slice(1, 3), 16)
    const green = Number.parseInt(color.slice(3, 5), 16)
    const blue = Number.parseInt(color.slice(5, 7), 16)
    const darken = (channel: number): number => Math.round(channel * 0.9)
    const hoverColor = `#${[red, green, blue].map((channel) => darken(channel).toString(16).padStart(2, '0')).join('')}`
    const linearize = (channel: number): number => {
        const normalized = channel / 255
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
    }
    const luminance = 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue)
    const foreground = luminance > 0.179 ? '#000000' : '#FFFFFF'
    const sidebarColors = deriveSidebarColors(color, mode)
    const root = document.documentElement

    root.style.setProperty('--color-primary', color)
    root.style.setProperty('--color-primary-hover', hoverColor)
    root.style.setProperty('--color-primary-foreground', foreground)
    root.style.setProperty('--color-primary-soft', `rgba(${red}, ${green}, ${blue}, 0.1)`)
    root.style.setProperty('--color-primary-active', `rgba(${red}, ${green}, ${blue}, 0.12)`)
    root.style.setProperty('--color-sidebar', sidebarColors.sidebar)
    root.style.setProperty('--color-sidebar-foreground', sidebarColors.foreground)
    root.style.setProperty('--color-sidebar-hover', sidebarColors.hover)
}

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
    const [storedTheme] = useState(readStoredTheme)
    const [mode, setMode] = useState<ThemeMode>(storedTheme.mode)
    const [primaryColor, setPrimaryColorState] = useState(storedTheme.primaryColor)
    const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() =>
        storedTheme.mode === 'system' ? getSystemMode() : storedTheme.mode,
    )

    useEffect(() => {
        if (mode !== 'system') {
            setResolvedMode(mode)
            return
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const updateSystemMode = (): void => setResolvedMode(mediaQuery.matches ? 'dark' : 'light')
        updateSystemMode()
        mediaQuery.addEventListener('change', updateSystemMode)

        return () => mediaQuery.removeEventListener('change', updateSystemMode)
    }, [mode])

    useLayoutEffect(() => {
        document.documentElement.classList.toggle('dark', resolvedMode === 'dark')
        applyTheme(primaryColor, resolvedMode)
    }, [primaryColor, resolvedMode])

    useEffect(() => {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify({ mode, primaryColor }))
        } catch {
            return
        }
    }, [mode, primaryColor])

    const setPrimaryColor = (color: string): void => {
        if (isHexColor(color)) setPrimaryColorState(color.toUpperCase())
    }

    return (
        <ThemeContext.Provider
            value={{ mode, resolvedMode, primaryColor, setThemeMode: setMode, setPrimaryColor, presetPrimaries }}
        >
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
    return context
}
