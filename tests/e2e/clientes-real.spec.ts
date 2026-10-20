import { expect, test } from './fixtures'
import type { Locator } from '@playwright/test'
import {
    createClientViaApi,
    createUniqueAddressNumber,
    createUniqueName,
    createValidCPF,
    createValidCNPJ,
    deleteAddressViaApi,
    getAuthHeaders,
    isRecord,
    responseData,
    responseErrorCode,
    responseId,
} from './real-api-helpers'

async function selectLastAvailableOption(select: Locator, fieldName: string): Promise<number> {
    await expect(select).toBeEnabled()
    const value = await select.locator('option').evaluateAll((options) => {
        const values = options
            .map((option) => option.getAttribute('value'))
            .filter((optionValue): optionValue is string => optionValue !== null && Number(optionValue) > 0)
        return values[values.length - 1] ?? null
    })
    if (value === null) {
        test.skip(true, `Catálogo ${fieldName} vazio no ambiente.`)
        return 0
    }
    await select.selectOption(value)
    return Number(value)
}

test.describe('Clientes com API real', () => {
    let clientIds: number[] = []
    let addressId: number | null = null
    let addressOwnerId: number | null = null

    test.beforeEach(async ({ loginTenant4 }) => {
        clientIds = []
        addressId = null
        addressOwnerId = null
        await loginTenant4()
    })

    test.afterEach(async ({ page }) => {
        if (addressId === null && clientIds.length === 0) return
        const headers = await getAuthHeaders(page)
        if (addressId !== null && addressOwnerId !== null) {
            await deleteAddressViaApi(page, addressOwnerId, addressId)
            addressId = null
            addressOwnerId = null
        }
        for (const clientId of clientIds.splice(0)) {
            const response = await page.request.delete(`/clientes/${clientId}`, { headers })
            expect(response.ok()).toBeTruthy()
        }
    })

    test('lista clientes reais e busca por nome, CPF e CNPJ', async ({ page }) => {
        const corporateName = createUniqueName('Busca CNPJ')
        const individualName = createUniqueName('Busca CPF')
        const cnpj = createValidCNPJ()
        const cpf = createValidCPF()
        clientIds.push(await createClientViaApi(page, corporateName, 'PJ', cnpj))
        clientIds.push(await createClientViaApi(page, individualName, 'PF', cpf))

        const listResponsePromise = page.waitForResponse((response) =>
            new URL(response.url()).pathname === '/clientes' &&
            response.request().method() === 'GET',
        )
        await page.goto('/app/clientes')
        const listResponse = await listResponsePromise
        expect(listResponse.ok()).toBeTruthy()
        const data = await responseData(listResponse)
        expect(isRecord(data) && Array.isArray(data.items)).toBeTruthy()

        const search = page.getByRole('textbox', { name: 'Pesquisar Cliente...' })
        await search.fill(corporateName)
        await expect(page.getByRole('link').filter({ hasText: corporateName }).first()).toBeVisible()

        await search.fill(cpf)
        await expect(page.getByRole('link').filter({ hasText: individualName }).first()).toBeVisible()

        await search.fill(cnpj)
        await expect(page.getByRole('link').filter({ hasText: corporateName }).first()).toBeVisible()
    })

    test('cria, edita, persiste e remove um cliente e seu endereço real', async ({ page }) => {
        const originalName = createUniqueName('CRUD cliente')
        const editedName = `${originalName} editado`

        await page.goto('/app/clientes/novo')
        await page.getByLabel('Nome / Razão Social').fill(originalName)
        await page.getByLabel('Tel. Comercial').fill('11999990000')

        const createResponsePromise = page.waitForResponse((response) =>
            new URL(response.url()).pathname === '/clientes' &&
            response.request().method() === 'POST',
        )
        await page.getByRole('button', { name: 'Salvar', exact: true }).click()
        const createResponse = await createResponsePromise
        expect(createResponse.status()).toBe(201)
        const clientId = await responseId(createResponse)
        clientIds.push(clientId)
        await expect(page).toHaveURL(/\/app\/clientes(?:\?.*)?$/)

        const search = page.getByRole('textbox', { name: 'Pesquisar Cliente...' })
        await search.fill(originalName)
        await page.getByRole('link').filter({ hasText: originalName }).first().click()
        await expect(page).toHaveURL(new RegExp(`/app/clientes/${clientId}(?:\\?.*)?$`))
        await page.getByLabel('Nome / Razão Social').fill(editedName)

        const updateResponsePromise = page.waitForResponse((response) =>
            new URL(response.url()).pathname === `/clientes/${clientId}` &&
            response.request().method() === 'PUT',
        )
        await page.getByRole('button', { name: 'Salvar', exact: true }).click()
        const updateResponse = await updateResponsePromise
        expect(updateResponse.ok()).toBeTruthy()
        await expect(page).toHaveURL(/\/app\/clientes(?:\?.*)?$/)

        await search.fill(editedName)
        await page.getByRole('link').filter({ hasText: editedName }).first().click()
        await page.getByRole('tab', { name: 'Endereços' }).click()
        await page.getByRole('button', { name: 'Adicionar Endereço' }).click()

        const addressDialog = page.getByRole('dialog', { name: 'Cadastro de Endereço' })
        const addressStreet = createUniqueName('Rua')
        const addressNumber = createUniqueAddressNumber()
        await addressDialog.getByRole('textbox', { name: /^CEP/ }).fill(`${Math.floor(Math.random() * 90000000) + 10000000}`)
        await addressDialog.getByRole('textbox', { name: /^Logradouro/ }).fill(addressStreet)
        await addressDialog.getByRole('textbox', { name: /^Número/ }).fill(addressNumber)
        await addressDialog.getByRole('textbox', { name: /^Bairro/ }).fill(createUniqueName('Bairro'))
        await addressDialog.getByRole('textbox', { name: /^Cidade/ }).fill(createUniqueName('Cidade'))
        await addressDialog.getByLabel(/^Estado/).fill('SP')

        const addressCreatePromise = page.waitForResponse((response) =>
            new URL(response.url()).pathname === `/clientes/${clientId}/enderecos` &&
            response.request().method() === 'POST',
        )
        await addressDialog.getByRole('button', { name: 'Salvar', exact: true }).click()
        const addressCreateResponse = await addressCreatePromise
        expect(addressCreateResponse.status()).toBe(201)
        addressId = await responseId(addressCreateResponse)
        addressOwnerId = clientId
        await expect(addressDialog).toBeHidden()
        await expect(page).toHaveURL(new RegExp(`/app/clientes/${clientId}(?:\\?.*)?$`))
        await page.reload()
        await page.getByRole('tab', { name: 'Endereços' }).click()
        const addressCard = page.getByRole('button').filter({ hasText: `${addressStreet}, ${addressNumber}` })
        await expect(addressCard).toBeVisible()

        await addressCard.click()
        const editAddressDialog = page.getByRole('dialog', { name: 'Cadastro de Endereço' })
        const editedAddressNumber = createUniqueAddressNumber()
        await editAddressDialog.getByRole('textbox', { name: /^Número/ }).fill(editedAddressNumber)
        await editAddressDialog.getByLabel('Complemento', { exact: true }).fill('')
        await editAddressDialog.getByLabel('Ponto de referência', { exact: true }).fill('')
        await editAddressDialog.getByLabel('Restrições de entrega', { exact: true }).fill('')
        const addressUpdatePromise = page.waitForResponse((response) =>
            new URL(response.url()).pathname === `/clientes/${clientId}/enderecos/${addressId}` &&
            response.request().method() === 'PUT',
        )
        await editAddressDialog.getByRole('button', { name: 'Salvar', exact: true }).click()
        const addressUpdateResponse = await addressUpdatePromise
        expect(addressUpdateResponse.ok()).toBeTruthy()
        await expect(editAddressDialog).toBeHidden()
        await expect(page).toHaveURL(new RegExp(`/app/clientes/${clientId}(?:\\?.*)?$`))
        await page.reload()
        await page.getByRole('tab', { name: 'Endereços' }).click()
        await expect(page.getByRole('button').filter({ hasText: `${addressStreet}, ${editedAddressNumber}` })).toBeVisible()
        const addressesResponse = await page.request.get(`/clientes/${clientId}/enderecos`, {
            headers: await getAuthHeaders(page),
        })
        expect(addressesResponse.ok()).toBeTruthy()
        const addresses = await responseData(addressesResponse)
        expect(Array.isArray(addresses)).toBeTruthy()
        expect(
            Array.isArray(addresses) &&
            addresses.some((address) => isRecord(address) && address.id === addressId && address.numero_endereco === editedAddressNumber),
        ).toBeTruthy()

        const addressDeletePromise = page.waitForResponse((response) =>
            new URL(response.url()).pathname === `/clientes/${clientId}/enderecos/${addressId}` &&
            response.request().method() === 'DELETE',
        )
        await page.getByRole('button', { name: 'Excluir endereço' }).click()
        const addressDeleteResponse = await addressDeletePromise
        expect(addressDeleteResponse.ok()).toBeTruthy()
        const deletedAddressId = addressId
        addressId = null
        addressOwnerId = null
        const addressesAfterDeleteResponse = await page.request.get(`/clientes/${clientId}/enderecos`, {
            headers: await getAuthHeaders(page),
        })
        expect(addressesAfterDeleteResponse.ok()).toBeTruthy()
        const addressesAfterDelete = await responseData(addressesAfterDeleteResponse)
        expect(
            Array.isArray(addressesAfterDelete) &&
            !addressesAfterDelete.some((address) => isRecord(address) && address.id === deletedAddressId),
        ).toBeTruthy()
        await expect(page.getByText('Nenhum endereço cadastrado.')).toBeVisible()

        await page.getByRole('button', { name: 'Ações do cliente' }).click()
        const clientDeletePromise = page.waitForResponse((response) =>
            new URL(response.url()).pathname === `/clientes/${clientId}` &&
            response.request().method() === 'DELETE',
        )
        await page.getByRole('button', { name: 'Excluir cliente' }).click()
        const clientDeleteResponse = await clientDeletePromise
        expect(clientDeleteResponse.ok()).toBeTruthy()
        clientIds.splice(clientIds.indexOf(clientId), 1)

        await expect(page).toHaveURL(/\/app\/clientes(?:\?.*)?$/)
        await page.getByRole('textbox', { name: 'Pesquisar Cliente...' }).fill(editedName)
        await expect(page.getByRole('link').filter({ hasText: editedName })).toHaveCount(0)
    })

    test('persiste padrões comerciais e última visita pela aba Padrões', async ({ page }) => {
        const clientId = await createClientViaApi(page, createUniqueName('Padrões persistidos'))
        clientIds.push(clientId)

        await page.goto(`/app/clientes/${clientId}`)
        await page.getByRole('tab', { name: 'Padrões' }).click()

        const carrierId = await selectLastAvailableOption(
            page.getByLabel('Transportadora (padrão)'),
            'transportadora padrão',
        )
        const paymentConditionId = await selectLastAvailableOption(
            page.getByLabel('Condição pgto (padrão)'),
            'condição de pagamento padrão',
        )
        const paymentMethodId = await selectLastAvailableOption(
            page.getByLabel('Forma pgto (padrão)'),
            'forma de pagamento padrão',
        )
        const priceTableId = await selectLastAvailableOption(
            page.getByLabel('Tabela preço (padrão)'),
            'tabela de preço padrão',
        )
        const lastVisit = new Date(
            Date.now() - (Math.floor(Math.random() * 3650) + 1) * 24 * 60 * 60 * 1000,
        ).toISOString().slice(0, 10)
        await page.getByLabel('Dt. Última Visita').fill(lastVisit)

        const updateResponsePromise = page.waitForResponse((response) =>
            new URL(response.url()).pathname === `/clientes/${clientId}` &&
            response.request().method() === 'PUT',
        )
        await page.getByRole('button', { name: 'Salvar', exact: true }).click()
        const updateResponse = await updateResponsePromise
        expect(updateResponse.ok()).toBeTruthy()
        await expect(page).toHaveURL(/\/app\/clientes(?:\?.*)?$/)

        await page.goto(`/app/clientes/${clientId}`)
        await page.reload()
        await page.getByRole('tab', { name: 'Padrões' }).click()
        await expect(page.getByLabel('Transportadora (padrão)')).toHaveValue(String(carrierId))
        await expect(page.getByLabel('Condição pgto (padrão)')).toHaveValue(String(paymentConditionId))
        await expect(page.getByLabel('Forma pgto (padrão)')).toHaveValue(String(paymentMethodId))
        await expect(page.getByLabel('Tabela preço (padrão)')).toHaveValue(String(priceTableId))
        await expect(page.getByLabel('Dt. Última Visita')).toHaveValue(lastVisit)

        const persistedResponse = await page.request.get(`/clientes/${clientId}`, {
            headers: await getAuthHeaders(page),
        })
        expect(persistedResponse.ok()).toBeTruthy()
        const persistedClient = await responseData(persistedResponse)
        expect(isRecord(persistedClient)).toBeTruthy()
        if (!isRecord(persistedClient)) {
            throw new Error('A resposta real do cliente não tem o formato esperado.')
        }
        expect(persistedClient.transportadora_padrao_id).toBe(carrierId)
        expect(persistedClient.condicao_pagamento_padrao_id).toBe(paymentConditionId)
        expect(persistedClient.forma_pagamento_padrao_id).toBe(paymentMethodId)
        expect(persistedClient.tabela_preco_padrao_id).toBe(priceTableId)
        expect(persistedClient.data_ultima_visita).toBe(lastVisit)
    })

    test('recebe do backend os erros reais para documento inválido e campos obrigatórios vazios', async ({ page }) => {
        const headers = await getAuthHeaders(page)
        for (const invalidDocument of [
            { personType: 'PF', taxId: '1234567890' },
            { personType: 'PJ', taxId: '1234567890123' },
        ]) {
            const invalidTaxIdResponse = await page.request.post('/clientes', {
                headers,
                data: {
                    nome_razao_social: createUniqueName('Documento inválido'),
                    tipo_pessoa: invalidDocument.personType,
                    cnpj_cpf: invalidDocument.taxId,
                },
            })
            expect(invalidTaxIdResponse.status()).toBe(400)
            expect(await responseErrorCode(invalidTaxIdResponse)).toBe('REQUISICAO_INVALIDA')
        }

        const missingRequiredFieldsResponse = await page.request.post('/clientes', {
            headers,
            data: { nome_razao_social: '', tipo_pessoa: 'PJ' },
        })
        expect(missingRequiredFieldsResponse.status()).toBe(400)
        expect(await responseErrorCode(missingRequiredFieldsResponse)).toBe('REQUISICAO_INVALIDA')
    })
})
