import addressesMock from '../../../../mocks/clientes/24129/enderecos.json'
import cnpjMock from '../../../../mocks/clientes/cnpj/61186888000193.json'
import clientsMock from '../../../../mocks/clientes/listar.json'
import type { Cliente, CnpjLookup } from '../../domain/entities/Cliente'
import type { Endereco, EnderecoInput } from '../../domain/entities/Endereco'
import type { Titulo } from '../../domain/entities/Titulo'
import type { ClienteRepository } from '../../domain/repositories/ClienteRepository'

const addressRows: Endereco[] = addressesMock.data.map((address) => ({
    id: address.id,
    type: address.tipo,
    purpose: address.finalidade,
    zipCode: address.cep,
    street: address.logradouro,
    number: address.numero,
    complement: address.complemento,
    district: address.bairro,
    city: address.cidade,
    state: address.estado,
    reference: address.ponto_referencia,
    deliveryRestrictions: address.restricoes_entrega,
}))

function mapClient(row: typeof clientsMock.data[number]): Cliente {
    return {
        id: row.id,
        name: row.nome,
        legalName: row.razao_social,
        tradeName: row.fantasia,
        taxId: row.cpf_cnpj,
        personType: row.tipo_pessoa === 'PJ' ? 'PJ' : 'PF',
        stateRegistration: '',
        buyerContact: '',
        buyerEmail: '',
        billingContact: '',
        invoiceEmail: '',
        commercialPhone: '',
        mobilePhone: '',
        otherPhone: '',
        prospect: row.situacao_compra === 'sem_compra',
        status: row.status,
        registrationStatus: row.situacao_cadastro,
        purchaseStatus: row.situacao_compra,
        openedAt: row.data_abertura,
        indicatorColor: row.cor_indicador === 'vermelho' ? 'vermelho' : 'verde',
        addressSummary: row.endereco_resumo,
        fullAddress: row.endereco_completo,
        lastOrder: row.ultimo_pedido,
        lastAttendance: row.ultimo_atendimento,
        carrierId: null,
        paymentConditionId: null,
        paymentMethodId: null,
        priceTableId: null,
        lastVisit: '',
        integrationId: String(row.id),
        creditLimit: 0,
        userNotes: '',
        erpNotes: '',
        addresses: row.id === 24129 ? [...addressRows] : [],
        titles: [],
    }
}

const cnpjData: CnpjLookup = {
    taxId: cnpjMock.data.cnpj,
    legalName: cnpjMock.data.razao_social,
    tradeName: cnpjMock.data.nome_fantasia,
    stateRegistration: cnpjMock.data.inscricao_estadual,
    email: cnpjMock.data.email,
    phone: cnpjMock.data.telefone,
    address: {
        zipCode: cnpjMock.data.endereco.cep,
        street: cnpjMock.data.endereco.logradouro,
        number: cnpjMock.data.endereco.numero,
        complement: cnpjMock.data.endereco.complemento,
        district: cnpjMock.data.endereco.bairro,
        city: cnpjMock.data.endereco.cidade,
        state: cnpjMock.data.endereco.estado,
    },
}

export class MockClienteRepository implements ClienteRepository {
    private clients = clientsMock.data.map(mapClient)
    private addresses = new Map<number, Endereco[]>([[24129, [...addressRows]]])
    private nextClientId = Math.max(...this.clients.map((client) => client.id ?? 0)) + 1
    private nextAddressId = Math.max(...addressRows.map((address) => address.id)) + 1

    async list(): Promise<Cliente[]> {
        return this.clients.map((client) => ({ ...client, addresses: [...(this.addresses.get(client.id ?? -1) ?? [])] }))
    }

    async getById(id: number): Promise<Cliente | null> {
        const client = this.clients.find((item) => item.id === id)
        return client ? { ...client, addresses: await this.getAddresses(id) } : null
    }

    async save(cliente: Cliente): Promise<Cliente> {
        const saved = {
            ...cliente,
            id: cliente.id ?? this.nextClientId++,
            addresses: cliente.addresses.map((address) => ({
                ...address,
                id: address.id > 0 ? address.id : this.nextAddressId++,
            })),
        }
        this.clients = [saved, ...this.clients.filter((item) => item.id !== saved.id)]
        this.addresses.set(saved.id, [...saved.addresses])
        return saved
    }

    async delete(id: number): Promise<void> {
        this.clients = this.clients.filter((client) => client.id !== id)
        this.addresses.delete(id)
    }

    async lookupTaxId(taxId: string): Promise<CnpjLookup> {
        if (taxId.replace(/\D/g, '') !== cnpjData.taxId.replace(/\D/g, '')) {
            throw new Error('Não encontramos dados para este CNPJ.')
        }
        return cnpjData
    }

    async getAddresses(clientId: number | null): Promise<Endereco[]> {
        return clientId === null ? [] : [...(this.addresses.get(clientId) ?? [])]
    }

    async saveAddress(clientId: number | null, address: EnderecoInput): Promise<Endereco> {
        const saved = { ...address, id: address.id ?? this.nextAddressId++ }
        if (clientId !== null) {
            const current = this.addresses.get(clientId) ?? []
            this.addresses.set(clientId, [saved, ...current.filter((item) => item.id !== saved.id)])
        }
        return saved
    }

    async deleteAddress(clientId: number | null, addressId: number): Promise<void> {
        if (clientId !== null) {
            this.addresses.set(clientId, (this.addresses.get(clientId) ?? []).filter((item) => item.id !== addressId))
        }
    }

    async getContasReceber(clienteId: number): Promise<Titulo[]> {
        const client = this.clients.find((item) => item.id === clienteId)
        return client ? [...client.titles] : []
    }

    async lookupZipCode(zipCode: string): Promise<Partial<Endereco>> {
        if (zipCode.replace(/\D/g, '') !== cnpjData.address.zipCode.replace(/\D/g, '')) {
            throw new Error('CEP não encontrado.')
        }
        return cnpjData.address
    }
}

export const mockClienteRepository = new MockClienteRepository()