import { apiRequest } from '../../../../core/api/apiClient'
import type { Pedido } from '../../domain/entities/Pedido'
import type { PedidoTipo } from '../../domain/entities/PedidoTipo'
import { PedidoTipo as PedidoTypeEnum } from '../../domain/entities/PedidoTipo'
import type { PedidoRepository } from '../../domain/repositories/PedidoRepository'
import type { Endereco } from '../../../cliente/domain/entities/Endereco'

interface ApiPedidoRow {
    id: number
    numero: string
    tipo: string
    cliente_nome: string
    data_emissao: string
    total_liquido: number
    status: string
}

interface ApiPedidoPage {
    items?: ApiPedidoRow[] | null
    nextCursor?: string | null
}

interface ApiProdutoRow {
    id: number
    codigo_erp: string
    descricao: string
    familia?: string | null
    marca?: string | null
    unidade?: string | null
    preco_venda: number
    tabela_preco_padrao_id?: number | null
}

interface ApiProdutoPage {
    items?: ApiProdutoRow[] | null
    nextCursor?: string | null
}

interface ApiEmpresaRow {
    id: number
    nome: string
    codigo_erp?: string
}

interface ApiEmpresaPage {
    items?: ApiEmpresaRow[] | null
    nextCursor?: string | null
}

interface ApiCondicaoPagamentoRow {
    id: number
    descricao: string
}

interface ApiCondicaoPagamentoPage {
    items?: ApiCondicaoPagamentoRow[] | null
    nextCursor?: string | null
}

interface ApiFormaPagamentoRow {
    id: number
    descricao: string
}

interface ApiFormaPagamentoPage {
    items?: ApiFormaPagamentoRow[] | null
    nextCursor?: string | null
}

interface ApiTransportadoraRow {
    id: number
    nome_razao: string
}

interface ApiTransportadoraPage {
    items?: ApiTransportadoraRow[] | null
    nextCursor?: string | null
}

interface ApiTabelaPrecoRow {
    id: number
    descricao: string
    vigencia?: string | null
}

interface ApiTabelaPrecoPage {
    items?: ApiTabelaPrecoRow[] | null
    nextCursor?: string | null
}

interface ApiEnderecoRow {
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

interface ApiPedidoDetalhe {
    id: number
    tipo: string
    numero: string
    numero_cliente?: string
    status: string
    data_emissao: string
    data_entrega?: string
    empresa?: { id: number; nome: string } | null
    cliente?: { id: number; nome_razao_social: string; cnpj_cpf: string } | null
    cliente_nome?: string
    cliente_cnpj_cpf?: string
    condicao_pagamento?: { id: number; descricao: string } | null
    forma_pagamento?: { id: number; descricao: string } | null
    transportadora?: { id: number; nome: string } | null
    endereco_faturamento_id: number | null
    endereco_entrega_id: number | null
    endereco_cobranca_id: number | null
    valor_frete?: number
    observacoes_pedido?: string
    observacoes_nota_fiscal?: string
    itens?: Array<{
        sequence: number
        codigo_cliente?: string
        product: {
            id: number
            codigo_erp: string
            descricao: string
            familia?: string
            marca?: string | null
            unidade?: string
            peso_liquido?: number
            peso_bruto?: number
            cubagem?: number
            comprimento?: number
            largura?: number
            altura_espessura?: number
            qtde_embalagem?: number
            permite_venda_sem_estoque?: boolean
            stock?: number
        }
        price_table_id?: number | null
        price_table_name?: string | null
        price_table_validity?: string | null
        quantidade_informada: number
        sale_price: number
        valor_desconto_comercial: number
        valor_total_produtos_liquido: number
        observacao_item?: string | null
    }>
    totais?: {
        quantidade_mix?: number
        quantidade_volume?: number
        cubagem_total?: number
        volume_total_cubico?: number
        peso_liquido?: number
        peso_bruto?: number
        total_bruto?: number
        total_desconto?: number
        total_liquido?: number
        valor_bruto?: number
        valor_desconto?: number
        valor_liquido?: number
    }
}

function toISODateTime(date: string | null | undefined): string | null {
    if (!date) return null
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(date)) {
        return date
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return `${date}T00:00:00Z`
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) {
        return `${date}:00Z`
    }

