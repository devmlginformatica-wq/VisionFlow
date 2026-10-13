export interface Endereco {
    id: number
    type: string
    purpose: string
    zipCode: string
    street: string
    number: string
    complement: string
    district: string
    city: string
    state: string
    reference: string
    deliveryRestrictions: string
}

export type EnderecoInput = Omit<Endereco, 'id'> & { id?: number }