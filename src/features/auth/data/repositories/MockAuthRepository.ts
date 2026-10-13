import loginMock from '../../../../mocks/auth/login.json'
import type { LoginCredentials, Usuario } from '../../domain/entities/Usuario'
import type { AuthRepository } from '../../domain/repositories/AuthRepository'

const sellerUser: Usuario = {
    id: 2,
    name: 'Mariana Costa',
    email: 'vendedor@visionflow.app',
    token: 'mock-token-456',
}

export class MockAuthRepository implements AuthRepository {
    async login({ email, password }: LoginCredentials): Promise<Usuario> {
        if (password !== '123456') throw new Error('E-mail ou senha inválidos.')

        if (email.toLowerCase() === sellerUser.email) return sellerUser

        const admin = loginMock.data.usuario
        if (email.toLowerCase() === admin.email) {
            return { id: admin.id, name: admin.nome, email: admin.email, token: admin.token }
        }

        throw new Error('E-mail ou senha inválidos.')
    }
}