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

interface ApiPedidoDetalhe {
    id: number
    tipo: string
    numero: string
    numero_cliente?: string
    status: string
    data_emissao: string
    data_entrega?: string
    empresa?: { id: number; nome: string } | null
    cliente?: { id: number; nome: string; cpf_cnpj: string } | null
    condicao_pagamento?: { id: number; descricao: string } | null
    forma_pagamento?: { id: number; descricao: string } | null
    transportadora?: { id: number; nome: string } | null
    endereco_faturamento_id?: number | null
    endereco_entrega_id?: number | null
    endereco_cobranca_id?: number | null
    valor_frete?: number
    observacoes?: string
    observacoes_nf?: string
    itens?: Array<{
        sequencia: number
        codigo_cliente?: string
        produto: {
            id: number
            codigo: string
            descricao: string
            familia?: string
            marca?: string
            unidade?: string
            peso_liquido?: number
            peso_bruto?: number
            cubagem?: number
            comprimento?: number
            largura?: number
            altura_espessura?: number
            qtde_embalagem?: number
            permite_venda_sem_estoque?: boolean
        }
        tabela_preco?: { id: number; nome: string; vigencia: string } | null
        quantidade: number
        preco_venda: number
        valor_desconto: number
        total_item: number
        observacao?: string
    }>
    totais?: {
        quantidade_mix?: number
        quantidade_volume?: number
        cubagem_total?: number
        peso_liquido?: number
        peso_bruto?: number
        total_bruto?: number
        total_desconto?: number
        total_liquido?: number
    }
}

function normalizePedidoStatus(status: string): Pedido['status'] {
    if (status === 'aguardando_aprovacao' || status === 'aprovado' || status === 'cancelado') {
        return status
    }
    return 'em_digitacao'
}

export class ApiPedidoRepository implements PedidoRepository {
    async list(type: PedidoTipo): Promise<Pedido[]> {
        const path = type === PedidoTypeEnum.Orcamento ? '/orcamentos' : '/pedidos'
        const response = await apiRequest<ApiPedidoRow[]>(path)

        return response.map((item) => ({
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
        const path = type === PedidoTypeEnum.Orcamento ? `/pedidos/${id}` : `/pedidos/${id}`

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
                customerName: response.cliente?.nome ?? '',
                customerTaxId: response.cliente?.cpf_cnpj ?? '',
                paymentConditionId: response.condicao_pagamento?.id ?? null,
                paymentMethodId: response.forma_pagamento?.id ?? null,
                carrierId: response.transportadora?.id ?? null,
                billingAddressId: response.endereco_faturamento_id ?? null,
                deliveryAddressId: response.endereco_entrega_id ?? null,
                collectionAddressId: response.endereco_cobranca_id ?? null,
                freightAmount: response.valor_frete ?? 0,
                observation: response.observacoes ?? '',
                invoiceObservation: response.observacoes_nf ?? '',
                items: (response.itens ?? []).map((item) => ({
                    sequence: item.sequencia,
                    customerCode: item.codigo_cliente ?? '',
                    product: {
                        id: item.produto.id,
                        code: item.produto.codigo,
                        description: item.produto.descricao,
                        family: item.produto.familia ?? '',
                        brand: item.produto.marca ?? '',
                        unit: item.produto.unidade ?? '',
                        netWeight: item.produto.peso_liquido ?? 0,
                        grossWeight: item.produto.peso_bruto ?? 0,
                        cubicVolume: item.produto.cubagem ?? 0,
                        length: item.produto.comprimento ?? 0,
                        width: item.produto.largura ?? 0,
                        height: item.produto.altura_espessura ?? 0,
                        packageQuantity: item.produto.qtde_embalagem ?? 0,
                        allowsOutOfStockSale: item.produto.permite_venda_sem_estoque ?? false,
                        stock: 0,
                    },
                    priceTableId: item.tabela_preco?.id ?? 0,
                    priceTableName: item.tabela_preco?.nome ?? '',
                    priceTableValidity: item.tabela_preco?.vigencia ?? '',
                    quantity: item.quantidade,
                    salePrice: item.preco_venda,
                    discountAmount: item.valor_desconto,
                    total: item.total_item,
                    observation: item.observacao ?? '',
                })),
                totals: {
                    mixQuantity: response.totais?.quantidade_mix ?? response.itens?.length ?? 0,
                    volumeQuantity: response.totais?.quantidade_volume ?? 0,
                    totalCubicVolume: response.totais?.cubagem_total ?? 0,
                    netWeight: response.totais?.peso_liquido ?? 0,
                    grossWeight: response.totais?.peso_bruto ?? 0,
                    grossTotal: response.totais?.total_bruto ?? 0,
                    discountTotal: response.totais?.total_desconto ?? 0,
                    netTotal: response.totais?.total_liquido ?? response.itens?.reduce((total, item) => total + item.total_item, 0) ?? 0,
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
            condicao_pagamento_id: pedido.paymentConditionId,
            forma_pagamento_id: pedido.paymentMethodId,
            transportadora_id: pedido.carrierId,
            observacoes: pedido.observation,
            itens: pedido.items.map((item) => ({
                produto_id: item.product.id,
                quantidade: item.quantity,
                preco_venda: item.salePrice,
                valor_desconto: item.discountAmount,
            })),
        }

        const response = await apiRequest<ApiPedidoDetalhe>('/pedidos', {
            method: 'POST',
            body: JSON.stringify(payload),
        })

        return {
            ...pedido,
            id: response.id,
            number: response.numero,
            status: normalizePedidoStatus(response.status),
            issueDate: response.data_emissao,
            deliveryDate: response.data_entrega ?? '',
            customerOrderNumber: response.numero_cliente ?? '',
            customerName: response.cliente?.nome ?? pedido.customerName,
            customerTaxId: response.cliente?.cpf_cnpj ?? pedido.customerTaxId,
            freightAmount: response.valor_frete ?? 0,
            observation: response.observacoes ?? '',
            invoiceObservation: response.observacoes_nf ?? '',
            totals: {
                mixQuantity: response.totais?.quantidade_mix ?? 0,
                volumeQuantity: response.totais?.quantidade_volume ?? 0,
                totalCubicVolume: response.totais?.cubagem_total ?? 0,
                netWeight: response.totais?.peso_liquido ?? 0,
                grossWeight: response.totais?.peso_bruto ?? 0,
                grossTotal: response.totais?.total_bruto ?? 0,
                discountTotal: response.totais?.total_desconto ?? 0,
                netTotal: response.totais?.total_liquido ?? 0,
            },
        }
    }

    async delete(id: number): Promise<void> {
        await apiRequest<void>(`/pedidos/${id}`, { method: 'DELETE' })
    }

    async getCustomerAddresses(customerId: number): Promise<Endereco[]> {
        try {
            const response = await apiRequest<Array<{ id: number; tipo: string; finalidade: string; cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string; ponto_referencia: string; restricoes_entrega: string }>>(`/clientes/${customerId}/enderecos`)
            return response.map((address) => ({
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
        } catch {
            return []
        }
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