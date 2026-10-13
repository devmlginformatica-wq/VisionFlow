export const presetPrimaries = [
    { name: 'Turquesa', value: '#1AA7A4' },
    { name: 'Azul', value: '#2878C8' },
    { name: 'Verde', value: '#378A56' },
    { name: 'Laranja', value: '#D87532' },
    { name: 'Rosa', value: '#C94F72' },
] as const

export interface SidebarColors {
    sidebar: string
    foreground: string
    hover: string
}

interface HslColor {
    hue: number
    saturation: number
    lightness: number
}

function hexToHsl(hexColor: string): HslColor {
    const red = Number.parseInt(hexColor.slice(1, 3), 16) / 255
    const green = Number.parseInt(hexColor.slice(3, 5), 16) / 255
    const blue = Number.parseInt(hexColor.slice(5, 7), 16) / 255
    const maximum = Math.max(red, green, blue)
    const minimum = Math.min(red, green, blue)
    const difference = maximum - minimum
    const lightness = (maximum + minimum) / 2
    let hue = 0
    let saturation = 0

    if (difference > 0) {
        saturation = difference / (1 - Math.abs(2 * lightness - 1))
        if (maximum === red) hue = ((green - blue) / difference) % 6
        else if (maximum === green) hue = (blue - red) / difference + 2
        else hue = (red - green) / difference + 4
        hue *= 60
        if (hue < 0) hue += 360
    }

    return { hue, saturation, lightness }
}

function hslToHex({ hue, saturation, lightness }: HslColor): string {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
    const hueSection = hue / 60
    const secondary = chroma * (1 - Math.abs((hueSection % 2) - 1))
    const offset = lightness - chroma / 2
    const channels = hueSection < 1
        ? [chroma, secondary, 0]
        : hueSection < 2
            ? [secondary, chroma, 0]
            : hueSection < 3
                ? [0, chroma, secondary]
                : hueSection < 4
                    ? [0, secondary, chroma]
                    : hueSection < 5
                        ? [secondary, 0, chroma]
                        : [chroma, 0, secondary]

    return `#${channels.map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

export function deriveSidebarColors(primaryHex: string, mode: 'light' | 'dark'): SidebarColors {
    const primary = hexToHsl(primaryHex)
    const sidebar = mode === 'light'
        ? hslToHex({ ...primary, saturation: primary.saturation * 0.5, lightness: 0.96 })
        : hslToHex({ ...primary, saturation: primary.saturation * 0.3, lightness: 0.1 })

    return {
        sidebar,
        foreground: mode === 'light' ? '#1F2937' : '#E5E7EB',
        hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
    }
}