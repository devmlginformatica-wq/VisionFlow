import { VfError } from '../../../../core/components/VfError'
import { HomeAvisos } from '../components/HomeAvisos'
import { HomeIndicadoresGrid } from '../components/HomeIndicadoresGrid'
import { HomeWelcome } from '../components/HomeWelcome'
import { homeStrings } from '../home.constants'
import { useHomeViewModel } from '../viewmodels/useHomeViewModel'

export function HomePage(): React.JSX.Element {
    const { usuario, pedidosEmDigitacao, indicadores, notificacoes, loading, error, retry } = useHomeViewModel()

    return (
        <section className="mx-auto w-full max-w-7xl space-y-7" aria-busy={loading}>
            {loading && <p role="status" className="sr-only">{homeStrings.loading}</p>}
            {error ? (
                <VfError message={error} retryLabel={homeStrings.retry} onRetry={retry} />
            ) : (
                <>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                        <HomeWelcome usuario={usuario} pedidosEmDigitacao={pedidosEmDigitacao} loading={loading} />
                        <HomeAvisos notifications={notificacoes} loading={loading} />
                    </div>
                    <HomeIndicadoresGrid indicators={indicadores} loading={loading} />
                </>
            )}
        </section>
    )
}