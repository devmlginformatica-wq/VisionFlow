import type { SyncEntity, SyncOperation } from '../entities/SyncOperation'

export interface SyncQueueRepository {
    enqueue(operation: SyncOperation): Promise<SyncOperation>
    getPending(): Promise<SyncOperation[]>
    remove(id: string): Promise<void>
    updateAttempts(id: string, attempts: number, lastError?: string | null): Promise<void>
    remapEntityId(entity: SyncEntity, oldId: number | string, newId: number | string): Promise<void>
    markEntitySynced(entity: SyncEntity, entityId: number | string): Promise<void>
    markEntityError(entity: SyncEntity, entityId: number | string): Promise<void>
}
