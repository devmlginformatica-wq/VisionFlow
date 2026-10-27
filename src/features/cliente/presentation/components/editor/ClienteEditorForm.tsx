import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { CnpjLookup } from '../../../domain/entities/Cliente'
import type { ClienteFormValues } from '../../../domain/validators/clienteSchema'
import { clienteStrings } from '../../cliente.constants'
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
    const [activeTab, setActiveTab] = useState('general')
    const [focusField, setFocusField] = useState<keyof ClienteFormValues | null>(null)
    const { errors, isSubmitted } = form.formState
    const setFocus = form.setFocus
    const tabByField: Partial<Record<keyof ClienteFormValues, string>> = {
        name: 'general',
        buyerEmail: 'general',
        invoiceEmail: 'general',
        commercialPhone: 'general',
        carrierId: 'defaults',
        paymentConditionId: 'defaults',
        paymentMethodId: 'defaults',
        priceTableId: 'defaults',
        lastVisit: 'defaults',
        integrationId: 'defaults',
        creditLimit: 'other',
        userNotes: 'other',
        erpNotes: 'other',
    }

    useEffect(() => {
        if (!focusField) return
        const frame = window.requestAnimationFrame(() => {
            setFocus(focusField)
            setFocusField(null)
        })
        return () => window.cancelAnimationFrame(frame)
    }, [activeTab, focusField, setFocus])

    function handleInvalid(values: typeof errors): void {
        const invalidField = Object.keys(values).find(
            (field): field is keyof ClienteFormValues => field in tabByField,
        )
        if (!invalidField) return
        setActiveTab(tabByField[invalidField] ?? 'general')
        setFocusField(invalidField)
    }

    return (
        <form id="cliente-editor-form" onSubmit={form.handleSubmit(onSubmit, handleInvalid)} noValidate>
            <div inert={locked}>
                {isSubmitted && Object.keys(errors).length > 0 && (
                    <p role="alert" className="mb-3 rounded-md border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-3 text-sm text-[var(--color-danger)]">
                        {clienteStrings.validationFailed}
                    </p>
                )}
                <ClienteEditorTabs value={activeTab} onValueChange={setActiveTab}>
                    <ClienteEditorTabPanels form={form} enderecoViewModel={addresses} catalogs={catalogs} catalogsLoading={catalogsLoading} titulos={titles} consultarCnpj={consultarCnpj} onAddressFound={onAddressFound} />
                </ClienteEditorTabs>
            </div>
        </form>
    )
}