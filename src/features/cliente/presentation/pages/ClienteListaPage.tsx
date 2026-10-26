import { useLayoutEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { VfEmpty } from '../../../../core/components/VfEmpty'
import { VfError } from '../../../../core/components/VfError'
import { ClienteCard } from '../components/lista/ClienteCard'
import { ClienteCardSkeleton } from '../components/lista/ClienteCardSkeleton'
import { ClienteFiltrosChips } from '../components/lista/ClienteFiltrosChips'
import { ClienteListaToolbar } from '../components/lista/ClienteListaToolbar'
import { clienteRoutes, clienteStrings } from '../cliente.constants'
import { useClienteViewModel } from '../viewmodels/useClienteViewModel'
import { preserveClientListScroll, restoreClientListScroll } from '../listScroll'

export function ClienteListaPage(): React.JSX.Element {
    const viewModel = useClienteViewModel()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const listSearch = searchParams.size > 0 ? `?${searchParams.toString()}` : ''
    useLayoutEffect(() => { restoreClientListScroll() }, [])
    const addClient = (): void => {
        preserveClientListScroll()
        navigate(`${clienteRoutes.create}${listSearch}`)
    }

    return (
        <section className="mx-auto w-full max-w-7xl space-y-5 pb-20" aria-busy={viewModel.loading}>
            <header><p className="mb-1 text-xs font-semibold uppercase text-[var(--color-primary)]">Cadastro</p><h1 className="text-2xl font-semibold">{clienteStrings.title}</h1><p className="mt-1 text-sm text-[var(--color-muted)]">Consulte e mantenha sua carteira de clientes.</p></header>
            <ClienteListaToolbar search={viewModel.search} onSearchChange={viewModel.setSearch} filter={viewModel.filtros} onFilterChange={viewModel.setFilter} gridView={viewModel.gridView} onViewChange={viewModel.setGridView} />
            <ClienteFiltrosChips value={viewModel.filtros} onChange={viewModel.setFilter} />
            {viewModel.error ? <VfError message={viewModel.error} retryLabel={clienteStrings.tryAgain} onRetry={() => void viewModel.listar()} /> : viewModel.loading ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <ClienteCardSkeleton key={index} />)}</div>
            ) : viewModel.visibleClients.length === 0 ? (
                <VfEmpty title={clienteStrings.emptyTitle} description={clienteStrings.emptyDescription} actionLabel={clienteStrings.add} onAction={addClient} />
            ) : (
                <div className={viewModel.gridView ? 'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-3'}>
                    {viewModel.visibleClients.map((cliente) => <ClienteCard key={cliente.localId ?? cliente.id} cliente={cliente} listSearch={listSearch} onDelete={(id) => void viewModel.excluir(id)} />)}
                </div>
            )}
            <button type="button" onClick={addClient} className="fixed bottom-6 right-6 z-20 inline-flex h-12 items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-lg hover:bg-[var(--color-primary-hover)] md:bottom-8 md:right-8"><Plus aria-hidden="true" size={19} />{clienteStrings.add}</button>
        </section>
    )
}