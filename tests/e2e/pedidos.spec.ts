import { expect, test } from './fixtures'

test('abrir o primeiro pedido mostra cliente, item e total sem 404', async ({ page, loginTenant4 }) => {
  const notFoundResponses: string[] = []
  const browserErrors: string[] = []
  page.on('response', (response) => {
    if (response.status() === 404) notFoundResponses.push(response.url())
  })
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await loginTenant4()
  await page.goto('/app/pedidos')
  await expect(page.getByRole('heading', { name: 'Pedidos' })).toBeVisible()

  const firstOrder = page.getByRole('main').getByRole('link', { name: /PED\d+/i }).first()
  await expect(firstOrder).toBeVisible()
  await firstOrder.click()

  await expect(page).toHaveURL(/\/app\/pedidos\/\d+/)
  await expect(page.getByRole('heading', { name: /Pedido PED\d+/i })).toBeVisible()
  await expect(page.getByLabel('Cliente')).not.toHaveText('Selecione')

  await page.getByRole('tab', { name: 'Produtos' }).click()
  await expect(page.getByText(/^\d+ itens$/)).toBeVisible()
  await expect(page.getByRole('button').filter({ hasText: /R\$\s?[\d.]+,\d{2}/ }).first()).toBeVisible()

  await page.getByRole('tab', { name: 'Finalização' }).click()
  const currencyAmounts = page.getByText(/^R\$\s?[\d.]+,\d{2}$/)
  await expect(currencyAmounts.last()).toBeVisible()
  const totalText = await currencyAmounts.last().textContent()
  const total = Number(totalText?.replace(/[^\d,]/g, '').replace(',', '.'))
  expect(Number.isFinite(total)).toBe(true)
  expect(total).toBeGreaterThan(0)
  expect(notFoundResponses).toEqual([])
  expect(browserErrors).toEqual([])
})
