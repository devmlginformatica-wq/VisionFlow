export function normalizePedidoId(id: number | string): number | string {
    if (typeof id === 'number') {
        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new Error(`Invalid pedido id: ${id}`)
        }
        return id
    }

    if (id.trim().length === 0) {
        throw new Error('A non-empty pedido id is required.')
    }

    if (/^\d+$/.test(id)) {
        const numericId = Number(id)
        if (!Number.isSafeInteger(numericId) || numericId <= 0) {
            throw new Error(`Invalid pedido id: ${id}`)
        }
        return numericId
    }

    return id
}
