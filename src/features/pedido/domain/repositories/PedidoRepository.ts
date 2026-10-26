import type { Pedido } from '../entities/Pedido'
import type { PedidoTipo } from '../entities/PedidoTipo'
import type { Endereco } from '../../../cliente/domain/entities/Endereco'

export interface PedidoRepository {
    list(type: PedidoTipo): Promise<Pedido[]>
    getById(id: number | string, type: PedidoTipo): Promise<Pedido | null>
    save(pedido: Pedido): Promise<Pedido>
    delete(id: number | string): Promise<void>
    getCustomerAddresses(customerId: number): Promise<Endereco[]>
}