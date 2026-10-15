import { test, expect } from '../fixtures'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function assertResponseSucceeded(response: { ok: () => boolean; status: () => number; text: () => Promise<string> }): Promise<void> {
  if (!response.ok()) {
    throw new Error(`Requisição da API falhou com HTTP ${response.status()}: ${await response.text()}`)
  }
}

async function getResponseId(response: { json: () => Promise<unknown> }): Promise<number> {
  const payload = await response.json()
  const entity = isRecord(payload) && isRecord(payload.data) ? payload.data : payload

  if (!isRecord(entity) || typeof entity.id !== 'number') {
    throw new Error('A resposta da API não contém o ID numérico do registro.')
  }

  return entity.id
}

async function getAuthToken(page: import('@playwright/test').Page): Promise<string | null> {
  const raw = await page.evaluate(() => localStorage.getItem('visionflow:auth'))
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error: unknown) {
    throw new Error('Não foi possível ler o estado de autenticação do navegador.', { cause: error })
  }

  if (!isRecord(parsed)) return null
  const state = isRecord(parsed.state) ? parsed.state : parsed
  const user = isRecord(state.user) ? state.user : null
  const token = user?.token ?? state.token
  return typeof token === 'string' ? token : null
}

test.describe.configure({ mode: 'serial' })

