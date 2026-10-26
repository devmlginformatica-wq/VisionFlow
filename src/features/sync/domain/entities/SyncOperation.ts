export type SyncEntity = 'cliente' | 'pedido'
export type SyncAction = 'create' | 'update' | 'delete'

export interface SyncOperationData {
    id: string
    entity: SyncEntity
    entityId: number | string
    action: SyncAction
    payload: unknown
    createdAt: string
    attempts: number
    lastError: string | null
}

export class SyncOperation {
    readonly id: string
    readonly entity: SyncEntity
    readonly entityId: number | string
    readonly action: SyncAction
    readonly payload: unknown
    readonly createdAt: string
    readonly attempts: number
    readonly lastError: string | null

    constructor(data: SyncOperationData) {
        this.id = data.id
        this.entity = data.entity
        this.entityId = data.entityId
        this.action = data.action
        this.payload = data.payload
        this.createdAt = data.createdAt
        this.attempts = data.attempts
        this.lastError = data.lastError
    }

    static fromJson(data: Partial<SyncOperationData> | null | undefined): SyncOperation {
        if (!data) {
            throw new Error('SyncOperation payload is required.')
        }

        return new SyncOperation({
            id: typeof data.id === 'string' ? data.id : this.generateId(),
            entity: this.parseEntity(data.entity),
            entityId: data.entityId ?? '',
            action: this.parseAction(data.action),
            payload: data.payload ?? null,
            createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
            attempts: typeof data.attempts === 'number' ? data.attempts : 0,
            lastError: typeof data.lastError === 'string' || data.lastError === null ? data.lastError : null,
        })
    }

    toJson(): SyncOperationData {
        return {
            id: this.id,
            entity: this.entity,
            entityId: this.entityId,
            action: this.action,
            payload: this.payload,
            createdAt: this.createdAt,
            attempts: this.attempts,
            lastError: this.lastError,
        }
    }

    copyWith(partial: Partial<SyncOperationData>): SyncOperation {
        return SyncOperation.fromJson({
            ...this.toJson(),
            ...partial,
        })
    }

    equals(other: unknown): boolean {
        if (!(other instanceof SyncOperation)) {
            return false
        }

        return JSON.stringify(this.toJson()) === JSON.stringify(other.toJson())
    }

    private static generateId(): string {
        if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
            return globalThis.crypto.randomUUID()
        }

        return `sync-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    }

    private static parseEntity(value: unknown): SyncEntity {
        if (value === 'cliente' || value === 'pedido') {
            return value
        }

        throw new Error(`Invalid sync entity: ${String(value)}`)
    }

    private static parseAction(value: unknown): SyncAction {
        if (value === 'create' || value === 'update' || value === 'delete') {
            return value
        }

        throw new Error(`Invalid sync action: ${String(value)}`)
    }
}
