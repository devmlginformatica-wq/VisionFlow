interface ShellPlaceholderPageProps {
    title: string
    description: string
}

export function ShellPlaceholderPage({ title, description }: ShellPlaceholderPageProps): React.JSX.Element {
    return (
        <section aria-labelledby="page-title" className="mx-auto w-full max-w-7xl">
            <div className="border-b border-[var(--color-border)] pb-5">
                <p className="mb-2 text-xs font-semibold uppercase text-[var(--color-primary)]">Vision Flow</p>
                <h1 id="page-title" className="text-2xl font-semibold">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">{description}</p>
            </div>
        </section>
    )
}