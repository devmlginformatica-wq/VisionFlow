import type { SyncEntity, SyncOperation } from '../../domain/entities/SyncOperation'
import type { SyncQueueRepository } from '../../domain/repositories/SyncQueueRepository'
import { SyncQueueLocalDatasource } from '../datasources/SyncQueueLocalDatasource'

export class DexieSyncQueueRepository implements SyncQueueRepository {
    constructor(private readonly datasource: SyncQueueLocalDatasource = new SyncQueueLocalDatasource()) {}

    async enqueue(operation: SyncOperation): Promise<SyncOperation> {
        return this.datasource.enqueue(operation)
    }

    async getPending(): Promise<SyncOperation[]> {
        return this.datasource.getPending()
    }

    async remove(id: string): Promise<void> {
        await this.datasource.remove(id)
    }

    async updateAttempts(id: string, attempts: number, lastError: string | null = null): Promise<void> {
        await this.datasource.updateAttempts(id, attempts, lastError)
    }

    async remapEntityId(entity: SyncEntity, oldId: number | string, newId: number | string): Promise<void> {
        await this.datasource.remapEntityId(entity, oldId, newId)
    }

    async markEntitySynced(entity: SyncEntity, entityId: number | string): Promise<void> {
        await this.datasource.markEntitySynced(entity, entityId)
    }

    async markEntityError(entity: SyncEntity, entityId: number | string): Promise<void> {
        await this.datasource.markEntityError(entity, entityId)
    }
}
