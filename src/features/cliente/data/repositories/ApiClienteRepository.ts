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
    transportadora_padrao_id?: number | null
    condicao_pagamento_padrao_id?: number | null
    forma_pagamento_padrao_id?: number | null
    tabela_preco_padrao_id?: number | null
    data_ultima_visita?: string | null
    anotacao_usuario?: string | null
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
    transportadora_padrao_id: number | null
    condicao_pagamento_padrao_id: number | null
    forma_pagamento_padrao_id: number | null
    tabela_preco_padrao_id: number | null
    data_ultima_visita: string | null
    anotacao_usuario: string
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

interface ApiZipCodeResponse {
    cep: string
    logradouro: string
    bairro: string
    cidade: string
    estado: string
}

interface ApiEnderecoResponse {
    id: number
    tipo_endereco: 'cobranca' | 'entrega' | 'ambos'
    endereco_padrao: boolean
    cep: string
    logradouro: string
    numero_endereco: string
    complemento_endereco: string
    bairro: string
    cidade: string
    estado: string
    ponto_referencia: string
    restricoes_horarios: string
}

interface ApiEnderecoPayload {
    tipo_endereco: 'cobranca' | 'entrega' | 'ambos'
    endereco_padrao: boolean
    cep: string
    logradouro: string
    numero_endereco: string
    complemento_endereco: string
    bairro: string
    cidade: string
    estado: string
    ponto_referencia: string
    restricoes_horarios: string
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
        type: address.tipo_endereco,
        purpose: address.endereco_padrao ? 'principal' : 'secundario',
        zipCode: address.cep,
        street: address.logradouro,
        number: address.numero_endereco,
        complement: address.complemento_endereco,
        district: address.bairro,
        city: address.cidade,
        state: address.estado,
        reference: address.ponto_referencia,
        deliveryRestrictions: address.restricoes_horarios,
    }
}

function mapAddressPayload(address: EnderecoInput): ApiEnderecoPayload {
    if (address.type !== 'cobranca' && address.type !== 'entrega' && address.type !== 'ambos') {
        throw new Error('O tipo do endereço não é aceito pela API.')
    }

    return {
        tipo_endereco: address.type,
        endereco_padrao: address.purpose === 'principal',
        cep: address.zipCode,
        logradouro: address.street,
        numero_endereco: address.number,
        complemento_endereco: address.complement,
        bairro: address.district,
        cidade: address.city,
        estado: address.state,
        ponto_referencia: address.reference,
        restricoes_horarios: address.deliveryRestrictions,
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
        carrierId: row.transportadora_padrao_id ?? null,
        paymentConditionId: row.condicao_pagamento_padrao_id ?? null,
        paymentMethodId: row.forma_pagamento_padrao_id ?? null,
        priceTableId: row.tabela_preco_padrao_id ?? null,
        lastVisit: row.data_ultima_visita ?? '',
        integrationId: row.codigo_erp,
        creditLimit: row.limite_credito_total ?? 0,
        userNotes: row.anotacao_usuario ?? '',
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
        const primaryAddress = cliente.addresses[0]
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
            transportadora_padrao_id: cliente.carrierId,
            condicao_pagamento_padrao_id: cliente.paymentConditionId,
            forma_pagamento_padrao_id: cliente.paymentMethodId,
            tabela_preco_padrao_id: cliente.priceTableId,
            data_ultima_visita: cliente.lastVisit || null,
            anotacao_usuario: cliente.userNotes,
            cep: primaryAddress?.zipCode ?? '',
            logradouro: primaryAddress?.street ?? '',
            numero_endereco: primaryAddress?.number ?? '',
            complemento: primaryAddress?.complement ?? '',
            bairro: primaryAddress?.district ?? '',
            cidade: primaryAddress?.city ?? '',
            estado: primaryAddress?.state ?? '',
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

        const savedClient = mapClient(response)

        const newAddresses = cliente.addresses.filter((address) => address.id <= 0)
        if (savedClient.id !== null) {
            for (const address of newAddresses) {
                await this.saveAddress(savedClient.id, {
                    ...address,
                    id: undefined,
                })
            }
            savedClient.addresses = await this.getAddresses(savedClient.id)
        }

        return savedClient
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

        const response = await apiRequest<ApiEnderecoResponse[]>(`/clientes/${clientId}/enderecos`)
        return response.map(mapAddress)
    }

    async saveAddress(clientId: number | null, address: EnderecoInput): Promise<Endereco> {
        if (clientId === null) {
            return {
                ...address,
                id: address.id ?? 0,
            }
        }

        const isUpdate = address.id !== undefined && address.id > 0
        const response = await apiRequest<ApiEnderecoResponse>(
            isUpdate
                ? `/clientes/${clientId}/enderecos/${address.id}`
                : `/clientes/${clientId}/enderecos`,
            {
                method: isUpdate ? 'PUT' : 'POST',
                body: JSON.stringify(mapAddressPayload(address)),
            },
        )

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
        const response = await apiRequest<ApiZipCodeResponse>(`/cep/${formattedZip}`)

        return {
            zipCode: response.cep,
            street: response.logradouro,
            district: response.bairro,
            city: response.cidade,
            state: response.estado,
        }
    }
}