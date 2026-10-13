import type { ProdutoPedido } from '../../../domain/entities/ItemPedido'
import type { z } from 'zod'
import { productSelectionSchema } from '../../../domain/validators/itemPedidoSchema'

export interface ProductSelectionProduct extends Pick<ProdutoPedido, 'id' | 'code' | 'description' | 'family' | 'brand' | 'unit'> {
    priceTableId: number
    salePrice: number
}

export type ProductSelectionValues = z.infer<typeof productSelectionSchema>