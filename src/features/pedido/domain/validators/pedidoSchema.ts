import { z } from 'zod'
import { PedidoTipo } from '../entities/PedidoTipo'

export const pedidoSchema = z.object({
    type: z.nativeEnum(PedidoTipo),
    number: z.string(),
    customerOrderNumber: z.string(),
    status: z.enum([
        'em_digitacao',
        'em_integracao',
        'integrado',
        'erro_integracao',
        'aguardando_aprovacao',
        'aprovado',
        'cancelado',
    ]),
    issueDate: z.string().min(1, 'Informe a data de emissão.'),
    deliveryDate: z.string(),
    companyId: z.number().nullable(),
    customerId: z.union([z.number(), z.string()]).nullable(),
    customerName: z.string(),
    customerTaxId: z.string(),
    paymentConditionId: z.number().nullable(),
    paymentMethodId: z.number().nullable(),
    carrierId: z.number().nullable(),
    billingAddressId: z.number().nullable(),
    deliveryAddressId: z.number().nullable(),
    collectionAddressId: z.number().int().positive().nullable(),
    freightAmount: z.number().min(0, 'O frete não pode ser negativo.'),
    observation: z.string(),
    invoiceObservation: z.string(),
    items: z.array(z.object({
        sequence: z.number(),
        customerCode: z.string(),
        product: z.object({
            id: z.number(), code: z.string(), description: z.string(), family: z.string(), brand: z.string(), unit: z.string(),
            netWeight: z.number(), grossWeight: z.number(), cubicVolume: z.number(), length: z.number(), width: z.number(), height: z.number(),
            packageQuantity: z.number(), allowsOutOfStockSale: z.boolean(), stock: z.number(),
        }),
        priceTableId: z.number(), priceTableName: z.string(), priceTableValidity: z.string(),
        quantity: z.number().positive(), salePrice: z.number().min(0), discountAmount: z.number().min(0), total: z.number(), observation: z.string(),
    })),
    totals: z.object({
        mixQuantity: z.number(), volumeQuantity: z.number(), totalCubicVolume: z.number(), netWeight: z.number(), grossWeight: z.number(),
        grossTotal: z.number(), discountTotal: z.number(), netTotal: z.number(),
    }),
})

export type PedidoFormValues = z.infer<typeof pedidoSchema>