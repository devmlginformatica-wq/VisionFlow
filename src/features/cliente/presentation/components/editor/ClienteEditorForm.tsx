import type { UseFormReturn } from 'react-hook-form'
import type { CnpjLookup } from '../../../domain/entities/Cliente'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import type { EnderecoViewModel } from '../../viewmodels/useEnderecoViewModel'
import { ClienteEditorTabPanels } from './ClienteEditorTabPanels'
import { ClienteEditorTabs } from './ClienteEditorTabs'

interface ClienteEditorFormProps {
    form: UseFormReturn<ClienteFormValues>
    addresses: EnderecoViewModel
    titles: ClienteFormValues['titles']
    onSubmit: (values: ClienteFormValues) => Promise<void>
    consultarCnpj: (taxId: string) => Promise<CnpjLookup>
    onAddressFound: (address: CnpjLookup['address']) => void
}

export function ClienteEditorForm({ form, addresses, titles, onSubmit, consultarCnpj, onAddressFound }: ClienteEditorFormProps): React.JSX.Element {
    return (
        <form id="cliente-editor-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <ClienteEditorTabs><ClienteEditorTabPanels form={form} enderecoViewModel={addresses} titulos={titles} consultarCnpj={consultarCnpj} onAddressFound={onAddressFound} /></ClienteEditorTabs>
        </form>
    )
}