import { expect, test } from './fixtures'

test('lista carrega ao menos um cliente', async ({ page, loginTenant4 }) => {
  await loginTenant4()
  await page.goto('/app/clientes')

  await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible()
  await expect(page.getByRole('main').getByRole('link').first()).toBeVisible()
})

test('abrir um cliente mostra editor e aba Títulos', async ({ page, loginTenant4 }) => {
  await loginTenant4()
  await page.goto('/app/clientes')

  await page.getByRole('main').getByRole('link').first().click()

  await expect(page).toHaveURL(/\/app\/clientes\/\d+/)
  await expect(page.getByRole('heading', { name: 'Cadastro de Cliente' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Títulos' })).toBeVisible()
})
