import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { VfSkeleton } from '../../../../core/components/VfSkeleton'
import { shellRoutes } from '../../../../core/shell/shell.constants'
import type { Usuario } from '../../../auth/domain/entities/Usuario'
import { filteredRoute, homeStrings } from '../home.constants'

interface HomeWelcomeProps {
    usuario: Usuario | null
    pedidosEmDigitacao: number
    loading: boolean
}

export function HomeWelcome({ usuario, pedidosEmDigitacao, loading }: HomeWelcomeProps): React.JSX.Element {
    if (loading) {
        return (
            <section aria-label={homeStrings.loading} className="flex-1 space-y-3 py-2">
                <VfSkeleton className="h-3 w-24" />
                <VfSkeleton className="h-8 w-64 max-w-full" />
                <VfSkeleton className="h-4 w-56 max-w-full" />
                <VfSkeleton className="mt-4 h-10 w-52" />
            </section>
        )
    }

    return (
        <section className="flex min-w-0 flex-1 flex-col items-start justify-center py-2">
            <p className="mb-2 text-xs font-semibold uppercase text-[var(--color-primary)]">{homeStrings.eyebrow}</p>
            <h1 className="text-2xl font-semibold md:text-3xl">{homeStrings.greeting}, {usuario?.name ?? homeStrings.welcomeFallback}</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{homeStrings.welcomeDescription}</p>
            {pedidosEmDigitacao > 0 && (
                <Link
                    to={filteredRoute(shellRoutes.orders, 'em_digitacao')}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]"
                >
                    {homeStrings.viewDraftOrders}<ArrowRight aria-hidden="true" size={16} />
                </Link>
            )}
        </section>
    )
}