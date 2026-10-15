import { expect, test } from './fixtures'

test('Bar do Zé mostra títulos e totais sem erros no console', async ({ page, loginTenant4 }) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await loginTenant4()
  await page.goto('/app/clientes')

  const clientLink = page.getByRole('main').getByRole('link', { name: /Bar do Zé/i }).first()
  await expect(clientLink).toBeVisible()
  await clientLink.click()
  await expect(page).toHaveURL(/\/app\/clientes\/\d+/)

  await page.getByRole('tab', { name: 'Títulos' }).click()
  const titleRows = page.getByRole('table').getByRole('row')
  await expect(titleRows.nth(1)).toBeVisible()
  await expect(page.getByText('Total a vencer')).toBeVisible()
  await expect(page.getByText('Total vencido')).toBeVisible()
  await expect(page.getByText('Total em aberto')).toBeVisible()
  expect(browserErrors).toEqual([])
})
