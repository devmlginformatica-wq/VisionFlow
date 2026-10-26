import { expect, test } from './fixtures'
import {
    createAddressViaApi,
    createUniqueName,
    createValidCNPJ,
    getAuthHeaders,
    listRealProducts,
    responseId,
} from './real-api-helpers'

let testClientId: number | null = null
let testAddressId: number | null = null
let seededOrderId: number | null = null
let syncedOrderId: number | null = null
let testCustomerName = ''
let testProductDescription = ''

test.beforeEach(async ({ page, loginTenant4 }) => {
    await loginTenant4()
    const headers = await getAuthHeaders(page)
    testCustomerName = createUniqueName('Cliente offline sync')

    const clientResponse = await page.request.post('/clientes', {
        headers,
        data: {
            nome_razao_social: testCustomerName,
            nome_fantasia: testCustomerName,
            cnpj_cpf: createValidCNPJ(),
            tipo_pessoa: 'PJ',
            prospect: false,
            telefone1: '11999990000',
        },
    })
    await expect(clientResponse).toBeOK()
    testClientId = await responseId(clientResponse)

    testAddressId = await createAddressViaApi(page, testClientId)

    const product = (await listRealProducts(page)).find((item) => item.price > 0)
    if (!product) {
        throw new Error('O catálogo do Tenant 4 não tem produto com preço para criar o pedido de setup.')
    }
    testProductDescription = product.description

    const orderResponse = await page.request.post('/pedidos', {
        headers,
        data: {
            tipo: 'pedido',
            cliente_id: testClientId,
            endereco_faturamento_id: testAddressId,
            endereco_entrega_id: testAddressId,
            endereco_cobranca_id: testAddressId,
            valor_frete: 0,
            observacoes_pedido: 'Pedido de setup do teste E2E offline.',
            observacoes_nota_fiscal: '',
            itens: [{
                sequence: 1,
                produto_id: product.id,
                quantidade: 1,
                preco_venda: product.price,
                valor_desconto: 0,
            }],
        },
    })
    await expect(orderResponse).toBeOK()
    seededOrderId = await responseId(orderResponse)
})

test.afterEach(async ({ page }) => {
    const headers = await getAuthHeaders(page)

    for (const orderId of [syncedOrderId, seededOrderId]) {
        if (orderId === null) continue
        const response = await page.request.delete(`/pedidos/${orderId}`, { headers })
        await expect(response).toBeOK()
    }
    syncedOrderId = null
    seededOrderId = null

    if (testClientId !== null && testAddressId !== null) {
        const addressResponse = await page.request.delete(
            `/clientes/${testClientId}/enderecos/${testAddressId}`,
            { headers },
        )
        await expect(addressResponse).toBeOK()
    }
    testAddressId = null

    if (testClientId !== null) {
        const clientResponse = await page.request.delete(`/clientes/${testClientId}`, { headers })
        await expect(clientResponse).toBeOK()
    }
    testClientId = null
})

