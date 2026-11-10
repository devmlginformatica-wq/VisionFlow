import { useAuthStore } from '../../features/auth/presentation/stores/useAuthStore'

type ApiErrorBody = {
    code?: string
    message?: string
}

type ApiEnvelope<T> = {
    success: boolean
    data: T
    error: ApiErrorBody | null
}

export class ApiRequestError extends Error {
    constructor(message: string, readonly status: number) {
        super(message)
        this.name = 'ApiRequestError'
    }
}

export const useApiRepository = import.meta.env.VITE_USE_API !== 'false'

export function handleAuthFailure(status: number): void {
    if (
        (status !== 401 && status !== 403)
        || typeof navigator === 'undefined'
        || navigator.onLine !== true
    ) {
        return
    }

    useAuthStore.getState().clearSession()
    localStorage.clear()
    window.dispatchEvent(new Event('visionflow:session-expired'))
}

export function getApiBaseUrl(): string {
    if (import.meta.env.DEV) {
        return ''
    }

    const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
    return String(configuredBaseUrl).replace(/\/+$/, '')
}

function readStoredToken(): string | null {
    try {
        const rawState = localStorage.getItem('visionflow:auth')
        if (!rawState) return null
        const parsed = JSON.parse(rawState) as {
            user?: { token?: string }
            state?: { user?: { token?: string } }
        }

        if (typeof parsed?.user?.token === 'string') {
            return parsed.user.token
        }

        if (typeof parsed?.state?.user?.token === 'string') {
            return parsed.state.user.token
        }

        return null
    } catch {
        return null
    }
}

function parseErrorFromResponse(payload: unknown): string {
    if (typeof payload === 'object' && payload !== null) {
        const candidate = payload as Record<string, unknown>
        if (typeof candidate.message === 'string' && candidate.message.trim().length > 0) {
            return candidate.message
        }
        if (typeof candidate.error === 'object' && candidate.error !== null) {
            const errorBody = candidate.error as { message?: string }
            if (typeof errorBody.message === 'string' && errorBody.message.trim().length > 0) {
                return errorBody.message
            }
        }
    }

    return 'Não foi possível concluir a operação.'
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const url = `${getApiBaseUrl()}${normalizedPath}`
    const headers = new Headers(init.headers ?? {})

    if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    const token = readStoredToken()
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(url, {
        ...init,
        headers,
    })

    if (!response.ok) {
        handleAuthFailure(response.status)
    }

    let payload: unknown = null
    const rawText = await response.text()
    if (rawText) {
        try {
            payload = JSON.parse(rawText)
        } catch {
            payload = rawText
        }
    }

    if (!response.ok) {
        throw new ApiRequestError(parseErrorFromResponse(payload), response.status)
    }

    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
        const envelope = payload as ApiEnvelope<T>
        if (!envelope.success) {
            throw new Error(envelope.error?.message ?? 'A API retornou erro.')
        }
        return envelope.data as T
    }

    return payload as T
}
