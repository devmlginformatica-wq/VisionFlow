import { expect, type Page } from '@playwright/test'

interface JsonResponse {
    json(): Promise<unknown>
}

interface HttpResponse extends JsonResponse {
    ok(): boolean
    status(): number
    text(): Promise<string>
}

interface RealProduct {
    id: number
    code: string
    description: string
    price: number
    stock: number
    allowsOutOfStockSale: boolean
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

export async function getAuthHeaders(page: Page): Promise<Record<string, string>> {
    const rawState = await page.evaluate(() => localStorage.getItem('visionflow:auth'))
    if (!rawState) {
        throw new Error('Estado de autenticação ausente; faça login antes de chamar a API real.')
    }

    let parsed: unknown
    try {
        parsed = JSON.parse(rawState)
    } catch (error: unknown) {
        throw new Error('Não foi possível interpretar o estado de autenticação.', { cause: error })
    }

    if (!isRecord(parsed)) {
        throw new Error('O estado de autenticação tem um formato inesperado.')
    }

    const state = isRecord(parsed.state) ? parsed.state : parsed
    const user = isRecord(state.user) ? state.user : null
    const token = user?.token ?? state.token
    if (typeof token !== 'string' || token.length === 0) {
        throw new Error('Token de autenticação ausente para a API real.')
    }

    return { Authorization: `Bearer ${token}` }
}

export async function responseData(response: JsonResponse): Promise<unknown> {
    const payload: unknown = await response.json()
    return isRecord(payload) && 'data' in payload ? payload.data : payload
}

export async function responseId(response: JsonResponse): Promise<number> {
    const data = await responseData(response)
    if (!isRecord(data) || typeof data.id !== 'number') {
        throw new Error('A resposta real da API não contém um ID numérico.')
    }
    return data.id
}

export async function responseErrorCode(response: JsonResponse): Promise<string | null> {
    const payload: unknown = await response.json()
    if (!isRecord(payload) || !isRecord(payload.error) || typeof payload.error.code !== 'string') {
        return null
    }
    return payload.error.code
}

function randomDigits(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
}

function calculateCheckDigit(digits: string, weights: number[]): number {
    const sum = [...digits].reduce((total, digit, index) => total + Number(digit) * weights[index], 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
}

export function createValidCPF(): string {
    const base = randomDigits(9)
    const firstDigit = calculateCheckDigit(base, [10, 9, 8, 7, 6, 5, 4, 3, 2])
    const secondDigit = calculateCheckDigit(`${base}${firstDigit}`, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
    return `${base}${firstDigit}${secondDigit}`
}

export function createValidCNPJ(): string {
    const base = `${randomDigits(8)}0001`
    const firstDigit = calculateCheckDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    const secondDigit = calculateCheckDigit(`${base}${firstDigit}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    return `${base}${firstDigit}${secondDigit}`
}

export function createUniqueName(prefix: string): string {
    return `[E2E real] ${prefix} ${Date.now()}-${randomDigits(5)}`
}

export function createUniqueAddressNumber(): string {
    return `${Date.now()}${randomDigits(5)}`
}

async function assertApiSuccess(response: HttpResponse, action: string): Promise<void> {
    if (!response.ok()) {
        throw new Error(`${action} falhou na API real (HTTP ${response.status()}): ${await response.text()}`)
    }
}

export async function deleteAddressViaApi(page: Page, clientId: number, addressId: number): Promise<void> {
    const response = await page.request.delete(`/clientes/${clientId}/enderecos/${addressId}`, {
        headers: await getAuthHeaders(page),
    })
    if (response.status() === 404) return
    await assertApiSuccess(response, 'Remoção do endereço de setup')
}

export async function createClientViaApi(
    page: Page,
    name: string,
    personType: 'PF' | 'PJ' = 'PJ',
    taxId = personType === 'PF' ? createValidCPF() : createValidCNPJ(),
): Promise<number> {
    const response = await page.request.post('/clientes', {
        headers: await getAuthHeaders(page),
        data: {
            nome_razao_social: name,
            nome_fantasia: name,
            cnpj_cpf: taxId,
            tipo_pessoa: personType,
            telefone1: '11999990000',
            prospect: false,
        },
    })
    await assertApiSuccess(response, 'Criação do cliente de setup')
    expect(response.status()).toBe(201)
    return responseId(response)
}

export async function createAddressViaApi(page: Page, clientId: number): Promise<number> {
    const response = await page.request.post(`/clientes/${clientId}/enderecos`, {
        headers: await getAuthHeaders(page),
        data: {
            tipo_endereco: 'entrega',
            endereco_padrao: true,
            cep: randomDigits(8),
            logradouro: `Avenida E2E ${randomDigits(5)}`,
            numero_endereco: createUniqueAddressNumber(),
            complemento_endereco: '',
            bairro: `Bairro E2E ${randomDigits(4)}`,
            cidade: `Cidade E2E ${randomDigits(4)}`,
            estado: 'SP',
            ponto_referencia: '',
            restricoes_horarios: '',
        },
    })
    await assertApiSuccess(response, 'Criação do endereço de setup')
    expect(response.status()).toBe(201)
    return responseId(response)
}

export async function listRealProducts(page: Page): Promise<RealProduct[]> {
    const products: RealProduct[] = []
    let cursor: string | null = null

    do {
        const params = new URLSearchParams({ limit: '100' })
        if (cursor !== null) params.set('cursor', cursor)
        const response = await page.request.get(`/produtos?${params.toString()}`, {
            headers: await getAuthHeaders(page),
        })
        await assertApiSuccess(response, 'Consulta do catálogo real de produtos')

        const data = await responseData(response)
        if (!isRecord(data) || !Array.isArray(data.items)) {
            throw new Error('A API real de produtos retornou uma página inválida.')
        }
        for (const item of data.items) {
            if (
                isRecord(item) &&
                typeof item.id === 'number' &&
                typeof item.codigo_erp === 'string' &&
                typeof item.descricao === 'string' &&
                typeof item.preco_venda === 'number'
            ) {
                products.push({
                    id: item.id,
                    code: item.codigo_erp,
                    description: item.descricao,
                    price: item.preco_venda,
                    stock: typeof item.stock === 'number' ? item.stock : 0,
                    allowsOutOfStockSale: item.permite_venda_sem_estoque === true,
                })
            }
        }
        cursor = typeof data.nextCursor === 'string' ? data.nextCursor : null
    } while (cursor !== null)

    return products
}

export function formatBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
