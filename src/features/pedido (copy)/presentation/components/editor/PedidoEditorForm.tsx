import type { UseFormReturn } from 'react-hook-form'
import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import type { PedidoFormValues } from '../../../domain/validators/pedidoSchema'
import { PedidoEditorTabs } from './PedidoEditorTabs'
import { AbaDadosGerais } from './AbaDadosGerais'
import { AbaFinalizacao } from './AbaFinalizacao'
import { AbaProdutos } from './AbaProdutos'

interface PedidoEditorFormProps {
    form: UseFormReturn<PedidoFormValues>
    viewModel: PedidoEditorViewModel
    type: PedidoFormValues['type']
    onSubmit: (values: PedidoFormValues, event?: React.BaseSyntheticEvent) => Promise<void>
}

export function PedidoEditorForm({ form, viewModel, type, onSubmit }: PedidoEditorFormProps): React.JSX.Element {
    return (
        <form id="pedido-editor-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <input type="hidden" {...form.register('type')} value={type} />
            <input type="hidden" {...form.register('number')} />
            <input type="hidden" {...form.register('status')} />
            <input type="hidden" {...form.register('customerName')} />
            <input type="hidden" {...form.register('customerTaxId')} />
            <PedidoEditorTabs data={<AbaDadosGerais form={form} viewModel={viewModel} />} products={<AbaProdutos viewModel={viewModel} />} completion={<AbaFinalizacao form={form} viewModel={viewModel} />} />
        </form>
    )
}