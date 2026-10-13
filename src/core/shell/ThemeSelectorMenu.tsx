import clsx from 'clsx'
import { Check } from 'lucide-react'
import type { ThemeMode } from '../theme/ThemeProvider'
import type { ThemeContextValue } from '../theme/ThemeProvider'
import { kStr } from './shell.constants'

interface ThemeSelectorMenuProps {
    mode: ThemeMode
    primaryColor: string
    presetPrimaries: ThemeContextValue['presetPrimaries']
    onThemeModeChange: (mode: ThemeMode) => void
    onPrimaryColorChange: (color: string) => void
    onSelection: () => void
}

interface SwatchStyle extends React.CSSProperties {
    '--swatch-color': string
}

function getSwatchStyle(color: string): SwatchStyle {
    return { '--swatch-color': color }
}

const modeOptions: ReadonlyArray<{ value: ThemeMode; label: string }> = [
    { value: 'light', label: kStr.modeLight },
    { value: 'dark', label: kStr.modeDark },
    { value: 'system', label: kStr.modeSystem },
]

export function ThemeSelectorMenu({
    mode,
    primaryColor,
    presetPrimaries,
    onThemeModeChange,
    onPrimaryColorChange,
    onSelection,
}: ThemeSelectorMenuProps): React.JSX.Element {
    return (
        <div className="space-y-5">
            <section aria-labelledby="theme-mode-title">
                <h2 id="theme-mode-title" className="mb-2 text-xs font-semibold text-[var(--color-muted)]">{kStr.themeMode}</h2>
                <div role="group" aria-label={kStr.themeMode} className="grid grid-cols-3 rounded-md bg-[var(--color-canvas)] p-1">
                    {modeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={mode === option.value}
                            onClick={() => { onThemeModeChange(option.value); onSelection() }}
                            className={clsx(
                                'rounded px-2 py-2 text-xs font-medium',
                                mode === option.value
                                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                                    : 'text-[var(--color-foreground)] hover:bg-[var(--color-surface)]',
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </section>
            <section aria-labelledby="theme-color-title">
                <h2 id="theme-color-title" className="mb-3 text-xs font-semibold text-[var(--color-muted)]">{kStr.primaryColor}</h2>
                <div className="flex flex-wrap gap-2" role="group" aria-label={kStr.primaryColor}>
                    {presetPrimaries.map((color) => {
                        const isSelected = primaryColor.toUpperCase() === color.value
                        return (
                            <button
                                key={color.value}
                                type="button"
                                aria-label={color.name}
                                aria-pressed={isSelected}
                                title={color.name}
                                onClick={() => { onPrimaryColorChange(color.value); onSelection() }}
                                className={clsx(
                                    'flex size-9 items-center justify-center rounded-full border-[var(--color-border)] bg-[var(--swatch-color)]',
                                    isSelected ? 'border-[2.5px] border-[var(--color-primary)]' : 'border',
                                )}
                                style={getSwatchStyle(color.value)}
                            >
                                {isSelected && <Check aria-hidden="true" size={17} className="text-[var(--color-primary-foreground)]" />}
                            </button>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}