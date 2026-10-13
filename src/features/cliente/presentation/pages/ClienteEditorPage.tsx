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
    const clientId = id && id !== 'novo' ? Number(id) : null
    const viewModel = useClienteEditorViewModel(clientId)
    const enderecoViewModel = useEnderecoViewModel(clientId)
    const form = useForm<ClienteFormValues>({ resolver: zodResolver(clienteSchema), defaultValues: viewModel.cliente })
    const { reset } = form
    const initializedClient = useRef<number | null | undefined>(undefined)

    useEffect(() => {
        if (!viewModel.loading && initializedClient.current !== clientId) {
            reset(viewModel.cliente)
            initializedClient.current = clientId
        }
    }, [clientId, reset, viewModel.cliente, viewModel.loading])

    async function submit(values: ClienteFormValues): Promise<void> {
        await viewModel.salvar({ ...values, addresses: enderecoViewModel.enderecos, titles: viewModel.cliente.titles })
    }

    const loading = viewModel.loading

    return (
        <section className="mx-auto w-full max-w-5xl space-y-5 pb-20">
            <ClienteEditorHeader clientId={clientId} saving={viewModel.saving} onCancel={viewModel.cancelar} onDelete={() => void viewModel.excluir()} />
            {viewModel.error && <VfError message={viewModel.error} retryLabel={clienteStrings.tryAgain} onRetry={viewModel.retry} />}
            {loading ? <ClienteEditorSkeleton /> : <ClienteEditorForm form={form} addresses={enderecoViewModel} titles={viewModel.cliente.titles} onSubmit={submit} consultarCnpj={viewModel.consultarCnpj} onAddressFound={enderecoViewModel.adicionarConsultaCnpj} />}
        </section>
    )
}