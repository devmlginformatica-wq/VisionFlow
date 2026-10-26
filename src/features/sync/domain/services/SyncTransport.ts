export interface SyncTransport {
    get<T>(path: string): Promise<T>
    post<T>(path: string, body: unknown): Promise<T>
    put<T>(path: string, body: unknown): Promise<T>
    delete<T>(path: string): Promise<T>
}

export class SyncTransportError extends Error {
    constructor(readonly status: number, message: string) {
        super(message)
        this.name = 'SyncTransportError'
    }

    get isClientError(): boolean {
        return this.status >= 400 && this.status < 500
    }
}
