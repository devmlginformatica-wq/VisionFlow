import type { UseFormReturn } from 'react-hook-form'
import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import type { PedidoFormValues } from '../../../domain/validators/pedidoSchema'
import { pedidoStrings } from '../../pedido.constants'
import { PedidoField } from './PedidoField'
import { PedidoTotais } from './PedidoTotais'

interface AbaFinalizacaoProps {
    form: UseFormReturn<PedidoFormValues>
    viewModel: PedidoEditorViewModel
}

export function AbaFinalizacao({ form, viewModel }: AbaFinalizacaoProps): React.JSX.Element {
    return (
        <section className="space-y-5">
            <div className="space-y-4"><PedidoField name="customerOrderNumber" label={pedidoStrings.customerOrderNumber} register={form.register} /><PedidoField name="observation" label={pedidoStrings.observation} register={form.register} /><PedidoField name="invoiceObservation" label={pedidoStrings.invoiceObservation} register={form.register} /></div>
            <div className="space-y-3"><h2 className="text-base font-semibold">Resumo do pedido</h2><PedidoTotais totals={viewModel.totais} /></div>
        </section>
    )
}