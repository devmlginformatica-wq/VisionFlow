import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { VfError } from '../../../../core/components/VfError'
import { clienteSchema, type ClienteFormValues } from '../../domain/validators/clienteSchema'
import { clienteStrings } from '../cliente.constants'
import { ClienteEditorForm } from '../components/editor/ClienteEditorForm'
import { ClienteEditorHeader } from '../components/editor/ClienteEditorHeader'
import { ClienteEditorSkeleton } from '../components/editor/ClienteEditorSkeleton'
import { useClienteEditorViewModel } from '../viewmodels/useClienteEditorViewModel'
import { useEnderecoViewModel } from '../viewmodels/useEnderecoViewModel'

export function ClienteEditorPage(): React.JSX.Element {
    const { id } = useParams()
    const clientId: number | string | null = id && id !== 'novo'
        ? (/^\d+$/.test(id) ? Number(id) : id)
        : null
    const viewModel = useClienteEditorViewModel(clientId)
    const enderecoViewModel = useEnderecoViewModel(typeof clientId === 'number' ? clientId : null)
    const form = useForm<ClienteFormValues>({ resolver: zodResolver(clienteSchema), defaultValues: viewModel.cliente })
    const { reset } = form
    const initializedClient = useRef<number | string | null | undefined>(undefined)

    useEffect(() => {
        if (!viewModel.loading && initializedClient.current !== clientId) {
            reset(viewModel.cliente)
            initializedClient.current = clientId
        }
    }, [clientId, reset, viewModel.cliente, viewModel.loading])

    async function submit(values: ClienteFormValues, event?: React.BaseSyntheticEvent): Promise<void> {
        const nativeEvent = event?.nativeEvent
        const submitter = nativeEvent instanceof SubmitEvent ? nativeEvent.submitter : null
        const finalize = submitter instanceof HTMLButtonElement && submitter.dataset.finalize === 'true'
        await viewModel.salvar({ ...values, addresses: enderecoViewModel.enderecos, titles: viewModel.cliente.titles }, finalize)
    }

    const loading = viewModel.loading

    return (
        <section className="mx-auto w-full max-w-5xl space-y-5 pb-20">
            <ClienteEditorHeader clientId={clientId} saving={viewModel.saving} locked={viewModel.locked} onCancel={viewModel.cancelar} onDelete={() => void viewModel.excluir()} />
            {viewModel.error && <VfError message={viewModel.error} retryLabel={clienteStrings.tryAgain} onRetry={viewModel.retry} />}
            {!loading && viewModel.cliente.integrationStatus === 'em_integracao' && <p role="status" className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{clienteStrings.awaitingIntegration}</p>}
            {!loading && viewModel.cliente.integrationStatus === 'integrado' && <p role="status" className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">{clienteStrings.integrationSucceeded}</p>}
            {!loading && viewModel.cliente.integrationStatus === 'erro_integracao' && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">{clienteStrings.integrationFailed}{viewModel.cliente.rejectionReason ? ` ${viewModel.cliente.rejectionReason}` : ''}</p>}
            {loading ? <ClienteEditorSkeleton /> : <ClienteEditorForm form={form} addresses={enderecoViewModel} catalogs={viewModel.catalogs} catalogsLoading={viewModel.catalogsLoading} titles={viewModel.cliente.titles} locked={viewModel.locked} onSubmit={submit} consultarCnpj={viewModel.consultarCnpj} onAddressFound={enderecoViewModel.adicionarConsultaCnpj} />}
        </section>
    )
}