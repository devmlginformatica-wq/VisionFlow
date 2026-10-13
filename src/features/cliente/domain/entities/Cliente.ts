import type { Endereco } from './Endereco'
import type { Titulo } from './Titulo'

export interface Cliente {
    id: number | null
    name: string
    legalName: string
    tradeName: string
    taxId: string
    personType: 'PF' | 'PJ'
    stateRegistration: string
    buyerContact: string
    buyerEmail: string
    billingContact: string
    invoiceEmail: string
    commercialPhone: string
    mobilePhone: string
    otherPhone: string
    prospect: boolean
    status: string
    registrationStatus: string
    purchaseStatus: string
    openedAt: string
    indicatorColor: 'verde' | 'vermelho'
    addressSummary: string
    fullAddress: string
    lastOrder: string | null
    lastAttendance: string | null
    carrierId: number | null
    paymentConditionId: number | null
    paymentMethodId: number | null
    priceTableId: number | null
    lastVisit: string
    integrationId: string
    creditLimit: number
    userNotes: string
    erpNotes: string
    addresses: Endereco[]
    titles: Titulo[]
}

export interface CnpjLookup {
    taxId: string
    legalName: string
    tradeName: string
    stateRegistration: string
    email: string
    phone: string
    address: Omit<Endereco, 'id' | 'type' | 'purpose' | 'reference' | 'deliveryRestrictions'>
}