export interface ProdutoPedido {
    id: number
    code: string
    description: string
    family: string
    brand: string
    unit: string
    netWeight: number
    grossWeight: number
    cubicVolume: number
    length: number
    width: number
    height: number
    packageQuantity: number
    allowsOutOfStockSale: boolean
    stock: number
}

export interface ItemPedido {
    sequence: number
    customerCode: string
    product: ProdutoPedido
    priceTableId: number
    priceTableName: string
    priceTableValidity: string
    quantity: number
    salePrice: number
    discountAmount: number
    total: number
    observation: string
}