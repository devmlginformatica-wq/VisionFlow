import { z } from 'zod'

export const productSelectionSchema = z.object({
    productId: z.number().positive(),
    quantity: z.number().positive('A quantidade deve ser maior que zero.'),
})

export const itemPedidoSchema = z.object({
    quantity: z.number().positive('A quantidade deve ser maior que zero.'),
    salePrice: z.number().min(0),
    discountAmount: z.number().min(0),
    priceTableId: z.number().positive(),
    observation: z.string(),
    customerCode: z.string(),
})