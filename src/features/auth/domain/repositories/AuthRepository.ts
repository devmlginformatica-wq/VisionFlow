import type { LoginCredentials, Usuario } from '../entities/Usuario'

export interface AuthRepository {
    login(credentials: LoginCredentials): Promise<Usuario>
}