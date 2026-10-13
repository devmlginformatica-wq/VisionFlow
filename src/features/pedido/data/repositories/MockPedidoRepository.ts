import clientsMock from '../../../../mocks/clientes/listar.json'
import companiesMock from '../../../../mocks/empresas/listar.json'
import paymentConditionsMock from '../../../../mocks/condicoes_pagamento/listar.json'
import paymentMethodsMock from '../../../../mocks/formas_pagamento/listar.json'
import orderDetailMock from '../../../../mocks/pedido/detalhe_1001.json'
import ordersMock from '../../../../mocks/pedido/listar.json'
import productsMock from '../../../../mocks/produtos/listar.json'
import priceTablesMock from '../../../../mocks/tabelas_preco/listar.json'
import carriersMock from '../../../../mocks/transportadoras/listar.json'
import customerAddressesMock from '../../../../mocks/clientes/24129/enderecos.json'
import type { ItemPedido, ProdutoPedido } from '../../domain/entities/ItemPedido'
import type { Pedido } from '../../domain/entities/Pedido'
import { PedidoTipo, type PedidoStatus } from '../../domain/entities/PedidoTipo'
import { calcularPedidoTotais } from '../../domain/services/PedidoTotais'
import type { PedidoRepository } from '../../domain/repositories/PedidoRepository'
import type { Endereco } from '../../../cliente/domain/entities/Endereco'

const detail = orderDetailMock.data

function normalizeStatus(status: string): PedidoStatus {
    if (status === 'aguardando_aprovacao' || status === 'aprovado' || status === 'cancelado') return status
    return 'em_digitacao'
}

function mapProduct(product: typeof detail.itens[number]['produto']): ProdutoPedido {
    return {
        id: product.id,
        code: product.codigo,
        description: product.descricao,
        family: product.familia,
        brand: product.marca,
        unit: product.unidade,
        netWeight: product.peso_liquido,
        grossWeight: product.peso_bruto,
        cubicVolume: product.cubagem,
        length: product.comprimento,
        width: product.largura,
        height: product.altura_espessura,
        packageQuantity: product.qtde_embalagem,
        allowsOutOfStockSale: product.permite_venda_sem_estoque,
        stock: 0,
    }
}

function mapItem(item: typeof detail.itens[number]): ItemPedido {
    return {
        sequence: item.sequencia,
        customerCode: item.codigo_cliente,
        product: mapProduct(item.produto),
        priceTableId: item.tabela_preco.id,
        priceTableName: item.tabela_preco.nome,
        priceTableValidity: item.tabela_preco.vigencia,
        quantity: item.quantidade,
        salePrice: item.preco_venda,
        discountAmount: item.valor_desconto,
        total: item.total_item,
        observation: item.observacao,
    }
}

function mapDetail(type: PedidoTipo): Pedido {
    const items = detail.itens.map(mapItem)
    return {
        id: detail.id,
        type,
        number: detail.numero,
        customerOrderNumber: detail.numero_cliente,
        status: normalizeStatus(detail.status),
        issueDate: detail.data_emissao,
        deliveryDate: detail.data_entrega,
        companyId: detail.empresa.id,
        customerId: detail.cliente.id,
        customerName: detail.cliente.nome,
        customerTaxId: detail.cliente.cpf_cnpj,
        paymentConditionId: detail.condicao_pagamento.id,
        paymentMethodId: detail.forma_pagamento.id,
        carrierId: detail.transportadora.id,
        billingAddressId: detail.endereco_faturamento_id,
        deliveryAddressId: detail.endereco_entrega_id,
        collectionAddressId: detail.endereco_cobranca_id,
        freightAmount: detail.valor_frete,
        observation: detail.observacoes,
        invoiceObservation: detail.observacoes_nf,
        items,
        totals: calcularPedidoTotais(items, detail.valor_frete),
    }
}

const defaultOrder: Pedido = {
    id: null,
    type: PedidoTipo.Pedido,
    number: '',
    customerOrderNumber: '',
    status: 'em_digitacao',
    issueDate: new Date().toISOString().slice(0, 10),
    deliveryDate: '',
    companyId: companiesMock.data[0]?.id ?? null,
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
    totals: calcularPedidoTotais([], 0),
}

export const orderCatalogs = {
    companies: companiesMock.data,
    clients: clientsMock.data,
    paymentConditions: paymentConditionsMock.data,
    paymentMethods: paymentMethodsMock.data,
    carriers: carriersMock.data,
    priceTables: priceTablesMock.data,
    products: productsMock.data.map((product) => ({
        id: product.id,
        code: product.codigo,
        description: product.descricao,
        family: product.familia,
        brand: product.marca,
        unit: product.unidade,
        priceTableId: product.tabela_preco_padrao_id,
        salePrice: product.preco_venda,
    })),
} as const

export class MockPedidoRepository implements PedidoRepository {
    private orders: Pedido[] = [mapDetail(PedidoTipo.Pedido)]
    private nextId = Math.max(...ordersMock.data.map((order) => order.id)) + 1

    async list(type: PedidoTipo): Promise<Pedido[]> {
        const seed = type === PedidoTipo.Pedido ? ordersMock.data : []
        const listed = seed.map((row) => {
            const existing = this.orders.find((order) => order.id === row.id && order.type === type)
            if (existing) return existing
            const detailOrder = mapDetail(type)
            return {
                ...detailOrder,
                id: row.id,
                number: row.numero,
                status: normalizeStatus(row.status),
                issueDate: row.data_emissao,
                customerName: row.cliente_nome,
                totals: { ...detailOrder.totals, netTotal: row.total_liquido },
            }
        })
        return [...listed, ...this.orders.filter((order) => order.type === type && !listed.some((item) => item.id === order.id))]
    }

    async getById(id: number, type: PedidoTipo): Promise<Pedido | null> {
        const existing = this.orders.find((order) => order.id === id && order.type === type)
        return existing ?? null
    }

    async save(pedido: Pedido): Promise<Pedido> {
        const saved = { ...pedido, id: pedido.id ?? this.nextId++, number: pedido.number || String(this.nextId - 1) }
        this.orders = [saved, ...this.orders.filter((order) => order.id !== saved.id || order.type !== saved.type)]
        return saved
    }

    async delete(id: number): Promise<void> {
        this.orders = this.orders.filter((order) => order.id !== id)
    }

    async getCustomerAddresses(customerId: number): Promise<Endereco[]> {
        if (customerId !== 24129) return []
        return customerAddressesMock.data.map((address) => ({
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
    }

    createDraft(type: PedidoTipo): Pedido {
        return { ...defaultOrder, type, items: [] }
    }
}

export const mockPedidoRepository = new MockPedidoRepository()