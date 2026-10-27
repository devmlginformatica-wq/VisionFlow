import logger from 'loglevel'

import type { SyncOperation } from '../entities/SyncOperation'
import type { SyncQueueRepository } from '../repositories/SyncQueueRepository'
import { SyncTransportError, type SyncTransport } from './SyncTransport'

type SyncRecord = Record<string, unknown>

export class SyncEngine {
    private processing = false

    constructor(
        private readonly queueRepository: SyncQueueRepository,
        private readonly transport: SyncTransport,
    ) {}

    async processQueue(): Promise<void> {
        if (this.processing) {
            return
        }

        this.processing = true

        try {
            while (true) {
                const [operation] = await this.queueRepository.getPending()
                if (!operation) {
                    break
                }

                let entityId = operation.entityId
                try {
                    const createdEntityId = await this.processOperation(operation)
                    if (createdEntityId !== undefined) {
                        await this.queueRepository.remapEntityId(operation.entity, operation.entityId, createdEntityId)
                        entityId = createdEntityId
                    }
                } catch (error) {
                    const message = this.getErrorMessage(error)

                    if (error instanceof SyncTransportError && (error.status === 401 || error.status === 403)) {
                        logger.warn(`Sync paused after authentication failure: ${message}`)
                        break
                    }

                    if (error instanceof SyncTransportError && error.isClientError) {
                        await this.queueRepository.markEntityError(operation.entity, operation.entityId, message)
                        await this.queueRepository.remove(operation.id)
                        logger.error(`Sync operation ${operation.id} rejected: ${message}`)
                        continue
                    }

                    await this.queueRepository.updateAttempts(operation.id, operation.attempts + 1, message)
                    logger.warn(`Sync operation ${operation.id} will be retried: ${message}`)
                    break
                }

                await this.queueRepository.remove(operation.id)
                if (operation.action !== 'delete') {
                    await this.queueRepository.markEntitySynced(operation.entity, entityId)
                }
            }
        } finally {
            this.processing = false
        }
    }

    private async processOperation(operation: SyncOperation): Promise<number | undefined> {
        const collectionPath = operation.entity === 'cliente' ? '/clientes' : '/pedidos'

        switch (operation.action) {
            case 'create':
                return this.readCreatedEntityId(
                    await this.transport.post<unknown>(
                        collectionPath,
                        this.apiPayload(operation.entity, operation.payload),
                    ),
                )
            case 'update': {
                const entityPath = `${collectionPath}/${this.getEntityId(operation)}`
                const remote = await this.transport.get<SyncRecord>(entityPath)
                if (this.remoteIsNewer(remote, operation)) {
                    logger.info(`Keeping newer remote ${operation.entity} ${operation.entityId}`)
                    return
                }
                await this.transport.put(entityPath, this.apiPayload(operation.entity, operation.payload))
                return
            }
            case 'delete':
                await this.transport.delete(`${collectionPath}/${this.getEntityId(operation)}`)
                return
        }
    }

    private readCreatedEntityId(response: unknown): number {
        if (typeof response !== 'object' || response === null || !('id' in response)) {
            throw new Error('Sync create response does not contain an entity id.')
        }

        const id = response.id
        if (typeof id === 'number' && Number.isSafeInteger(id) && id > 0) {
            return id
        }
        throw new Error(`Sync create response contains an invalid entity id: ${String(id)}`)
    }

    private apiPayload(entity: SyncOperation['entity'], payload: unknown): SyncRecord {
        if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
            throw new Error('Sync payload must be an object.')
        }

        if (entity === 'pedido') {
            return this.pedidoApiPayload(payload as SyncRecord)
        }

