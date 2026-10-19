import { expect, test } from '../fixtures'

interface ApiAddress {
    id: number
    tipo_endereco: 'cobranca' | 'entrega' | 'ambos'
    endereco_padrao: boolean
    cep: string
    logradouro: string
    numero_endereco: string
    complemento_endereco: string
    bairro: string
    cidade: string
    estado: string
    ponto_referencia: string
    restricoes_horarios: string
}

type AddressPayload = Omit<ApiAddress, 'id'>

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function parseAddressPayload(value: unknown): AddressPayload {
    if (
        !isRecord(value) ||
        (value.tipo_endereco !== 'cobranca' && value.tipo_endereco !== 'entrega' && value.tipo_endereco !== 'ambos') ||
        typeof value.endereco_padrao !== 'boolean' ||
        typeof value.cep !== 'string' ||
        typeof value.logradouro !== 'string' ||
        typeof value.numero_endereco !== 'string' ||
        typeof value.complemento_endereco !== 'string' ||
        typeof value.bairro !== 'string' ||
        typeof value.cidade !== 'string' ||
        typeof value.estado !== 'string' ||
        typeof value.ponto_referencia !== 'string' ||
        typeof value.restricoes_horarios !== 'string'
    ) {
        throw new Error('Payload de endereço incompatível com o contrato da API.')
    }

    return {
        tipo_endereco: value.tipo_endereco,
        endereco_padrao: value.endereco_padrao,
        cep: value.cep,
        logradouro: value.logradouro,
        numero_endereco: value.numero_endereco,
        complemento_endereco: value.complemento_endereco,
        bairro: value.bairro,
        cidade: value.cidade,
        estado: value.estado,
        ponto_referencia: value.ponto_referencia,
        restricoes_horarios: value.restricoes_horarios,
    }
}

