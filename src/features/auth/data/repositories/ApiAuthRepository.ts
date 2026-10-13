import { apiRequest } from '../../../../core/api/apiClient'
import type { LoginCredentials, Usuario } from '../../domain/entities/Usuario'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'

interface ApiLoginResponse {
    usuario: {
        id: number
        nome: string
        email: string
        token: string
    }
}

export class ApiAuthRepository implements AuthRepository {
    async login(credentials: LoginCredentials): Promise<Usuario> {
        const response = await apiRequest<ApiLoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: credentials.email,
                senha: credentials.password,
            }),
        })

        return {
            id: response.usuario.id,
            name: response.usuario.nome,
            email: response.usuario.email,
            token: response.usuario.token,
        }
    }
}