        return this.clienteApiPayload(payload as SyncRecord)
    }

    private clienteApiPayload(payload: SyncRecord): SyncRecord {
        const addresses = payload.addresses
        if (!Array.isArray(addresses)) {
            throw new Error('Cliente sync payload must contain an addresses array.')
        }

        const addressValue = addresses.find((address) =>
            typeof address === 'object' && address !== null && !Array.isArray(address)
            && (address as SyncRecord).purpose === 'principal',
        ) ?? addresses[0]
        const address = typeof addressValue === 'object' && addressValue !== null && !Array.isArray(addressValue)
            ? addressValue as SyncRecord
            : {}
        const lastVisit = payload.lastVisit

        return {
            nome_razao_social: this.stringValue(payload.name),
            nome_fantasia: this.stringValue(payload.tradeName),
            cnpj_cpf: this.stringValue(payload.taxId),
            inscricao_estadual_rg: this.stringValue(payload.stateRegistration),
            tipo_pessoa: this.requiredString(payload.personType, 'cliente.personType'),
            prospect: this.booleanValue(payload.prospect, 'cliente.prospect'),
            telefone1: this.stringValue(payload.commercialPhone),
            telefone2: this.stringValue(payload.otherPhone),
            celular: this.stringValue(payload.mobilePhone),
            nome_contato_comprador: this.stringValue(payload.buyerContact),
            email_contato_comprador: this.stringValue(payload.buyerEmail),
            nome_contato_faturamento: this.stringValue(payload.billingContact),
            email_contato_faturamento: this.stringValue(payload.invoiceEmail),
            limite_credito_total: this.numberValue(payload.creditLimit, 'cliente.creditLimit'),
            anotacao_erp: this.stringValue(payload.erpNotes),
            transportadora_padrao_id: this.nullableNumber(payload.carrierId, 'cliente.carrierId'),
            condicao_pagamento_padrao_id: this.nullableNumber(payload.paymentConditionId, 'cliente.paymentConditionId'),
            forma_pagamento_padrao_id: this.nullableNumber(payload.paymentMethodId, 'cliente.paymentMethodId'),
            tabela_preco_padrao_id: this.nullableNumber(payload.priceTableId, 'cliente.priceTableId'),
            data_ultima_visita: typeof lastVisit === 'string' && lastVisit.length > 0 ? lastVisit : null,
            anotacao_usuario: this.stringValue(payload.userNotes),
            cep: this.stringValue(address.zipCode),
            logradouro: this.stringValue(address.street),
            numero_endereco: this.stringValue(address.number),
            complemento: this.stringValue(address.complement),
            bairro: this.stringValue(address.district),
            cidade: this.stringValue(address.city),
            estado: this.stringValue(address.state),
        }
    }

    private pedidoApiPayload(payload: SyncRecord): SyncRecord {
        const items = payload.items
        if (!Array.isArray(items)) {
            throw new Error('Pedido sync payload must contain an items array.')
        }

        return {
            tipo: this.requiredString(payload.type, 'pedido.type'),
            numero_cliente: this.stringValue(payload.customerOrderNumber),
            status: this.requiredString(payload.status, 'pedido.status'),
            cliente_id: this.nullableNumber(payload.customerId, 'pedido.customerId'),
            condicao_pagamento_id: this.nullableNumber(payload.paymentConditionId, 'pedido.paymentConditionId'),
            forma_pagamento_id: this.nullableNumber(payload.paymentMethodId, 'pedido.paymentMethodId'),
            transportadora_id: this.nullableNumber(payload.carrierId, 'pedido.carrierId'),
            endereco_faturamento_id: this.nullableNumber(payload.billingAddressId, 'pedido.billingAddressId'),
            endereco_entrega_id: this.nullableNumber(payload.deliveryAddressId, 'pedido.deliveryAddressId'),
            endereco_cobranca_id: this.nullableNumber(payload.collectionAddressId, 'pedido.collectionAddressId'),
            data_entrega: this.toISODateTime(payload.deliveryDate),
            valor_frete: this.numberValue(payload.freightAmount, 'pedido.freightAmount'),
            observacoes_pedido: this.stringValue(payload.observation),
            observacoes_nota_fiscal: this.stringValue(payload.invoiceObservation),
            itens: items.map((item, index) => this.pedidoItemApiPayload(item, index)),
        }
    }

    private pedidoItemApiPayload(item: unknown, index: number): SyncRecord {
        if (typeof item !== 'object' || item === null || Array.isArray(item)) {
            throw new Error(`Pedido sync item ${index + 1} must be an object.`)
        }
        const itemRecord = item as SyncRecord
        const product = itemRecord.product
        if (typeof product !== 'object' || product === null || Array.isArray(product)) {
            throw new Error(`Pedido sync item ${index + 1} must contain a product.`)
        }
        const productRecord = product as SyncRecord

        return {
            sequence: this.numberValue(itemRecord.sequence, `pedido.items[${index}].sequence`),
            produto_id: this.numberValue(productRecord.id, `pedido.items[${index}].product.id`),
            quantidade: this.numberValue(itemRecord.quantity, `pedido.items[${index}].quantity`),
            preco_venda: this.numberValue(itemRecord.salePrice, `pedido.items[${index}].salePrice`),
            valor_desconto: this.numberValue(itemRecord.discountAmount, `pedido.items[${index}].discountAmount`),
        }
    }

    private requiredString(value: unknown, label: string): string {
        if (typeof value !== 'string') {
            throw new Error(`Missing ${label} in pedido sync payload.`)
        }
        return value
    }

    private stringValue(value: unknown): string {
        return typeof value === 'string' ? value : ''
    }

    private booleanValue(value: unknown, label: string): boolean {
        if (typeof value !== 'boolean') {
            throw new Error(`Invalid ${label} in sync payload.`)
        }
        return value
    }

    private numberValue(value: unknown, label: string): number {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new Error(`Invalid ${label} in pedido sync payload.`)
        }
        return value
    }

    private nullableNumber(value: unknown, label: string): number | null {
        return value === null || value === undefined ? null : this.numberValue(value, label)
    }

    private toISODateTime(value: unknown): string | null {
        if (typeof value !== 'string' || value.length === 0) return null
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
            return value
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return `${value}T00:00:00Z`
        }
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
            return `${value}:00Z`
        }

        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
    }

    private remoteIsNewer(remote: SyncRecord, operation: SyncOperation): boolean {
        const remoteTimestamp = this.parseTimestamp(remote.updated_at, 'remote updated_at')
        const payload = operation.payload
        const localValue = typeof payload === 'object' && payload !== null && !Array.isArray(payload)
            ? (payload as SyncRecord).updated_at
            : undefined
        const localTimestamp = this.parseTimestamp(
            typeof localValue === 'string' ? localValue : operation.createdAt,
            'local updated_at',
        )

        return remoteTimestamp > localTimestamp
    }

    private parseTimestamp(value: unknown, label: string): bigint {
        if (typeof value !== 'string') {
            throw new Error(`Missing ${label} timestamp in sync data.`)
        }

        const timestamp = Date.parse(value)
        const seconds = Math.floor(timestamp / 1000)
        if (Number.isNaN(timestamp) || !Number.isFinite(seconds)) {
            throw new Error(`Invalid ${label} timestamp: ${value}`)
        }

        const fraction = value.match(/\.(\d+)(?=Z|[+-]\d{2}:\d{2}$)/)?.[1] ?? ''
        const nanoseconds = BigInt(fraction.padEnd(9, '0').slice(0, 9) || '0')

        return BigInt(seconds) * 1_000_000_000n + nanoseconds
    }

    private getEntityId(operation: SyncOperation): number {
        const id = Number(operation.entityId)
        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new SyncTransportError(400, `Invalid ${operation.entity} id: ${operation.entityId}`)
        }

        return id
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error)
    }
}