    const parsed = new Date(date)
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function normalizePedidoStatus(status: string): Pedido['status'] {
    if (status === 'aguardando_aprovacao' || status === 'aprovado' || status === 'cancelado') {
        return status
    }
    return 'em_digitacao'
}

export class ApiPedidoRepository implements PedidoRepository {
    async listCompanies(): Promise<Array<{ id: number; nome: string }>> {
        const companies: ApiEmpresaRow[] = []
        let cursor: string | null = null

        do {
            const params = new URLSearchParams({ limit: '100' })
            if (cursor !== null) params.set('cursor', cursor)
            const response = await apiRequest<ApiEmpresaPage>(`/empresas?${params.toString()}`)
            companies.push(...(response.items ?? []))
            cursor = response.nextCursor ?? null
        } while (cursor !== null)

        return companies.map(({ id, nome }) => ({ id, nome }))
    }

    async listPaymentConditions(): Promise<Array<{ id: number; descricao: string }>> {
        const conditions: ApiCondicaoPagamentoRow[] = []
        let cursor: string | null = null

        do {
            const params = new URLSearchParams({ limit: '100' })
            if (cursor !== null) params.set('cursor', cursor)
            const response = await apiRequest<ApiCondicaoPagamentoPage>(`/condicoes-pagamento?${params.toString()}`)
            conditions.push(...(response.items ?? []))
            cursor = response.nextCursor ?? null
        } while (cursor !== null)

        return conditions.map(({ id, descricao }) => ({ id, descricao }))
    }

    async listPaymentMethods(): Promise<Array<{ id: number; descricao: string }>> {
        const methods: ApiFormaPagamentoRow[] = []
        let cursor: string | null = null

        do {
            const params = new URLSearchParams({ limit: '100' })
            if (cursor !== null) params.set('cursor', cursor)
            const response = await apiRequest<ApiFormaPagamentoPage>(`/formas-pagamento?${params.toString()}`)
            methods.push(...(response.items ?? []))
            cursor = response.nextCursor ?? null
        } while (cursor !== null)

        return methods.map(({ id, descricao }) => ({ id, descricao }))
    }

    async listCarriers(): Promise<Array<{ id: number; nome: string }>> {
        const carriers: ApiTransportadoraRow[] = []
        let cursor: string | null = null

        do {
            const params = new URLSearchParams({ limit: '100' })
            if (cursor !== null) params.set('cursor', cursor)
            const response = await apiRequest<ApiTransportadoraPage>(`/transportadoras?${params.toString()}`)
            carriers.push(...(response.items ?? []))
            cursor = response.nextCursor ?? null
        } while (cursor !== null)

        return carriers.map(({ id, nome_razao }) => ({ id, nome: nome_razao }))
    }

    async listPriceTables(): Promise<Array<{ id: number; nome: string; vigencia: string }>> {
        const priceTables: ApiTabelaPrecoRow[] = []
        let cursor: string | null = null

        do {
            const params = new URLSearchParams({ limit: '100' })
            if (cursor !== null) params.set('cursor', cursor)
            const response = await apiRequest<ApiTabelaPrecoPage>(`/tabelas-preco?${params.toString()}`)
            priceTables.push(...(response.items ?? []))
            cursor = response.nextCursor ?? null
        } while (cursor !== null)

        return priceTables.map(({ id, descricao, vigencia }) => ({
            id,
            nome: descricao,
            vigencia: vigencia ?? '',
        }))
    }

    async listProducts(): Promise<Array<{
        id: number
        code: string
        description: string
        family: string
        brand: string
        unit: string
        priceTableId: number
        salePrice: number
    }>> {
        const products: ApiProdutoRow[] = []
        let cursor: string | null = null

        do {
            const params = new URLSearchParams({ limit: '100' })
            if (cursor !== null) params.set('cursor', cursor)
            const response = await apiRequest<ApiProdutoPage>(`/produtos?${params.toString()}`)
            products.push(...(response.items ?? []))
            cursor = response.nextCursor ?? null
        } while (cursor !== null)

        return products.map((product) => ({
            id: product.id,
            code: product.codigo_erp,
            description: product.descricao,
            family: product.familia ?? '',
            brand: product.marca ?? '',
            unit: product.unidade ?? '',
            priceTableId: product.tabela_preco_padrao_id ?? 0,
            salePrice: product.preco_venda,
        }))
    }

