import * as Tabs from '@radix-ui/react-tabs'
import type { UseFormReturn } from 'react-hook-form'
import type { CnpjLookup } from '../../../domain/entities/Cliente'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import type { EnderecoViewModel } from '../../viewmodels/useEnderecoViewModel'
import { AbaDadosGerais } from './AbaDadosGerais'
import { AbaEnderecos } from './AbaEnderecos'
import { AbaOutros } from './AbaOutros'
import { AbaPadroes } from './AbaPadroes'
import { AbaTitulos } from './AbaTitulos'

interface ClienteEditorTabPanelsProps {
    form: UseFormReturn<ClienteFormValues>
    enderecoViewModel: EnderecoViewModel
    titulos: ClienteFormValues['titles']
    consultarCnpj: (taxId: string) => Promise<CnpjLookup>
    onAddressFound: (address: CnpjLookup['address']) => void
}

export function ClienteEditorTabPanels({ form, enderecoViewModel, titulos, consultarCnpj, onAddressFound }: ClienteEditorTabPanelsProps): React.JSX.Element {
    return (
        <>
            <Tabs.Content value="general"><AbaDadosGerais form={form} consultarCnpj={consultarCnpj} onAddressFound={onAddressFound} /></Tabs.Content>
            <Tabs.Content value="addresses"><AbaEnderecos viewModel={enderecoViewModel} /></Tabs.Content>
            <Tabs.Content value="defaults"><AbaPadroes register={form.register} /></Tabs.Content>
            <Tabs.Content value="titles"><AbaTitulos titulos={titulos} /></Tabs.Content>
            <Tabs.Content value="other"><AbaOutros register={form.register} error={form.formState.errors.creditLimit} /></Tabs.Content>
        </>
    )
}