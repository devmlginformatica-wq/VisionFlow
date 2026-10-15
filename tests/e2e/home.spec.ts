import { expect, test } from './fixtures'

test('Home carrega indicadores sem erros no console', async ({ page, loginTenant4 }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))

  await loginTenant4()

  await expect(page.getByRole('heading', { name: /olá,/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Indicadores' })).toBeVisible()
  await expect(page.getByText(/Suas vendas no mês \(R\$\)/i)).toBeVisible()
  await expect(page.getByText(/R\$\s?[\d.,]+/).first()).toBeVisible()
  await expect.poll(() => consoleErrors).toEqual([])
})