    async list(type: PedidoTipo): Promise<Pedido[]> {
        const path = type === PedidoTypeEnum.Orcamento ? '/orcamentos' : '/pedidos'
        const orders: ApiPedidoRow[] = []
        let cursor: string | null = null

        do {
            const params = new URLSearchParams({ limit: '100' })
            if (cursor !== null) params.set('cursor', cursor)
            const response = await apiRequest<ApiPedidoPage>(`${path}?${params.toString()}`)
            orders.push(...(response.items ?? []))
            cursor = response.nextCursor ?? null
        } while (cursor !== null)

        return orders.map((item) => ({
            id: item.id,
            type,
            number: item.numero,
            customerOrderNumber: '',
            status: normalizePedidoStatus(item.status),
            issueDate: item.data_emissao,
            deliveryDate: '',
            companyId: null,
            customerId: null,
            customerName: item.cliente_nome,
            customerTaxId: '',
            paymentConditionId: null,
            paymentMethodId: null,
            carrierId: null,
            billingAddressId: null,
            deliveryAddressId: null,
            collectionAddressId: null,
            freightAmount: 0,
            observation: '',
            invoiceObservation: '',
            items: [],
            totals: {
                mixQuantity: 0,
                volumeQuantity: 0,
                totalCubicVolume: 0,
                netWeight: 0,
                grossWeight: 0,
                grossTotal: 0,
                discountTotal: 0,
                netTotal: item.total_liquido,
            },
        }))
    }

    async getById(id: number, type: PedidoTipo): Promise<Pedido | null> {
        const path = type === PedidoTypeEnum.Orcamento ? `/orcamentos/${id}` : `/pedidos/${id}`

        try {
            const response = await apiRequest<ApiPedidoDetalhe>(path)
            return {
                id: response.id,
                type,
                number: response.numero,
                customerOrderNumber: response.numero_cliente ?? '',
                status: normalizePedidoStatus(response.status),
                issueDate: response.data_emissao,
                deliveryDate: response.data_entrega ?? '',
                companyId: response.empresa?.id ?? null,
                customerId: response.cliente?.id ?? null,
                customerName: response.cliente?.nome_razao_social ?? response.cliente_nome ?? '',
                customerTaxId: response.cliente?.cnpj_cpf ?? response.cliente_cnpj_cpf ?? '',
                paymentConditionId: response.condicao_pagamento?.id ?? null,
                paymentMethodId: response.forma_pagamento?.id ?? null,
                carrierId: response.transportadora?.id ?? null,
                billingAddressId: response.endereco_faturamento_id,
                deliveryAddressId: response.endereco_entrega_id,
                collectionAddressId: response.endereco_cobranca_id,
                freightAmount: Number(response.valor_frete) || 0,
                observation: response.observacoes_pedido ?? '',
                invoiceObservation: response.observacoes_nota_fiscal ?? '',
                items: (response.itens ?? []).map((item, index) => ({
                    sequence: item.sequence > 0 ? item.sequence : index + 1,
                    customerCode: item.codigo_cliente ?? '',
                    product: {
                        id: item.product.id,
                        code: item.product.codigo_erp,
                        description: item.product.descricao,
                        family: item.product.familia ?? '',
                        brand: item.product.marca ?? '',
                        unit: item.product.unidade ?? '',
                        netWeight: item.product.peso_liquido ?? 0,
                        grossWeight: item.product.peso_bruto ?? 0,
                        cubicVolume: item.product.cubagem ?? 0,
                        length: item.product.comprimento ?? 0,
                        width: item.product.largura ?? 0,
                        height: item.product.altura_espessura ?? 0,
                        packageQuantity: item.product.qtde_embalagem ?? 0,
                        allowsOutOfStockSale: item.product.permite_venda_sem_estoque ?? false,
                        stock: item.product.stock ?? 0,
                    },
                    priceTableId: item.price_table_id ?? 0,
                    priceTableName: item.price_table_name ?? '',
                    priceTableValidity: item.price_table_validity ?? '',
                    quantity: item.quantidade_informada,
                    salePrice: item.sale_price,
                    discountAmount: item.valor_desconto_comercial,
                    total: item.valor_total_produtos_liquido,
                    observation: item.observacao_item ?? '',
                })),
                totals: {
                    mixQuantity: response.totais?.quantidade_mix ?? response.itens?.length ?? 0,
                    volumeQuantity: response.totais?.quantidade_volume ?? 0,
                    totalCubicVolume: response.totais?.volume_total_cubico ?? response.totais?.cubagem_total ?? 0,
                    netWeight: response.totais?.peso_liquido ?? 0,
                    grossWeight: response.totais?.peso_bruto ?? 0,
                    grossTotal: response.totais?.valor_bruto ?? response.totais?.total_bruto ?? 0,
                    discountTotal: response.totais?.valor_desconto ?? response.totais?.total_desconto ?? 0,
                    netTotal: response.totais?.valor_liquido ?? response.totais?.total_liquido ?? response.itens?.reduce((total, item) => total + item.valor_total_produtos_liquido, 0) ?? 0,
                },
            }
        } catch (error: unknown) {
            if (error instanceof Error && /404|not found/i.test(error.message)) {
                return null
            }
            throw error
        }
    }

