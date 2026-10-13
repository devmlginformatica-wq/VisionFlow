export enum PedidoTipo {
    Pedido = 'pedido',
    Orcamento = 'orcamento',
}

export type PedidoStatus = 'em_digitacao' | 'aguardando_aprovacao' | 'aprovado' | 'cancelado'