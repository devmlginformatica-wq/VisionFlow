import { expect, test } from './fixtures'

test('[NAV-01] alterna entre Clientes, Pedidos e Orçamentos', async ({ page, loginTenant4 }) => {
  await loginTenant4()

  const navigation = page.getByRole('navigation', { name: 'Abrir navegação' })

  await navigation.getByRole('link', { name: 'Clientes', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/clientes$/)
  await expect(page.getByRole('heading', { name: 'Clientes', exact: true })).toBeVisible()

  await navigation.getByRole('link', { name: 'Pedidos', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/pedidos$/)
  await expect(page.getByRole('heading', { name: 'Pedidos', exact: true })).toBeVisible()

  await navigation.getByRole('link', { name: 'Orçamentos', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/orcamentos$/)
  await expect(page.getByRole('heading', { name: 'Orçamentos', exact: true })).toBeVisible()
})

test('[NAV-03] filtra clientes, volta à lista e mantém a tela legível ao girar', async ({
  page,
  loginTenant4,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await loginTenant4()
  await page.goto('/app/clientes')

  const search = page.getByRole('textbox', { name: 'Pesquisar Cliente...' })
  await search.fill(`cliente inexistente ${Date.now()}`)
  await expect(page.getByText('Nenhum cliente encontrado')).toBeVisible()
  await search.fill('')
  await expect(search).toHaveValue('')

  await page.getByRole('button', { name: 'Abrir navegação' }).click()
  const navigation = page.getByRole('navigation', { name: 'Abrir navegação' })
  await navigation.getByRole('link', { name: 'Pedidos', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/pedidos$/)
  await expect(page.getByRole('heading', { name: 'Pedidos', exact: true })).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/\/app\/clientes$/)
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(page.getByRole('heading', { name: 'Clientes', exact: true })).toBeVisible()
  await expect(search).toBeVisible()
})
