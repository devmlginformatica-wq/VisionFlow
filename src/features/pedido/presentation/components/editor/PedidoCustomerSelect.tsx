import type { UseFormSetValue } from 'react-hook-form'
import { SearchableSelect } from '../../../../../core/components/SearchableSelect'
import type { PedidoEditorViewModel } from '../../viewmodels/usePedidoEditorViewModel'
import type { PedidoFormValues } from '../../../domain/validators/pedidoSchema'
import { pedidoStrings } from '../../pedido.constants'

interface PedidoCustomerSelectProps {
    customerId: number | null
    catalogs: PedidoEditorViewModel['catalogs']
    setValue: UseFormSetValue<PedidoFormValues>
    setCustomer: PedidoEditorViewModel['setCustomer']
    searchClients: PedidoEditorViewModel['searchClients']
    isSearchingClients: boolean
}

function optionId(value: string): number | null {
    return value ? Number(value) : null
}

export function PedidoCustomerSelect({ customerId, catalogs, setValue, setCustomer, searchClients, isSearchingClients }: PedidoCustomerSelectProps): React.JSX.Element {
    const options = [
        { value: '', label: 'Selecione' },
        ...catalogs.clients.map((client) => ({
            value: String(client.id),
            label: client.nome,
            searchTerms: [
                client.razaoSocial,
                client.nomeFantasia,
                client.codigo,
                client.cpf_cnpj,
                String(client.id),
            ],
        })),
    ]

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

    return (
        <div className="grid gap-1.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
            <label htmlFor="pedido-customer" className="text-sm font-medium">{pedidoStrings.customer}</label>
            <SearchableSelect
                id="pedido-customer"
                value={String(customerId ?? '')}
                onValueChange={(value) => { void changeCustomer(value) }}
                options={options}
                searchPlaceholder="Buscar cliente por nome, razão social, fantasia ou código..."
                onSearch={searchClients}
                loading={isSearchingClients}
                minSearchLength={1}
            />
        </div>
    )
}