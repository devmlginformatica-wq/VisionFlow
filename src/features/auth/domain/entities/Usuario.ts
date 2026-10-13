export interface Usuario {
    id: number
    name: string
    email: string
    token: string
}

export interface LoginCredentials {
    email: string
    password: string
}