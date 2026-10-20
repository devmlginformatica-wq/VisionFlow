import type { UseFormReturn } from 'react-hook-form'
import type { CnpjLookup } from '../../../domain/entities/Cliente'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import type { EnderecoViewModel } from '../../viewmodels/useEnderecoViewModel'
import type { ClienteEditorCatalogs } from '../../viewmodels/useClienteEditorViewModel'
import { ClienteEditorTabPanels } from './ClienteEditorTabPanels'
import { ClienteEditorTabs } from './ClienteEditorTabs'

interface ClienteEditorFormProps {
    form: UseFormReturn<ClienteFormValues>
    addresses: EnderecoViewModel
    catalogs: ClienteEditorCatalogs
    catalogsLoading: boolean
    titles: ClienteFormValues['titles']
    locked: boolean
    onSubmit: (values: ClienteFormValues, event?: React.BaseSyntheticEvent) => Promise<void>
    consultarCnpj: (taxId: string) => Promise<CnpjLookup>
    onAddressFound: (address: CnpjLookup['address']) => Promise<void>
}

export function ClienteEditorForm({ form, addresses, catalogs, catalogsLoading, titles, locked, onSubmit, consultarCnpj, onAddressFound }: ClienteEditorFormProps): React.JSX.Element {
    return (
        <form id="cliente-editor-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div inert={locked}>
                <ClienteEditorTabs><ClienteEditorTabPanels form={form} enderecoViewModel={addresses} catalogs={catalogs} catalogsLoading={catalogsLoading} titulos={titles} consultarCnpj={consultarCnpj} onAddressFound={onAddressFound} /></ClienteEditorTabs>
            </div>
        </form>
    )
}