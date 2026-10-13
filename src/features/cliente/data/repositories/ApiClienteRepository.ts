import { apiRequest } from '../../../../core/api/apiClient'
import type { Cliente, CnpjLookup } from '../../domain/entities/Cliente'
import type { Endereco, EnderecoInput } from '../../domain/entities/Endereco'
import type { ClienteRepository } from '../../domain/repositories/ClienteRepository'

interface ApiClienteRow {
    id: number
    nome: string
    fantasia: string
    razao_social: string
    cpf_cnpj: string
    tipo_pessoa: 'PF' | 'PJ'
    status: string
    situacao_cadastro: string
    situacao_compra: string
    data_abertura: string
    cor_indicador: 'verde' | 'vermelho'
    endereco_resumo: string
    endereco_completo: string
    ultimo_pedido: string | null
    ultimo_atendimento: string | null
}

interface ApiCnpjResponse {
    cnpj: string
    razao_social: string
    nome_fantasia: string
    inscricao_estadual: string
    email: string
    telefone: string
    endereco: {
        cep: string
        logradouro: string
        numero: string
        complemento: string
        bairro: string
        cidade: string
        estado: string
    }
}

interface ApiEnderecoResponse {
    id: number
    tipo: string
    finalidade: string
    cep: string
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
    ponto_referencia: string
    restricoes_entrega: string
}

function mapAddress(address: ApiEnderecoResponse): Endereco {
    return {
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
    }
}

function mapClient(row: ApiClienteRow): Cliente {
    return {
        id: row.id,
        name: row.nome,
        legalName: row.razao_social,
        tradeName: row.fantasia,
        taxId: row.cpf_cnpj,
        personType: row.tipo_pessoa,
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
        indicatorColor: row.cor_indicador,
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
        addresses: [],
        titles: [],
    }
}

export class ApiClienteRepository implements ClienteRepository {
    async list(): Promise<Cliente[]> {
        const response = await apiRequest<ApiClienteRow[]>('/clientes')
        return response.map(mapClient)
    }

    async getById(id: number): Promise<Cliente | null> {
        try {
            const response = await apiRequest<ApiClienteRow>(`/clientes/${id}`)
            return mapClient(response)
        } catch (error: unknown) {
            if (error instanceof Error && /404|not found/i.test(error.message)) {
                return null
            }
            throw error
        }
    }

    async save(cliente: Cliente): Promise<Cliente> {
        const payload = {
            ...cliente,
            nome: cliente.name,
            razao_social: cliente.legalName,
            fantasia: cliente.tradeName,
            cpf_cnpj: cliente.taxId,
            tipo_pessoa: cliente.personType,
            status: cliente.status,
            situacao_cadastro: cliente.registrationStatus,
            situacao_compra: cliente.purchaseStatus,
            data_abertura: cliente.openedAt,
            cor_indicador: cliente.indicatorColor,
            endereco_resumo: cliente.addressSummary,
            endereco_completo: cliente.fullAddress,
        }

        const response = cliente.id !== null && cliente.id !== undefined
            ? await apiRequest<ApiClienteRow>(`/clientes/${cliente.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            })
            : await apiRequest<ApiClienteRow>('/clientes', {
                method: 'POST',
                body: JSON.stringify(payload),
            })

        return mapClient(response)
    }

    async delete(id: number): Promise<void> {
        await apiRequest<void>(`/clientes/${id}`, { method: 'DELETE' })
    }

    async lookupTaxId(taxId: string): Promise<CnpjLookup> {
        const response = await apiRequest<ApiCnpjResponse>(`/clientes/cnpj/${encodeURIComponent(taxId.replace(/\D/g, ''))}`)

        return {
            taxId: response.cnpj,
            legalName: response.razao_social,
            tradeName: response.nome_fantasia,
            stateRegistration: response.inscricao_estadual,
            email: response.email,
            phone: response.telefone,
            address: {
                zipCode: response.endereco.cep,
                street: response.endereco.logradouro,
                number: response.endereco.numero,
                complement: response.endereco.complemento,
                district: response.endereco.bairro,
                city: response.endereco.cidade,
                state: response.endereco.estado,
            },
        }
    }

    async getAddresses(clientId: number | null): Promise<Endereco[]> {
        if (clientId === null) return []

        try {
            const response = await apiRequest<ApiEnderecoResponse[]>(`/clientes/${clientId}/enderecos`)
            return response.map(mapAddress)
        } catch {
            return []
        }
    }

    async saveAddress(clientId: number | null, address: EnderecoInput): Promise<Endereco> {
        if (clientId === null) {
            return {
                ...address,
                id: address.id ?? 0,
            }
        }

        const response = await apiRequest<ApiEnderecoResponse>(`/clientes/${clientId}/enderecos`, {
            method: 'POST',
            body: JSON.stringify({
                tipo: address.type,
                finalidade: address.purpose,
                cep: address.zipCode,
                logradouro: address.street,
                numero: address.number,
                complemento: address.complement,
                bairro: address.district,
                cidade: address.city,
                estado: address.state,
                ponto_referencia: address.reference,
                restricoes_entrega: address.deliveryRestrictions,
            }),
        })

        return mapAddress(response)
    }

    async deleteAddress(clientId: number | null, addressId: number): Promise<void> {
        if (clientId === null) return
        await apiRequest<void>(`/clientes/${clientId}/enderecos/${addressId}`, { method: 'DELETE' })
    }

    async lookupZipCode(zipCode: string): Promise<Partial<Endereco>> {
        const formattedZip = zipCode.replace(/\D/g, '')
        const response = await apiRequest<ApiCnpjResponse['endereco']>(`/cep/${formattedZip}`)

        return {
            zipCode: response.cep,
            street: response.logradouro,
            number: response.numero,
            complement: response.complemento,
            district: response.bairro,
            city: response.cidade,
            state: response.estado,
        }
    }
}