test('cria múltiplos endereços, atualiza um endereço e recarrega os dados pela API', async ({ page }) => {
    const clientId = 6001
    let nextAddressId = 101
    const addresses: ApiAddress[] = []
    const createdPayloads: AddressPayload[] = []
    const updatedAddresses: Array<{ id: number; payload: AddressPayload }> = []
    const deletedAddressIds: number[] = []

    await page.addInitScript(() => {
        localStorage.setItem('visionflow:auth', JSON.stringify({
            state: { user: { id: 7, name: 'E2E', email: 'e2e@example.com', token: 'test-token' } },
            version: 0,
        }))
    })

    await page.route('**/shell/empresa', async (route) => {
        await route.fulfill({
            json: {
                success: true,
                data: { nome: 'Empresa E2E', cnpj: '00000000000000', regional: 'SP', contato: '', usuario_logado: { id: 7, nome: 'E2E', email: 'e2e@example.com' } },
                error: null,
            },
        })
    })
    await page.route('**/notificacoes/nao-lidas/count', async (route) => {
        await route.fulfill({ json: { success: true, data: { nao_lidas: 0 }, error: null } })
    })
    for (const path of ['transportadoras', 'condicoes-pagamento', 'formas-pagamento', 'tabelas-preco']) {
        await page.route(`**/${path}**`, async (route) => {
            await route.fulfill({ json: { success: true, data: { items: [], nextCursor: null }, error: null } })
        })
    }
    await page.route('**/clientes/**', async (route) => {
        const url = new URL(route.request().url())
        const method = route.request().method()
        const addressCollectionPath = `/clientes/${clientId}/enderecos`

        if (!url.pathname.startsWith('/clientes/')) {
            await route.continue()
            return
        }
        if (url.pathname === `/clientes/${clientId}/contas-receber` && method === 'GET') {
            await route.fulfill({ json: { success: true, data: [], error: null } })
            return
        }
        if (url.pathname === addressCollectionPath && method === 'GET') {
            await route.fulfill({ json: { success: true, data: addresses, error: null } })
            return
        }
        if (url.pathname === addressCollectionPath && method === 'POST') {
            const payload = parseAddressPayload(route.request().postDataJSON())
            createdPayloads.push(payload)
            const savedAddress = { id: nextAddressId++, ...payload }
            addresses.unshift(savedAddress)
            await route.fulfill({ status: 201, json: { success: true, data: savedAddress, error: null } })
            return
        }
        const addressPath = url.pathname.match(new RegExp(`^/clientes/${clientId}/enderecos/(\\d+)$`))
        if (addressPath && method === 'PUT') {
            const addressId = Number(addressPath[1])
            const payload = parseAddressPayload(route.request().postDataJSON())
            updatedAddresses.push({ id: addressId, payload })
            const index = addresses.findIndex((address) => address.id === addressId)
            if (index < 0) {
                await route.fulfill({ status: 404, json: { success: false, data: null, error: { message: 'Endereço não encontrado.' } } })
                return
            }
            if (payload.endereco_padrao) {
                addresses.forEach((address) => { address.endereco_padrao = false })
            }
            addresses[index] = { id: addressId, ...payload }
            await route.fulfill({ json: { success: true, data: addresses[index], error: null } })
            return
        }
        if (addressPath && method === 'DELETE') {
            const addressId = Number(addressPath[1])
            deletedAddressIds.push(addressId)
            const index = addresses.findIndex((address) => address.id === addressId)
            if (index >= 0) addresses.splice(index, 1)
            await route.fulfill({ json: { success: true, data: { ok: true }, error: null } })
            return
        }
        if (url.pathname === `/clientes/${clientId}` && method === 'GET') {
            await route.fulfill({
                json: {
                    success: true,
                    data: {
                        id: clientId,
                        codigo_erp: 'API-6001',
                        nome_razao_social: 'Cliente E2E Endereços',
                        nome_fantasia: '',
                        cnpj_cpf: '',
                        tipo_pessoa: 'J',
                        ativo: true,
                        cidade: null,
                        estado: null,
                    },
                    error: null,
                },
            })
            return
        }

        await route.fulfill({ status: 404, json: { success: false, data: null, error: { message: `Rota E2E inesperada: ${method} ${url.pathname}` } } })
    })

    await page.goto(`/app/clientes/${clientId}`)
    await expect(page.getByRole('heading', { name: 'Cadastro de Cliente' })).toBeVisible()
    await page.getByRole('tab', { name: 'Endereços' }).click()

    const addAddress = async (street: string, number: string, purpose: 'Principal' | 'Secundário'): Promise<void> => {
        await page.getByRole('button', { name: 'Adicionar Endereço' }).click()
        const dialog = page.getByRole('dialog', { name: 'Cadastro de Endereço' })
        await dialog.getByLabel('Tipo').selectOption('entrega')
        await dialog.getByLabel('Finalidade').selectOption(purpose === 'Principal' ? 'principal' : 'secundario')
        await dialog.getByRole('textbox', { name: /^CEP/ }).fill('01001000')
        await dialog.getByLabel('Logradouro').fill(street)
        await dialog.getByLabel('Número').fill(number)
        await dialog.getByLabel('Bairro').fill('Centro')
        await dialog.getByLabel('Cidade').fill('São Paulo')
        await dialog.getByLabel('Estado').fill('SP')
        await dialog.getByRole('button', { name: 'Salvar' }).click()
        await expect(dialog).toBeHidden()
    }

    await addAddress('Rua Primeiro Cadastro', '10', 'Principal')
    await addAddress('Rua Segundo Cadastro', '20', 'Secundário')

    expect(createdPayloads).toHaveLength(2)
    expect(createdPayloads[0]).toMatchObject({
        tipo_endereco: 'entrega',
        endereco_padrao: true,
        cep: '01001000',
        logradouro: 'Rua Primeiro Cadastro',
        numero_endereco: '10',
        complemento_endereco: '',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        ponto_referencia: '',
        restricoes_horarios: '',
    })
    expect(createdPayloads[1].endereco_padrao).toBe(false)
    await expect(page.getByText('Rua Primeiro Cadastro, 10')).toBeVisible()
    await expect(page.getByText('Rua Segundo Cadastro, 20')).toBeVisible()

    await page.getByRole('button', { name: /Rua Primeiro Cadastro/ }).click()
    const editDialog = page.getByRole('dialog', { name: 'Cadastro de Endereço' })
    await editDialog.getByLabel('Logradouro').fill('Rua Endereço Atualizado')
    await editDialog.getByLabel('Número').fill('99')
    await editDialog.getByRole('button', { name: 'Salvar' }).click()
    await expect(editDialog).toBeHidden()

    expect(createdPayloads).toHaveLength(2)
    expect(updatedAddresses).toHaveLength(1)
    expect(updatedAddresses[0].id).toBe(101)
    expect(updatedAddresses[0].payload).toMatchObject({
        logradouro: 'Rua Endereço Atualizado',
        numero_endereco: '99',
        endereco_padrao: true,
    })
    expect(deletedAddressIds).toEqual([])
    await expect(page.getByText('Rua Endereço Atualizado, 99')).toBeVisible()
    await expect(page.getByText('Rua Primeiro Cadastro, 10')).toHaveCount(0)

    await page.reload()
    await page.getByRole('tab', { name: 'Endereços' }).click()
    await expect(page.getByText('Rua Endereço Atualizado, 99')).toBeVisible()
    await expect(page.getByText('Rua Segundo Cadastro, 20')).toBeVisible()
    await expect(page.getByText('Rua Primeiro Cadastro, 10')).toHaveCount(0)
})