test.describe('CRUD de pedido', () => {
  let pedidoId: number | null = null
  let clienteId: number | null = null
  const pedidoIdsCriados: number[] = []

  test.afterEach(async ({ page }) => {
    const token = await getAuthToken(page)
    if ((pedidoId !== null || pedidoIdsCriados.length > 0 || clienteId !== null) && !token) {
      throw new Error('Token de autenticação ausente durante a limpeza dos registros.')
    }

    if (token) {
      for (const id of new Set([pedidoId, ...pedidoIdsCriados].filter((value): value is number => value !== null))) {
        const response = await page.request.delete(`/pedidos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        await expect(response).toBeOK()
      }

      if (clienteId !== null) {
        const response = await page.request.delete(`/clientes/${clienteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        await expect(response).toBeOK()
      }
    }

    pedidoId = null
    pedidoIdsCriados.length = 0
    clienteId = null
  })

  test('cria, lê, edita e deleta', async ({ page, loginTenant4 }) => {
    await loginTenant4()
    const nomeCliente = `[E2E] Cliente do pedido ${Date.now()}`
    const observacaoEditada = '[E2E] editado'

    await test.step('CREATE cliente auxiliar para pesquisa do pedido', async () => {
      await page.goto('/app/clientes/novo')
      await page.getByLabel('Nome / Razão Social').fill(nomeCliente)
      await page.getByLabel('Tel. Comercial').fill('11999990000')

      const createClientResponsePromise = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/clientes' &&
        response.request().method() === 'POST',
      )
      await page.getByRole('button', { name: 'Salvar', exact: true }).click()
      const createClientResponse = await createClientResponsePromise
      await assertResponseSucceeded(createClientResponse)
      clienteId = await getResponseId(createClientResponse)
      await expect(page).toHaveURL(/\/app\/clientes(?:\?.*)?$/)
    })

    await test.step('CREATE', async () => {
      await page.goto('/app/pedidos/novo')
      await page.getByLabel('Cliente').selectOption({ label: nomeCliente })
      await page.getByRole('tab', { name: 'Produtos' }).click()
      await page.getByRole('button', { name: 'Adicionar Produto' }).last().click()

      const productDialog = page.getByRole('dialog')
      const productOptions = productDialog.getByRole('button').filter({ hasText: /\S/ })
      await expect(productOptions.first()).toBeVisible()
      await productOptions.first().click()
      await productDialog.getByRole('button', { name: 'Adicionar Produto' }).click()
      await expect(page.getByText(/^\d+ itens$/)).toHaveText('1 itens')

      const createOrderResponsePromise = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/pedidos' &&
        response.request().method() === 'POST',
      )
      await page.getByRole('button', { name: 'Salvar', exact: true }).click()
      const createOrderResponse = await createOrderResponsePromise
      await assertResponseSucceeded(createOrderResponse)
      pedidoId = await getResponseId(createOrderResponse)
      pedidoIdsCriados.push(pedidoId)
      await expect(page).toHaveURL(/\/app\/pedidos(?:\?.*)?$/)
    })

    await test.step('READ', async () => {
      await page.getByLabel('Pesquisar por número, cliente ou data...').fill('[E2E]')
      await expect(page.getByRole('link', { name: nomeCliente })).toBeVisible()
    })

    await test.step('UPDATE', async () => {
      await page.getByRole('link', { name: nomeCliente }).click()
      await expect(page).toHaveURL(new RegExp(`/app/pedidos/${pedidoId}(?:\\?.*)?$`))
      const customerOrderNumber = `E2E-${Date.now()}`
      const deliveryDate = '2026-11-15'
      const freightAmount = '51,23'
      let deliveryAddressValue = ''
      let collectionAddressValue = ''

      await test.step('Atualiza os campos e verifica persistência após recarregar', async () => {
        await page.getByRole('tab', { name: 'Dados Gerais' }).click()
        await page.getByLabel('Data entrega').fill(deliveryDate)
        await page.getByLabel('Frete').fill(freightAmount)

        const deliveryAddress = page.getByLabel('Endereço entrega')
        const deliveryAddressOptions = await deliveryAddress.locator('option').evaluateAll((options) =>
          options
            .map((option) => option.getAttribute('value'))
            .filter((value): value is string => Boolean(value)),
        )
        if (deliveryAddressOptions.length > 0) {
          deliveryAddressValue = deliveryAddressOptions[0]
          await deliveryAddress.selectOption(deliveryAddressValue)
        }

        const collectionAddress = page.getByLabel('Endereço cobrança')
        const collectionAddressOptions = await collectionAddress.locator('option').evaluateAll((options) =>
          options
            .map((option) => option.getAttribute('value'))
            .filter((value): value is string => Boolean(value)),
        )
        if (collectionAddressOptions.length > 0) {
          collectionAddressValue = collectionAddressOptions[0]
          await collectionAddress.selectOption(collectionAddressValue)
        }

        await page.getByRole('tab', { name: 'Finalização' }).click()
        await page.getByLabel('Nro pedido cliente').fill(customerOrderNumber)
        await page.getByLabel('Observações', { exact: true }).fill(observacaoEditada)

        const updateResponsePromise = page.waitForResponse((response) =>
          new URL(response.url()).pathname === `/pedidos/${pedidoId}` &&
          response.request().method() === 'PUT',
        )
        await page.getByRole('button', { name: 'Salvar', exact: true }).click()
        const updateResponse = await updateResponsePromise
        await assertResponseSucceeded(updateResponse)
        const savedId = await getResponseId(updateResponse)
        if (!pedidoIdsCriados.includes(savedId)) pedidoIdsCriados.push(savedId)
        await expect(page).toHaveURL(/\/app\/pedidos(?:\?.*)?$/)

        await page.goto(`/app/pedidos/${pedidoId}`)
        await page.reload()
        await page.getByRole('tab', { name: 'Dados Gerais' }).click()
        await expect(page.getByLabel('Data entrega')).toHaveValue(deliveryDate)
        await expect(page.getByLabel('Frete')).toHaveValue(freightAmount)
        await expect(page.getByLabel('Endereço entrega')).toHaveValue(deliveryAddressValue)
        await expect(page.getByLabel('Endereço cobrança')).toHaveValue(collectionAddressValue)
        await page.getByRole('tab', { name: 'Finalização' }).click()
        await expect(page.getByLabel('Nro pedido cliente')).toHaveValue(customerOrderNumber)
        await expect(page.getByLabel('Observações', { exact: true })).toHaveValue(observacaoEditada)
      })
    })

    await test.step('DELETE', async () => {
      const token = await getAuthToken(page)
      if (!token || pedidoId === null) {
        throw new Error('Não foi possível obter o token ou ID do pedido para exclusão.')
      }

      const deleteResponse = await page.request.delete(`/pedidos/${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await expect(deleteResponse).toBeOK()
      pedidoIdsCriados.splice(pedidoIdsCriados.indexOf(pedidoId), 1)
      pedidoId = null

      await page.goto('/app/pedidos')
      await page.getByLabel('Pesquisar por número, cliente ou data...').fill('[E2E]')
      await expect(page.getByRole('link', { name: nomeCliente })).toHaveCount(0)
      await expect(page.getByText('Nenhum registro encontrado')).toBeVisible()
    })
  })
})
