export enum PedidoTipo {
    Pedido = 'pedido',
    Orcamento = 'orcamento',
}

export type PedidoStatus =
    | 'em_digitacao'
    | 'em_integracao'
    | 'integrado'
    | 'erro_integracao'
    | 'aguardando_aprovacao'
    | 'aprovado'
    | 'cancelado'