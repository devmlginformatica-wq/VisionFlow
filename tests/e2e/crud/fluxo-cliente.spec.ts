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
    throw new Error('A resposta da API não contém o ID numérico do cliente.')
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

test.describe('CRUD de cliente', () => {
  let clienteId: number | null = null

  test.afterEach(async ({ page }) => {
    if (clienteId !== null) {
      const token = await getAuthToken(page)
      if (!token) throw new Error('Token de autenticação ausente durante a limpeza do cliente.')

      const response = await page.request.delete(`/clientes/${clienteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await expect(response).toBeOK()
      clienteId = null
    }
  })

  test('cria, lê, edita e deleta', async ({ page, loginTenant4 }) => {
    await loginTenant4()
    const nome = `[E2E] Cliente ${Date.now()}`
    const nomeEditado = `${nome} editado`

    await test.step('CREATE', async () => {
      await page.goto('/app/clientes/novo')
      await page.getByLabel('Nome / Razão Social').fill(nome)
      await page.getByLabel('Tel. Comercial').fill('11999990000')

      const createResponsePromise = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/clientes' &&
        response.request().method() === 'POST',
      )
      await page.getByRole('button', { name: 'Salvar', exact: true }).click()
      const createResponse = await createResponsePromise
      await assertResponseSucceeded(createResponse)
      clienteId = await getResponseId(createResponse)
      await expect(page).toHaveURL(/\/app\/clientes(?:\?.*)?$/)
    })

    await test.step('READ', async () => {
      await page.getByLabel('Pesquisar Cliente...').fill(nome)
      await expect(page.getByRole('link', { name: nome })).toBeVisible()
    })

    await test.step('UPDATE', async () => {
      await page.getByRole('link', { name: nome }).click()
      await expect(page).toHaveURL(new RegExp(`/app/clientes/${clienteId}(?:\\?.*)?$`))
      await page.getByLabel('Nome / Razão Social').fill(nomeEditado)

      const updateResponsePromise = page.waitForResponse((response) =>
        new URL(response.url()).pathname === `/clientes/${clienteId}` &&
        response.request().method() === 'PUT',
      )
      await page.getByRole('button', { name: 'Salvar', exact: true }).click()
      const updateResponse = await updateResponsePromise
      await assertResponseSucceeded(updateResponse)
      await expect(page).toHaveURL(/\/app\/clientes(?:\?.*)?$/)
      await page.getByLabel('Pesquisar Cliente...').fill(nomeEditado)
      await expect(page.getByRole('link', { name: nomeEditado })).toBeVisible()
    })

    await test.step('DELETE', async () => {
      const token = await getAuthToken(page)
      if (!token || clienteId === null) {
        throw new Error('Não foi possível obter o token ou ID do cliente para exclusão.')
      }

      const deleteResponse = await page.request.delete(`/clientes/${clienteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await expect(deleteResponse).toBeOK()
      clienteId = null

      await page.goto('/app/clientes')
      await page.getByLabel('Pesquisar Cliente...').fill(nomeEditado)
      await expect(page.getByRole('link', { name: nomeEditado })).toHaveCount(0)
      await expect(page.getByText('Nenhum cliente encontrado')).toBeVisible()
    })
  })
})
