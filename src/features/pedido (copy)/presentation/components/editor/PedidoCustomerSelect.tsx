import type { UseFormSetValue } from 'react-hook-form'
import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import type { PedidoFormValues } from '../../../domain/validators/pedidoSchema'
import { pedidoStrings } from '../../pedido.constants'
import { PedidoSelectField } from './PedidoSelectField'

interface PedidoCustomerSelectProps {
    customerId: number | null
    catalogs: PedidoEditorViewModel['catalogs']
    setValue: UseFormSetValue<PedidoFormValues>
    setCustomer: PedidoEditorViewModel['setCustomer']
}

function optionId(value: string): number | null {
    return value ? Number(value) : null
}

export function PedidoCustomerSelect({ customerId, catalogs, setValue, setCustomer }: PedidoCustomerSelectProps): React.JSX.Element {
    async function changeCustomer(value: string): Promise<void> {
        const nextId = optionId(value)
        const client = catalogs.clients.find((entry) => entry.id === nextId)
        setValue('customerId', nextId)
        setValue('customerName', client?.nome ?? '')
        setValue('customerTaxId', client?.cpf_cnpj ?? '')
        const addresses = await setCustomer(nextId)
        const primary = addresses.find((address) => address.purpose === 'principal') ?? addresses[0]
        setValue('billingAddressId', primary?.id ?? null)
        setValue('deliveryAddressId', primary?.id ?? null)
        setValue('collectionAddressId', primary?.id ?? null)
    }

    return <PedidoSelectField id="pedido-customer" label={pedidoStrings.customer} value={String(customerId ?? '')} onChange={(value) => { void changeCustomer(value) }}><option value="">Selecione</option>{catalogs.clients.map((client) => <option key={client.id} value={client.id}>{client.nome}</option>)}</PedidoSelectField>
}