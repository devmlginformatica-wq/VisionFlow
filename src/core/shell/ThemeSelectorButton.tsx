import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Moon, Sun, SunMoon } from 'lucide-react'
import type { ThemeMode } from '../theme/ThemeProvider'
import { useTheme } from '../theme/ThemeProvider'
import { kStr } from './shell.constants'
import { ThemeSelectorMenu } from './ThemeSelectorMenu'

interface ThemeSelectorButtonProps {
    mode: ThemeMode
}

export function ThemeSelectorButton({ mode }: ThemeSelectorButtonProps): React.JSX.Element {
    const { primaryColor, presetPrimaries, setPrimaryColor, setThemeMode } = useTheme()
    const [open, setOpen] = useState(false)
    const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : SunMoon

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    aria-label={kStr.theme}
                    title={kStr.theme}
                    className="inline-flex size-10 items-center justify-center rounded-md hover:bg-[var(--color-canvas)]"
                >
                    <Icon aria-hidden="true" size={19} />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-[min(280px,calc(100vw-2rem))] max-w-[280px] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-foreground)] shadow-xl"
                >
                    <ThemeSelectorMenu
                        mode={mode}
                        primaryColor={primaryColor}
                        presetPrimaries={presetPrimaries}
                        onThemeModeChange={setThemeMode}
                        onPrimaryColorChange={setPrimaryColor}
                        onSelection={() => setOpen(false)}
                    />
                    <Popover.Arrow className="fill-[var(--color-surface)]" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}