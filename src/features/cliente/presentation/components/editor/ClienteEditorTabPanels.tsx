import * as Tabs from '@radix-ui/react-tabs'
import type { UseFormReturn } from 'react-hook-form'
import type { CnpjLookup } from '../../../domain/entities/Cliente'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import type { EnderecoViewModel } from '../../viewmodels/useEnderecoViewModel'
import type { ClienteEditorCatalogs } from '../../viewmodels/useClienteEditorViewModel'
import { AbaDadosGerais } from './AbaDadosGerais'
import { AbaEnderecos } from './AbaEnderecos'
import { AbaOutros } from './AbaOutros'
import { AbaPadroes } from './AbaPadroes'
import { AbaTitulos } from './AbaTitulos'

interface ClienteEditorTabPanelsProps {
    form: UseFormReturn<ClienteFormValues>
    enderecoViewModel: EnderecoViewModel
    catalogs: ClienteEditorCatalogs
    catalogsLoading: boolean
    titulos: ClienteFormValues['titles']
    consultarCnpj: (taxId: string) => Promise<CnpjLookup>
    onAddressFound: (address: CnpjLookup['address']) => Promise<void>
}

export function ClienteEditorTabPanels({ form, enderecoViewModel, catalogs, catalogsLoading, titulos, consultarCnpj, onAddressFound }: ClienteEditorTabPanelsProps): React.JSX.Element {
    return (
        <>
            <Tabs.Content value="general"><AbaDadosGerais form={form} consultarCnpj={consultarCnpj} onAddressFound={onAddressFound} /></Tabs.Content>
            <Tabs.Content value="addresses"><AbaEnderecos viewModel={enderecoViewModel} /></Tabs.Content>
            <Tabs.Content value="defaults"><AbaPadroes register={form.register} catalogs={catalogs} catalogsLoading={catalogsLoading} /></Tabs.Content>
            <Tabs.Content value="titles"><AbaTitulos titulos={titulos} /></Tabs.Content>
            <Tabs.Content value="other"><AbaOutros register={form.register} error={form.formState.errors.creditLimit} /></Tabs.Content>
        </>
    )
}