test('abre dados em cache offline, salva um pedido e sincroniza ao voltar online', async ({
    page,
    context,
}) => {
    if (testClientId === null || testAddressId === null || seededOrderId === null) {
        throw new Error('Os dados de setup do teste não foram criados.')
    }

    const orderPath = `/app/pedidos/${seededOrderId}`
    const orderDetailResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname === `/pedidos/${seededOrderId}`
        && response.request().method() === 'GET',
    )
    const orderListResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/pedidos'
        && response.request().method() === 'GET',
    )
    await page.goto('/app/pedidos')
    await orderListResponse
    await orderDetailResponse

    await page.goto('/')
    await page.goto('/app/pedidos')
    const seededOrderLink = page.locator(`main a[href="${orderPath}"]`)
    await expect(seededOrderLink).toBeVisible()
    await seededOrderLink.click()
    await expect(page).toHaveURL(orderPath)
    await page.getByRole('tab', { name: 'Produtos' }).click()
    const itemCount = page.getByText(/^\d+ itens$/)
    await expect(itemCount).toHaveText('1 itens')
    await expect(
        page.getByRole('button').filter({ hasText: testProductDescription }).first(),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
    await expect(page).toHaveURL(/\/app\/pedidos$/)

    const clientListResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/clientes'
        && response.request().method() === 'GET',
    )
    await page.goto('/app/clientes')
    await clientListResponse
    await page.goto('/')
    await page.goto('/app/clientes')

    const testClientLink = page.locator(`main a[href="/app/clientes/${testClientId}"]`)
    await expect(testClientLink).toBeVisible()
    await testClientLink.click()
    await expect(page).toHaveURL(`/app/clientes/${testClientId}`)
    await page.getByRole('tab', { name: 'Endereços' }).click()
    const addressesSection = page.locator('section').filter({
        has: page.getByRole('heading', { name: 'Endereços', exact: true }),
    })
    await expect(
        addressesSection.getByRole('button').filter({ hasText: /·/ }).first(),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
    await expect(page).toHaveURL(/\/app\/clientes$/)

    await page.goto('/app/pedidos/novo')
    await page.getByRole('tab', { name: 'Produtos' }).click()
    await page.getByRole('button', { name: 'Adicionar Produto' }).last().click()

    const productDialog = page.getByRole('dialog', { name: 'Adicionar produto' })
    const productSearch = productDialog.getByRole('textbox', {
        name: 'Buscar produto por código ou descrição...',
    })
    await productSearch.fill(testProductDescription)
    const cachedProduct = productDialog
        .getByRole('button')
        .filter({ hasText: testProductDescription })
        .first()
    await expect(cachedProduct).toBeVisible()
    await productDialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
    await expect(page).toHaveURL(/\/app\/clientes$/)

    await context.setOffline(true)
    await page.getByRole('navigation', { name: 'Abrir navegação' })
        .getByRole('link', { name: 'Pedidos', exact: true })
        .click()
    await expect(page).toHaveURL(/\/app\/pedidos$/)

    await page.locator(`main a[href="${orderPath}"]`).click()
    await expect(page).toHaveURL(orderPath)
    await page.getByRole('tab', { name: 'Produtos' }).click()
    await expect(itemCount).toHaveText('1 itens')
    await expect(
        page.getByRole('button').filter({ hasText: testProductDescription }).first(),
    ).toBeVisible()

    await page.getByRole('navigation', { name: 'Abrir navegação' })
        .getByRole('link', { name: 'Pedidos', exact: true })
        .click()
    await expect(page).toHaveURL(/\/app\/pedidos$/)
    await expect(page.locator(`main a[href="${orderPath}"]`)).toBeVisible()
    const orderCards = page.getByRole('main').locator('a[href^="/app/pedidos/"]')
    const ordersBeforeCreate = await orderCards.count()
    const pendingBeforeCreate = await page.getByRole('main')
        .getByRole('status')
        .filter({ hasText: 'Pendente' })
        .count()

    await page.getByRole('button', { name: 'Novo Pedido', exact: true }).click()
    await expect(page).toHaveURL(/\/app\/pedidos\/novo$/)

    await page.getByLabel('Cliente').click()
    const customerSearch = page.getByRole('searchbox', {
        name: 'Buscar cliente por nome, razão social, fantasia ou código...',
    })
    await customerSearch.fill(testCustomerName)
    await page.getByRole('option', { name: testCustomerName, exact: true }).click()

    await page.getByRole('tab', { name: 'Produtos' }).click()
    await page.getByRole('button', { name: 'Adicionar Produto' }).last().click()
    const offlineProductDialog = page.getByRole('dialog', { name: 'Adicionar produto' })
    await offlineProductDialog.getByRole('textbox', {
        name: 'Buscar produto por código ou descrição...',
    }).fill(testProductDescription)
    const offlineProduct = offlineProductDialog
        .getByRole('button')
        .filter({ hasText: testProductDescription })
        .first()
    await expect(offlineProduct).toBeVisible()
    await offlineProduct.click()
    await offlineProductDialog.getByRole('button', {
        name: 'Adicionar Produto',
        exact: true,
    }).click()
    await expect(page.getByText('1 itens', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await expect(page).toHaveURL(/\/app\/pedidos$/)
    await expect(orderCards).toHaveCount(ordersBeforeCreate + 1)
    await expect(
        page.getByRole('main').getByRole('link').filter({ hasText: 'Pendente' }).last(),
    ).toBeVisible()
    await expect(
        page.getByRole('main').getByRole('status').filter({ hasText: 'Pendente' }),
    ).toHaveCount(pendingBeforeCreate + 1)

    const syncCreateResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/pedidos'
        && response.request().method() === 'POST',
    )
    await context.setOffline(false)
    const createdOrderResponse = await syncCreateResponse
    expect(
        createdOrderResponse.ok(),
        `A sincronização do pedido falhou (HTTP ${createdOrderResponse.status()}): ${await createdOrderResponse.text()}`,
    ).toBeTruthy()
    syncedOrderId = await responseId(createdOrderResponse)
    await page.waitForTimeout(1000)

    await page.getByRole('navigation', { name: 'Abrir navegação' })
        .getByRole('link', { name: 'Clientes', exact: true })
        .click()
    await expect(page).toHaveURL(/\/app\/clientes$/)
    await page.getByRole('navigation', { name: 'Abrir navegação' })
        .getByRole('link', { name: 'Pedidos', exact: true })
        .click()
    await expect(page).toHaveURL(/\/app\/pedidos$/)
    await expect(page.getByRole('main').locator('a[href^="/app/pedidos/"]'))
        .toHaveCount(ordersBeforeCreate + 1)
    await expect(
        page.getByRole('main').getByRole('status').filter({ hasText: 'Pendente' }),
    ).toHaveCount(pendingBeforeCreate)
})
