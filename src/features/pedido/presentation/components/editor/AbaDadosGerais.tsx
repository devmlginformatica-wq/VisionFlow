import type { UseFormReturn } from 'react-hook-form'
import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import type { PedidoFormValues } from '../../../domain/validators/pedidoSchema'
import { pedidoStrings } from '../../pedido.constants'
import { PedidoClienteFields } from './PedidoClienteFields'
import { PedidoField } from './PedidoField'

interface AbaDadosGeraisProps {
    form: UseFormReturn<PedidoFormValues>
    viewModel: PedidoEditorViewModel
}

export function AbaDadosGerais({ form, viewModel }: AbaDadosGeraisProps): React.JSX.Element {
    return (
        <div className="space-y-5">
            <PedidoClienteFields form={form} viewModel={viewModel} />

            <PedidoField
                name="freightAmount"
                label={pedidoStrings.freight}
                register={form.register}
                setValue={form.setValue}
                currency
                onNumberChange={(value) =>
                    viewModel.recalcularTotais(viewModel.itens, value)
                }
            />
        </div>
    )
}