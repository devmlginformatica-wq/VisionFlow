import { ArrowUpRight } from 'lucide-react'
import { authStrings } from '../auth.constants'

export function LoginBranding(): React.JSX.Element {
    return (
        <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[var(--color-primary)] p-12 text-[var(--color-primary-foreground)] lg:flex xl:p-16">
            <div aria-hidden="true" className="pointer-events-none absolute -right-64 -top-56 size-[42rem] rounded-full border border-current/15">
                <div className="absolute inset-12 rounded-full border border-current/10" />
                <div className="absolute inset-28 rounded-full border border-current/10" />
            </div>
            <div className="relative flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-md border border-current/30 text-sm font-bold">VF</span>
                <div>
                    <p className="text-sm font-semibold">{authStrings.brandingTitle}</p>
                    <p className="text-xs opacity-75">{authStrings.brandingSubtitle}</p>
                </div>
            </div>
            <div className="relative max-w-2xl pb-10">
                <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase">
                    {authStrings.brandingSubtitle}<ArrowUpRight aria-hidden="true" size={15} />
                </p>
                <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] xl:text-6xl">{authStrings.brandingMessage}</h1>
            </div>
            <p className="relative text-xs opacity-70">{authStrings.brandingTitle}</p>
        </aside>
    )
}