import { getApiBaseUrl, handleAuthFailure } from '../../../../core/api/apiClient'
import { useAuthStore } from '../../../auth/presentation/stores/useAuthStore'
import { SyncTransportError, type SyncTransport } from '../../domain/services/SyncTransport'

interface ApiErrorBody {
    message?: string
}

interface ApiEnvelope<T> {
    success: boolean
    data: T
    error: ApiErrorBody | null
}

export class ApiSyncDatasource implements SyncTransport {
    async get<T>(path: string): Promise<T> {
        return this.request<T>(path, 'GET')
    }

    async post<T>(path: string, body: unknown): Promise<T> {
        return this.request<T>(path, 'POST', body)
    }

    async put<T>(path: string, body: unknown): Promise<T> {
        return this.request<T>(path, 'PUT', body)
    }

    async delete<T>(path: string): Promise<T> {
        return this.request<T>(path, 'DELETE')
    }

    private async request<T>(path: string, method: string, body?: unknown): Promise<T> {
        const headers = new Headers({ Accept: 'application/json' })
        const token = useAuthStore.getState().user?.token
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }

        const requestBody = body === undefined ? undefined : JSON.stringify(body)
        if (requestBody !== undefined) {
            headers.set('Content-Type', 'application/json')
        }

        const response = await fetch(`${getApiBaseUrl()}${path}`, {
            method,
            headers,
            body: requestBody,
        })
        handleAuthFailure(response.status)
        const responseText = await response.text()
        const responseBody = this.parseResponse(responseText, response.status)

        if (!response.ok) {
            throw new SyncTransportError(
                response.status,
                this.errorMessage(responseBody) ?? `Sync request failed with HTTP ${response.status}.`,
            )
        }

        const envelope = this.asEnvelope<T>(responseBody)
        if (!envelope) {
            throw new Error('Sync API response does not match the expected envelope.')
        }
        if (!envelope.success) {
            throw new SyncTransportError(
                500,
                this.errorMessage(responseBody) ?? 'Sync API returned an unsuccessful response.',
            )
        }

        return envelope.data
    }

    private errorMessage(value: unknown): string | null {
        if (typeof value !== 'object' || value === null || !('error' in value)) {
            return null
        }

        const error = value.error
        if (typeof error !== 'object' || error === null || !('message' in error)) {
            return null
        }

        return typeof error.message === 'string' ? error.message : null
    }

    private parseResponse(text: string, status: number): unknown {
        if (!text) {
            if (status >= 400) {
                return null
            }

            throw new Error(`Sync API returned an empty response (HTTP ${status}).`)
        }

        try {
            return JSON.parse(text) as unknown
        } catch {
            if (status >= 400) {
                return { error: { message: text } }
            }

            throw new Error('Sync API returned invalid JSON.')
        }
    }

    private asEnvelope<T>(value: unknown): ApiEnvelope<T> | null {
        if (typeof value !== 'object' || value === null || !('success' in value) || !('data' in value)) {
            return null
        }

        const candidate = value as Partial<ApiEnvelope<T>>
        if (typeof candidate.success !== 'boolean') {
            return null
        }

        return candidate as ApiEnvelope<T>
    }
}