    async save(pedido: Pedido): Promise<Pedido> {
        const payload = {
            cliente_id: pedido.customerId,
            tipo: pedido.type,
            numero_cliente: pedido.customerOrderNumber ?? '',
            data_entrega: toISODateTime(pedido.deliveryDate),
            valor_frete: Number(pedido.freightAmount) || 0,
            condicao_pagamento_id: pedido.paymentConditionId,
            forma_pagamento_id: pedido.paymentMethodId,
            transportadora_id: pedido.carrierId,
            endereco_faturamento_id: pedido.billingAddressId,
            endereco_entrega_id: pedido.deliveryAddressId,
            endereco_cobranca_id: pedido.collectionAddressId,
            observacoes_pedido: pedido.observation,
            observacoes_nota_fiscal: pedido.invoiceObservation,
            itens: pedido.items.map((item) => ({
                produto_id: item.product.id,
                quantidade: item.quantity,
                preco_venda: item.salePrice,
                valor_desconto: item.discountAmount,
            })),
        }

        const isUpdate = pedido.id !== null && pedido.id !== undefined
        const response = await apiRequest<ApiPedidoDetalhe | null>(
            isUpdate ? `/pedidos/${pedido.id}` : '/pedidos',
            {
                method: isUpdate ? 'PUT' : 'POST',
                body: JSON.stringify(payload),
            },
        )

        if (response === null) {
            if (isUpdate) return pedido
            throw new Error('A API não retornou os dados do pedido criado.')
        }

        return {
            ...pedido,
            id: response.id,
            number: response.numero,
            status: normalizePedidoStatus(response.status),
            issueDate: response.data_emissao,
            deliveryDate: response.data_entrega ?? '',
            customerOrderNumber: response.numero_cliente ?? '',
            customerName: response.cliente?.nome_razao_social ?? response.cliente_nome ?? pedido.customerName,
            customerTaxId: response.cliente?.cnpj_cpf ?? response.cliente_cnpj_cpf ?? pedido.customerTaxId,
            billingAddressId: response.endereco_faturamento_id,
            deliveryAddressId: response.endereco_entrega_id,
            collectionAddressId: response.endereco_cobranca_id,
            freightAmount: Number(response.valor_frete) || 0,
            observation: response.observacoes_pedido ?? '',
            invoiceObservation: response.observacoes_nota_fiscal ?? '',
            totals: {
                mixQuantity: response.totais?.quantidade_mix ?? 0,
                volumeQuantity: response.totais?.quantidade_volume ?? 0,
                totalCubicVolume: response.totais?.volume_total_cubico ?? response.totais?.cubagem_total ?? 0,
                netWeight: response.totais?.peso_liquido ?? 0,
                grossWeight: response.totais?.peso_bruto ?? 0,
                grossTotal: response.totais?.valor_bruto ?? response.totais?.total_bruto ?? 0,
                discountTotal: response.totais?.valor_desconto ?? response.totais?.total_desconto ?? 0,
                netTotal: response.totais?.valor_liquido ?? response.totais?.total_liquido ?? 0,
            },
        }
    }

    async delete(id: number): Promise<void> {
        await apiRequest<void>(`/pedidos/${id}`, { method: 'DELETE' })
    }

    async getCustomerAddresses(customerId: number): Promise<Endereco[]> {
        const response = await apiRequest<ApiEnderecoRow[]>(`/clientes/${customerId}/enderecos`)
        return response.map((address) => ({
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
        }))
    }

    createDraft(type: PedidoTipo): Pedido {
        return {
            id: null,
            type,
            number: '',
            customerOrderNumber: '',
            status: 'em_digitacao',
            issueDate: new Date().toISOString().slice(0, 10),
            deliveryDate: '',
            companyId: null,
            customerId: null,
            customerName: '',
            customerTaxId: '',
            paymentConditionId: null,
            paymentMethodId: null,
            carrierId: null,
            billingAddressId: null,
            deliveryAddressId: null,
            collectionAddressId: null,
            freightAmount: 0,
            observation: '',
            invoiceObservation: '',
            items: [],
            totals: {
                mixQuantity: 0,
                volumeQuantity: 0,
                totalCubicVolume: 0,
                netWeight: 0,
                grossWeight: 0,
                grossTotal: 0,
                discountTotal: 0,
                netTotal: 0,
            },
        }
    }
}