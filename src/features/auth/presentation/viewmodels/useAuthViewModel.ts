import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApiRepository } from '../../../../core/api/apiClient'
import { ApiAuthRepository } from '../../data/repositories/ApiAuthRepository'
import { MockAuthRepository } from '../../data/repositories/MockAuthRepository'
import type { LoginCredentials } from '../../domain/entities/Usuario'
import { useAuthStore } from '../stores/useAuthStore'

const authRepository = useApiRepository ? new ApiAuthRepository() : new MockAuthRepository()

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function getInternalPath(path: unknown): string | null {
    return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') && !path.includes('\\')
        ? path
        : null
}

function getRedirectTarget(state: unknown, search: string): string {
    if (isRecord(state) && isRecord(state.from)) {
        const from = state.from
        const pathname = getInternalPath(from.pathname)
        if (pathname) {
            const query = typeof from.search === 'string' ? from.search : ''
            const hash = typeof from.hash === 'string' ? from.hash : ''
            return `${pathname}${query}${hash}`
        }
    }

    const requestedPath = getInternalPath(new URLSearchParams(search).get('redirect'))
    return requestedPath ?? '/'
}

export interface AuthViewModel {
    loading: boolean
    error: string | null
    submitLogin: (credentials: LoginCredentials) => Promise<void>
}

export function useAuthViewModel(): AuthViewModel {
    const location = useLocation()
    const navigate = useNavigate()
    const setSession = useAuthStore((state) => state.setSession)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const submissionLock = useRef(false)

    async function submitLogin(credentials: LoginCredentials): Promise<void> {
        if (submissionLock.current) return
        submissionLock.current = true
        setLoading(true)
        setError(null)

        try {
            const user = await authRepository.login(credentials)
            setSession(user)
            navigate(getRedirectTarget(location.state, location.search), { replace: true })
        } catch (loginError: unknown) {
            setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar. Tente novamente.')
        } finally {
            submissionLock.current = false
            setLoading(false)
        }
    }

    return { loading, error, submitLogin }
}