import { expect, test } from './fixtures'
import {
    createAddressViaApi,
    createClientViaApi,
    createUniqueName,
    deleteAddressViaApi,
    formatBRL,
    getAuthHeaders,
    isRecord,
    listRealProducts,
    responseData,
    responseErrorCode,
    responseId,
} from './real-api-helpers'

test.describe('Pedidos com API real', () => {
    let clientIds: number[] = []
    let orderIds: number[] = []
    let addressIds: Array<{ clientId: number; addressId: number }> = []

    test.beforeEach(async ({ loginTenant4 }) => {
        clientIds = []
        orderIds = []
        addressIds = []
        await loginTenant4()
    })

    test.afterEach(async ({ page }) => {
        if (orderIds.length === 0 && addressIds.length === 0 && clientIds.length === 0) return
        const headers = await getAuthHeaders(page)
        for (const orderId of orderIds.splice(0)) {
            const response = await page.request.delete(`/pedidos/${orderId}`, { headers })
            expect(response.ok()).toBeTruthy()
        }
        for (const { clientId, addressId } of addressIds.splice(0)) {
            await deleteAddressViaApi(page, clientId, addressId)
        }
        for (const clientId of clientIds.splice(0)) {
            const response = await page.request.delete(`/clientes/${clientId}`, { headers })
            expect(response.ok()).toBeTruthy()
        }
    })

    test('cria pedido com cliente e produto reais, recalcula item e persiste a finalização', async ({ page }) => {
        const customerName = createUniqueName('Cliente do pedido')
        const customerId = await createClientViaApi(page, customerName)
        clientIds.push(customerId)
        const addressId = await createAddressViaApi(page, customerId)
        addressIds.push({ clientId: customerId, addressId })

        const product = (await listRealProducts(page)).find((item) =>
            item.price > 0 && (item.stock >= 2 || item.allowsOutOfStockSale),
        )
        if (!product) {
            throw new Error('O catálogo real não tem produto com preço e estoque suficientes para este fluxo.')
        }

        await page.goto('/app/pedidos/novo')
        await page.getByLabel('Cliente').click()
        const customerSearch = page.getByRole('searchbox', {
            name: 'Buscar cliente por nome, razão social, fantasia ou código...',
        })
        await customerSearch.fill(customerName)
        await page.getByRole('option', { name: customerName, exact: true }).click()
        await page.getByRole('tab', { name: 'Produtos' }).click()
        await page.getByRole('button', { name: 'Adicionar Produto' }).last().click()

        const productDialog = page.getByRole('dialog', { name: 'Adicionar produto' })
        const productSearch = productDialog.getByRole('textbox', {
            name: 'Buscar produto por código ou descrição...',
        })
        await productSearch.fill(product.description)
        const productOption = productDialog.getByRole('button').filter({ hasText: product.description }).first()
        await expect(productOption).toBeVisible()
        await productOption.click()
        await productDialog.getByRole('button', { name: 'Adicionar Produto', exact: true }).click()
        await expect(page.getByText('1 itens')).toBeVisible()

        await page.getByRole('tab', { name: 'Finalização' }).click()
        await expect(page.getByTestId('pedido-total-gross-total')).toHaveText(formatBRL(product.price))
        await expect(page.getByTestId('pedido-total-net-total')).toHaveText(formatBRL(product.price))

        const createOrderResponsePromise = page.waitForResponse((response) =>
            new URL(response.url()).pathname === '/pedidos' &&
            response.request().method() === 'POST',
        )
        await page.getByRole('button', { name: 'Salvar', exact: true }).click()
        const createOrderResponse = await createOrderResponsePromise
        expect(createOrderResponse.status()).toBe(201)
        const orderId = await responseId(createOrderResponse)
        orderIds.push(orderId)

        const createdOrder = await responseData(createOrderResponse)
        expect(isRecord(createdOrder) && createdOrder.status).toBe('em_digitacao')
        await expect(page).toHaveURL(/\/app\/pedidos(?:\?.*)?$/)

        const orderSearch = page.getByRole('textbox', {
            name: 'Pesquisar por número, cliente ou data...',
        })
        await orderSearch.fill(customerName)
        const orderCard = page.getByRole('link').filter({ hasText: customerName }).first()
        await expect(orderCard).toBeVisible()
        await orderCard.click()
        await expect(page).toHaveURL(new RegExp(`/app/pedidos/${orderId}(?:\\?.*)?$`))

        await page.getByRole('tab', { name: 'Produtos' }).click()
        const productRow = page.getByRole('button').filter({ hasText: product.description }).first()
        await productRow.click()
        const editDialog = page.getByRole('dialog', { name: 'Editar item do pedido' })
        await editDialog.getByLabel('Qtde').fill('2')
        await editDialog.getByLabel('Desconto').fill('1.00')
        const priceTableSelect = editDialog.getByLabel('Tabela de preço')
        const priceTableIds = await priceTableSelect.locator('option').evaluateAll((options) =>
            options
                .map((option) => option.getAttribute('value'))
                .filter((value): value is string => value !== null && Number(value) > 0),
        )
        test.skip(priceTableIds.length === 0, 'Catálogo tabela de preço vazio no ambiente.')
        if (priceTableIds.length === 0) return
        await priceTableSelect.selectOption(priceTableIds[0])
        await editDialog.getByRole('button', { name: 'Salvar', exact: true }).click()
        await expect(editDialog).toBeHidden()

        const expectedNetTotal = Math.round((product.price * 2 - 1) * 100) / 100
        await page.getByRole('tab', { name: 'Finalização' }).click()
        await expect(page.getByTestId('pedido-total-gross-total')).toHaveText(formatBRL(product.price * 2))
        await expect(page.getByTestId('pedido-total-discount-total')).toHaveText(formatBRL(1))
        await expect(page.getByTestId('pedido-total-net-total')).toHaveText(formatBRL(expectedNetTotal))

        const updateOrderResponsePromise = page.waitForResponse((response) =>
            new URL(response.url()).pathname === `/pedidos/${orderId}` &&
            response.request().method() === 'PUT',
        )
        await page.getByRole('button', { name: 'Finalizar Pedido', exact: true }).click()
        const updateOrderResponse = await updateOrderResponsePromise
        expect(updateOrderResponse.status()).toBe(200)
        const updatedOrder = await responseData(updateOrderResponse)
        expect(isRecord(updatedOrder) && updatedOrder.status).toBe('aguardando_aprovacao')
        await expect(page).toHaveURL(/\/app\/pedidos(?:\?.*)?$/)

        const persistedResponse = await page.request.get(`/pedidos/${orderId}`, {
            headers: await getAuthHeaders(page),
        })
        expect(persistedResponse.ok()).toBeTruthy()
        const persistedOrder = await responseData(persistedResponse)
        expect(isRecord(persistedOrder) && persistedOrder.status).toBe('aguardando_aprovacao')

        const persistedTotals = isRecord(persistedOrder) && isRecord(persistedOrder.totais)
            ? persistedOrder.totais
            : null
        expect(persistedTotals?.valor_liquido).toBeCloseTo(expectedNetTotal, 2)

        await orderSearch.fill(customerName)
        await expect(orderCard).toBeVisible()
        await page.getByRole('button', { name: 'Aguardando aprovação', exact: true }).click()
        await expect(orderCard).toBeVisible()
    })

    test('busca cliente fora da página inicial sem diferenciar caixa ou acentos', async ({ page }) => {
        const clients: Array<{ id: number; name: string }> = []
        for (let index = 0; index < 51; index += 1) {
            const name = createUniqueName(`Cliente Árvore remoto ${index}`)
            const id = await createClientViaApi(page, name)
            clientIds.push(id)
            clients.push({ id, name })
        }

        const firstPageResponse = await page.request.get('/clientes?limit=50', {
            headers: await getAuthHeaders(page),
        })
        expect(firstPageResponse.ok()).toBeTruthy()
        const firstPage = await responseData(firstPageResponse)
        if (!isRecord(firstPage) || !Array.isArray(firstPage.items)) {
            throw new Error('A API real de clientes retornou uma página inválida.')
        }
        const firstPageIds = new Set(firstPage.items.flatMap((item) =>
            isRecord(item) && typeof item.id === 'number' ? [item.id] : [],
        ))
        const target = clients.find((client) => !firstPageIds.has(client.id))
        if (!target) {
            throw new Error('Não foi possível encontrar um cliente criado fora dos primeiros 50 resultados.')
        }

        const accentlessQuery = target.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase('pt-BR')
        await page.goto('/app/pedidos/novo')
        await page.getByLabel('Cliente').click()
        const customerSearch = page.getByRole('searchbox', {
            name: 'Buscar cliente por nome, razão social, fantasia ou código...',
        })
        await customerSearch.fill(accentlessQuery)
        await expect(page.getByRole('option', { name: target.name, exact: true })).toBeVisible()
    })

    test('salva pedido pelo payload atual sem tabela de preço quando o catálogo informa 4,50', async ({ page }) => {
        const customerId = 73
        const productId = 2
        const product = (await listRealProducts(page)).find((item) => item.id === productId)

        expect(product, 'O catálogo real deve incluir o produto 2.').toBeDefined()
        expect(product?.price).toBe(4.5)

        const response = await page.request.post('/pedidos', {
            headers: await getAuthHeaders(page),
            data: {
                cliente_id: customerId,
                tipo: 'pedido',
                status: 'em_digitacao',
                numero_cliente: '',
                data_entrega: null,
                valor_frete: 0,
                condicao_pagamento_id: 2,
                forma_pagamento_id: 2,
                transportadora_id: 1,
                endereco_faturamento_id: null,
                endereco_entrega_id: null,
                endereco_cobranca_id: null,
                observacoes_pedido: '',
                observacoes_nota_fiscal: '',
                itens: [{
                    produto_id: productId,
                    quantidade: 1,
                    preco_venda: 4.5,
                    valor_desconto: 0,
                }],
            },
        })

        expect(response.status(), await response.text()).toBe(201)
        orderIds.push(await responseId(response))
    })

    test('o backend rejeita pedido sem itens e cliente removido com produto real', async ({ page }) => {
        const customerId = await createClientViaApi(page, createUniqueName('Cliente inválido do pedido'))
        clientIds.push(customerId)
        const headers = await getAuthHeaders(page)

        const noItemsResponse = await page.request.post('/pedidos', {
            headers,
            data: { tipo: 'pedido', cliente_id: customerId, itens: [] },
        })
        expect(noItemsResponse.status()).toBe(400)
        expect(await responseErrorCode(noItemsResponse)).toBe('ITENS_OBRIGATORIOS')

        const product = (await listRealProducts(page)).find((item) => item.price > 0)
        if (!product) {
            throw new Error('O catálogo real não tem produto com preço para validar o cliente inexistente.')
        }

        const deleteCustomerResponse = await page.request.delete(`/clientes/${customerId}`, { headers })
        expect(deleteCustomerResponse.ok()).toBeTruthy()
        clientIds.splice(clientIds.indexOf(customerId), 1)

        const invalidCustomerResponse = await page.request.post('/pedidos', {
            headers,
            data: {
                tipo: 'pedido',
                cliente_id: customerId,
                itens: [{
                    produto_id: product.id,
                    quantidade: 1,
                    preco_venda: product.price,
                    valor_desconto: 0,
                }],
            },
        })
        expect(invalidCustomerResponse.status()).toBe(400)
        expect(await responseErrorCode(invalidCustomerResponse)).toBe('CLIENTE_INVALIDO')
    })
})
