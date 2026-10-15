import { test as base } from '@playwright/test'

interface Fixtures {
  loginComo: (email: string, senha: string) => Promise<void>
  loginTenant4: () => Promise<void>
  loginAdmin: () => Promise<void>
}

export const test = base.extend<Fixtures>({
  loginComo: async ({ page }, use) => {
    await use(async (email, senha) => {
      await page.goto('/login')
      await page.getByLabel(/^e-mail$/i).fill(email)
      await page.getByLabel(/^senha$/i).fill(senha)
      await page.getByRole('button', { name: /^entrar$/i }).click()
      await page.waitForURL((url) => url.pathname === '/', { timeout: 15000 })
    })
  },
  loginTenant4: async ({ loginComo }, use) => {
    await use(async () => {
      await loginComo('joao.silva@saajoao.com.br', '123456')
    })
  },
  loginAdmin: async ({ loginComo }, use) => {
    await use(async () => {
      await loginComo('admin@epare.com.br', '123456')
    })
  },
})

export { expect } from '@playwright/test'
