import { apiRequest } from '../../../../core/api/apiClient'
import type { Cliente, CnpjLookup } from '../../domain/entities/Cliente'
import type { Endereco, EnderecoInput } from '../../domain/entities/Endereco'
import type { Titulo } from '../../domain/entities/Titulo'
import type { ClienteRepository } from '../../domain/repositories/ClienteRepository'

interface ApiClienteRow {
    id: number
    codigo_erp: string
    nome_razao_social: string
    nome_fantasia: string | null
    cnpj_cpf: string | null
    tipo_pessoa: string | null
    inscricao_estadual_rg?: string | null
    prospect?: boolean | null
    telefone1?: string | null
    telefone2?: string | null
    celular?: string | null
    nome_contato_comprador?: string | null
    email_contato_comprador?: string | null
    nome_contato_faturamento?: string | null
    email_contato_faturamento?: string | null
    limite_credito_total?: number | null
    anotacao_erp?: string | null
    ativo: boolean
    cidade: string | null
    estado: string | null
    situacao_cadastro?: string | null
    situacao_compra?: string | null
    data_abertura?: string | null
    cor_indicador?: 'verde' | 'vermelho' | null
    endereco_completo?: string | null
    ultimo_pedido?: string | null
    ultimo_atendimento?: string | null
}

interface ApiClientePage {
    items?: ApiClienteRow[] | null
    nextCursor?: string | null
}

interface ClienteCreatePayload {
    nome_razao_social: string
    nome_fantasia: string
    cnpj_cpf: string
    inscricao_estadual_rg: string
    tipo_pessoa: Cliente['personType']
    prospect: boolean
    telefone1: string
    telefone2: string
    celular: string
    nome_contato_comprador: string
    email_contato_comprador: string
    nome_contato_faturamento: string
    email_contato_faturamento: string
    limite_credito_total: number
    anotacao_erp: string
    cep: string
    logradouro: string
    numero_endereco: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
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

interface ApiContaReceberRow {
    id: number
    codigo_erp: string
    titulo_numero_documento: string
    titulo_especie_documento: string
    titulo_serie: string
    titulo_numero_parcela: string
    data_emissao: string
    data_vencimento: string
    valor_total_aberto: number
    situacao: 'aberto' | 'vencido' | 'pago'
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
    const addressSummary = [row.cidade, row.estado].filter(Boolean).join(' - ')

    return {
        id: row.id,
        name: row.nome_razao_social,
        legalName: row.nome_razao_social,
        tradeName: row.nome_fantasia ?? '',
        taxId: row.cnpj_cpf ?? '',
        personType: row.tipo_pessoa === 'J' || row.tipo_pessoa === 'PJ' ? 'PJ' : 'PF',
        stateRegistration: row.inscricao_estadual_rg ?? '',
        buyerContact: row.nome_contato_comprador ?? '',
        buyerEmail: row.email_contato_comprador ?? '',
        billingContact: row.nome_contato_faturamento ?? '',
        invoiceEmail: row.email_contato_faturamento ?? '',
        commercialPhone: row.telefone1 ?? '',
        mobilePhone: row.celular ?? '',
        otherPhone: row.telefone2 ?? '',
        prospect: row.prospect ?? row.situacao_compra === 'sem_compra',
        status: row.ativo ? 'ativo' : 'inativo',
        registrationStatus: row.situacao_cadastro ?? '',
        purchaseStatus: row.situacao_compra ?? '',
        openedAt: row.data_abertura ?? '',
        indicatorColor: row.cor_indicador ?? (row.ativo ? 'verde' : 'vermelho'),
        addressSummary,
        fullAddress: row.endereco_completo ?? addressSummary,
        lastOrder: row.ultimo_pedido ?? null,
        lastAttendance: row.ultimo_atendimento ?? null,
        carrierId: null,
        paymentConditionId: null,
        paymentMethodId: null,
        priceTableId: null,
        lastVisit: '',
        integrationId: row.codigo_erp,
        creditLimit: row.limite_credito_total ?? 0,
        userNotes: '',
        erpNotes: row.anotacao_erp ?? '',
        addresses: [],
        titles: [],
    }
}

export class ApiClienteRepository implements ClienteRepository {
    async list(): Promise<Cliente[]> {
        const clients: Cliente[] = []
        let cursor: string | null = null

        do {
            const params = new URLSearchParams({ limit: '100' })
            if (cursor !== null) params.set('cursor', cursor)

            const response = await apiRequest<ApiClientePage>(`/clientes?${params.toString()}`)
            clients.push(...(response.items ?? []).map(mapClient))
            cursor = response.nextCursor ?? null
        } while (cursor !== null)

        return clients
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
        const address = cliente.addresses[0]
        const payload: ClienteCreatePayload = {
            nome_razao_social: cliente.name,
            nome_fantasia: cliente.tradeName,
            cnpj_cpf: cliente.taxId,
            inscricao_estadual_rg: cliente.stateRegistration,
            tipo_pessoa: cliente.personType,
            prospect: cliente.prospect,
            telefone1: cliente.commercialPhone,
            telefone2: cliente.otherPhone,
            celular: cliente.mobilePhone,
            nome_contato_comprador: cliente.buyerContact,
            email_contato_comprador: cliente.buyerEmail,
            nome_contato_faturamento: cliente.billingContact,
            email_contato_faturamento: cliente.invoiceEmail,
            limite_credito_total: cliente.creditLimit,
            anotacao_erp: cliente.erpNotes,
            cep: address?.zipCode ?? '',
            logradouro: address?.street ?? '',
            numero_endereco: address?.number ?? '',
            complemento: address?.complement ?? '',
            bairro: address?.district ?? '',
            cidade: address?.city ?? '',
            estado: address?.state ?? '',
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

    async getContasReceber(clienteId: number): Promise<Titulo[]> {
        const response = await apiRequest<ApiContaReceberRow[]>(`/clientes/${clienteId}/contas-receber`)

        return (response ?? []).map((row) => ({
            id: row.id,
            title: row.titulo_numero_documento,
            installment: row.titulo_numero_parcela,
            documentType: row.titulo_especie_documento,
            series: row.titulo_serie,
            issueDate: row.data_emissao,
            dueDate: row.data_vencimento,
            openAmount: row.valor_total_aberto,
            situacao: row.situacao,
        }))
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