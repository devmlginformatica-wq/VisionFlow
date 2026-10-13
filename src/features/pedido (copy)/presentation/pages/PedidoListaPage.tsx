import { useLayoutEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { VfEmpty } from '../../../../core/components/VfEmpty'
import { VfError } from '../../../../core/components/VfError'
import type { PedidoTipo } from '../../domain/entities/PedidoTipo'
import { getOrderBasePath, pedidoStrings } from '../pedido.constants'
import { PedidoBusca } from '../components/lista/PedidoBusca'
import { PedidoCard } from '../components/lista/PedidoCard'
import { PedidoCardSkeleton } from '../components/lista/PedidoCardSkeleton'
import { PedidoFiltros } from '../components/lista/PedidoFiltros'
import { preservePedidoListScroll, restorePedidoListScroll } from '../listScroll'
import { usePedidoListaViewModel } from '../viewmodels/usePedidoListaViewModel'

interface PedidoListaPageProps {
    tipo: PedidoTipo
}

export function PedidoListaPage({ tipo }: PedidoListaPageProps): React.JSX.Element {
    const viewModel = usePedidoListaViewModel(tipo)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const basePath = getOrderBasePath(tipo)
    const listSearch = searchParams.size > 0 ? `?${searchParams.toString()}` : ''
    const isBudget = tipo === 'orcamento'
    const title = isBudget ? pedidoStrings.budgets : pedidoStrings.orders
    const addLabel = isBudget ? pedidoStrings.newBudget : pedidoStrings.newOrder

    useLayoutEffect(() => { restorePedidoListScroll() }, [])

    function addNew(): void {
        preservePedidoListScroll()
        navigate(`${basePath}/novo${listSearch}`)
    }

    return (
        <section className="mx-auto w-full max-w-7xl space-y-5 pb-20" aria-busy={viewModel.loading}>
            <header><p className="mb-1 text-xs font-semibold uppercase text-[var(--color-primary)]">Vendas</p><h1 className="text-2xl font-semibold">{title}</h1></header>
            <PedidoBusca value={viewModel.search} onChange={viewModel.setSearch} />
            <PedidoFiltros value={viewModel.filtros} onChange={viewModel.setFilter} />
            {viewModel.error ? <VfError message={viewModel.error} retryLabel={pedidoStrings.retry} onRetry={() => void viewModel.listar()} /> : viewModel.loading ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <PedidoCardSkeleton key={index} />)}</div>
            ) : viewModel.filteredOrders.length === 0 ? (
                <VfEmpty title="Nenhum registro encontrado" description="Não há pedidos para estes filtros." actionLabel={addLabel} onAction={addNew} />
            ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">{viewModel.filteredOrders.map((order) => <PedidoCard key={order.id} pedido={order} type={tipo} listSearch={listSearch} />)}</div>
            )}
            <button type="button" onClick={addNew} className="fixed bottom-6 right-6 z-20 inline-flex h-12 items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-lg hover:bg-[var(--color-primary-hover)] md:bottom-8 md:right-8"><Plus aria-hidden="true" size={19} />{addLabel}</button>
        </section>
    )
}