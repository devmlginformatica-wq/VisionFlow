import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { VfError } from '../../../../core/components/VfError'
import { PedidoTipo } from '../../domain/entities/PedidoTipo'
import { pedidoSchema, type PedidoFormValues } from '../../domain/validators/pedidoSchema'
import { pedidoStrings } from '../pedido.constants'
import { PedidoEditorForm } from '../components/editor/PedidoEditorForm'
import { PedidoEditorHeader } from '../components/editor/PedidoEditorHeader'
import { PedidoEditorSkeleton } from '../components/editor/PedidoEditorSkeleton'
import { usePedidoViewModel } from '../viewmodels/usePedidoViewModel'

interface PedidoEditorPageProps {
    tipo: PedidoTipo
}

export function PedidoEditorPage({ tipo }: PedidoEditorPageProps): React.JSX.Element {
    const { id } = useParams()
    const orderId = id && id !== 'novo' ? Number(id) : null
    const viewModel = usePedidoViewModel(tipo, orderId)
    const form = useForm<PedidoFormValues>({ resolver: zodResolver(pedidoSchema), defaultValues: viewModel.pedido })
    const { reset } = form
    const initializedKey = useRef<string | null>(null)

    useEffect(() => {
        const key = `${tipo}:${orderId ?? 'novo'}`
        if (!viewModel.loading && initializedKey.current !== key) {
            reset({ ...viewModel.pedido, issueDate: viewModel.pedido.issueDate.slice(0, 10), deliveryDate: viewModel.pedido.deliveryDate.slice(0, 10) })
            initializedKey.current = key
        }
    }, [orderId, reset, tipo, viewModel.loading, viewModel.pedido])

    function submit(values: PedidoFormValues, event?: React.BaseSyntheticEvent): Promise<void> {
        const nativeEvent = event?.nativeEvent
        const submitter = nativeEvent instanceof SubmitEvent ? nativeEvent.submitter : null
        const finalize = submitter instanceof HTMLButtonElement && submitter.dataset.finalize === 'true'
        return viewModel.salvar(values, finalize)
    }

    return (
        <section className="mx-auto w-full max-w-7xl space-y-5 pb-20">
            <PedidoEditorHeader type={tipo} number={viewModel.pedido.number} saving={viewModel.saving} locked={viewModel.locked} onCancel={viewModel.cancelar} />
            {viewModel.error && <VfError message={viewModel.error} retryLabel={pedidoStrings.retry} onRetry={viewModel.retry} />}
            {!viewModel.loading && viewModel.pedido.status === 'em_integracao' && <p role="status" className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{tipo === PedidoTipo.Orcamento ? pedidoStrings.budgetAwaitingIntegration : pedidoStrings.awaitingIntegration}</p>}
            {!viewModel.loading && viewModel.pedido.status === 'integrado' && <p role="status" className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">{tipo === PedidoTipo.Orcamento ? pedidoStrings.budgetIntegrationSucceeded : pedidoStrings.integrationSucceeded}</p>}
            {!viewModel.loading && viewModel.pedido.status === 'erro_integracao' && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">{tipo === PedidoTipo.Orcamento ? pedidoStrings.budgetIntegrationFailed : pedidoStrings.integrationFailed}{viewModel.pedido.rejectionReason ? ` ${viewModel.pedido.rejectionReason}` : ''}</p>}
            {viewModel.loading ? <PedidoEditorSkeleton /> : <PedidoEditorForm form={form} viewModel={viewModel} type={tipo} onSubmit={submit} />}
        </section>
    )
}