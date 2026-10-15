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
    endereco_faturamento_id?: number | null
    endereco_entrega_id?: number | null
    endereco_cobranca_id?: number | null
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

function normalizePedidoStatus(status: string): Pedido['status'] {
    if (status === 'aguardando_aprovacao' || status === 'aprovado' || status === 'cancelado') {
        return status
    }
    return 'em_digitacao'
}

export class ApiPedidoRepository implements PedidoRepository {
    async list(type: PedidoTipo): Promise<Pedido[]> {
        const path = type === PedidoTypeEnum.Orcamento ? '/orcamentos' : '/pedidos'
        const response = await apiRequest<ApiPedidoPage>(path)

        return (response.items ?? []).map((item) => ({
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
                billingAddressId: response.endereco_faturamento_id ?? null,
                deliveryAddressId: response.endereco_entrega_id ?? null,
                collectionAddressId: response.endereco_cobranca_id ?? null,
                freightAmount: response.valor_frete ?? 0,
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
            customerName: response.cliente?.nome_razao_social ?? response.cliente_nome ?? pedido.customerName,
            customerTaxId: response.cliente?.cnpj_cpf ?? response.cliente_cnpj_cpf ?? pedido.customerTaxId,
            freightAmount: response.valor_frete ?? 0,
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