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
            <PedidoEditorHeader type={tipo} number={viewModel.pedido.number} saving={viewModel.saving} onCancel={viewModel.cancelar} />
            {viewModel.error && <VfError message={viewModel.error} retryLabel={pedidoStrings.retry} onRetry={viewModel.retry} />}
            {viewModel.loading ? <PedidoEditorSkeleton /> : <PedidoEditorForm form={form} viewModel={viewModel} type={tipo} onSubmit={submit} />}
        </section>
    )
}