import { expect, test } from './fixtures'

test('login válido do tenant 4 redireciona para a Home', async ({ page, loginTenant4 }) => {
  await loginTenant4()

  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: /olá,/i })).toBeVisible()
})

test('login inválido mostra erro', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/^e-mail$/i).fill('joao.silva@saajoao.com.br')
  await page.getByLabel(/^senha$/i).fill('senha-incorreta')
  await page.getByRole('button', { name: /^entrar$/i }).click()

  await expect(page.getByRole('alert')).toContainText(/incorret|credencial|não foi possível/i)
})

test('e-mail vazio mostra validação', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/^senha$/i).fill('123456')
  await page.getByRole('button', { name: /^entrar$/i }).click()

  await expect(page.getByRole('alert')).toContainText('Informe um e-mail válido.')
})

test('logout retorna para a tela de login', async ({ page, loginTenant4 }) => {
  await loginTenant4()
  await page.getByRole('link', { name: /^sair$/i }).last().click()

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByLabel(/^e-mail$/i)).toBeVisible()
})
