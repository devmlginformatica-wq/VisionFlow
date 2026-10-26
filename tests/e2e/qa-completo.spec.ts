import { expect, test } from './fixtures'
import type { APIResponse, Page } from '@playwright/test'
import {
    createAddressViaApi,
    createClientViaApi,
    createUniqueAddressNumber,
    createUniqueName,
    deleteAddressViaApi,
    getAuthHeaders,
    isRecord,
    listRealProducts,
    responseData,
    responseId,
} from './real-api-helpers'

interface TestProduct {
    id: number
    description: string
    price: number
}

interface TestAddress {
    clientId: number
    addressId: number
}

async function assertApiSuccess(response: APIResponse, action: string): Promise<void> {
    if (!response.ok()) {
        throw new Error(`${action} falhou na API (HTTP ${response.status()}): ${await response.text()}`)
    }
}

async function clearDexie(page: Page): Promise<void> {
    await page.evaluate(async () => {
        const request = indexedDB.open('VisionFlowDB')
        await new Promise<void>((resolve, reject) => {
            request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o Dexie.'))
            request.onsuccess = () => {
                const database = request.result
                const stores = Array.from(database.objectStoreNames)
                if (stores.length === 0) {
                    database.close()
                    resolve()
                    return
                }

                const transaction = database.transaction(stores, 'readwrite')
                for (const store of stores) transaction.objectStore(store).clear()
                transaction.oncomplete = () => {
                    database.close()
                    resolve()
                }
                transaction.onerror = () => {
                    database.close()
                    reject(transaction.error ?? new Error('Não foi possível limpar o Dexie.'))
                }
                transaction.onabort = () => {
                    database.close()
                    reject(transaction.error ?? new Error('A limpeza do Dexie foi cancelada.'))
                }
            }
        })
    })
}

async function selectCustomer(page: Page, name: string): Promise<void> {
    await page.getByLabel('Cliente').click()
    const search = page.getByRole('searchbox', {
        name: 'Buscar cliente por nome, razão social, fantasia ou código...',
    })
    await search.fill(name)
    await page.getByRole('option', { name, exact: true }).click()
}

async function addProduct(page: Page, product: TestProduct): Promise<void> {
    await page.getByRole('tab', { name: 'Produtos' }).click()
    await page.getByRole('button', { name: 'Adicionar Produto' }).last().click()

    const dialog = page.getByRole('dialog', { name: 'Adicionar produto' })
    await dialog.getByRole('textbox', {
        name: 'Buscar produto por código ou descrição...',
    }).fill(product.description)
    const productOption = dialog.getByRole('button').filter({ hasText: product.description }).first()
    await expect(productOption).toBeVisible()
    await productOption.click()
    await dialog.getByRole('button', { name: 'Adicionar Produto', exact: true }).click()
    await expect(page.getByText('1 itens', { exact: true })).toBeVisible()
}

async function createDocument(
    page: Page,
    route: '/app/pedidos/novo' | '/app/orcamentos/novo',
    customerName: string,
    product: TestProduct,
): Promise<number> {
    await page.goto(route)
    await selectCustomer(page, customerName)
    await addProduct(page, product)

    const createResponsePromise = page.waitForResponse((response) =>
        new URL(response.url()).pathname === '/pedidos'
        && response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    const response = await createResponsePromise
    await assertApiSuccess(response, 'Criação do pedido/orçamento')
    return responseId(response)
}

async function deleteRecord(page: Page, path: string, action: string): Promise<void> {
    const response = await page.request.delete(path, { headers: await getAuthHeaders(page) })
    if (response.status() === 404) return
    await assertApiSuccess(response, action)
}

async function getIdbStoreCount(page: Page, storeName: string): Promise<number> {
    return page.evaluate(async (name) => {
        const request = indexedDB.open('VisionFlowDB')
        return new Promise<number>((resolve, reject) => {
            request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o Dexie.'))
            request.onsuccess = () => {
                const database = request.result
                if (!database.objectStoreNames.contains(name)) {
                    database.close()
                    reject(new Error(`O armazenamento Dexie "${name}" não existe.`))
                    return
                }
                const transaction = database.transaction(name, 'readonly')
                const countRequest = transaction.objectStore(name).count()
                countRequest.onsuccess = () => resolve(countRequest.result)
                transaction.oncomplete = () => database.close()
                transaction.onerror = () => {
                    database.close()
                    reject(transaction.error ?? new Error(`Não foi possível consultar "${name}".`))
                }
            }
        })
    }, storeName)
}

async function getQueuedActions(page: Page, entity: 'cliente' | 'pedido'): Promise<string[]> {
    return page.evaluate(async (queueEntity) => {
        const request = indexedDB.open('VisionFlowDB')
        return new Promise<string[]>((resolve, reject) => {
            request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o Dexie.'))
            request.onsuccess = () => {
                const database = request.result
                const transaction = database.transaction('sync_queue', 'readonly')
                const recordsRequest = transaction.objectStore('sync_queue').getAll()
                recordsRequest.onsuccess = () => resolve(
                    recordsRequest.result
                        .filter((record) => record.entity === queueEntity)
                        .map((record) => record.action),
                )
                transaction.oncomplete = () => database.close()
                transaction.onerror = () => {
                    database.close()
                    reject(transaction.error ?? new Error('Não foi possível consultar a fila de sincronização.'))
                }
            }
        })
    }, entity)
}

async function removeCachedOrder(page: Page, orderId: number): Promise<void> {
    await page.evaluate(async (id) => {
        const request = indexedDB.open('VisionFlowDB')
        await new Promise<void>((resolve, reject) => {
            request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o Dexie.'))
            request.onsuccess = () => {
                const database = request.result
                const transaction = database.transaction('pedidos', 'readwrite')
                transaction.objectStore('pedidos').delete(id)
                transaction.oncomplete = () => {
                    database.close()
                    resolve()
                }
                transaction.onerror = () => {
                    database.close()
                    reject(transaction.error ?? new Error(`Não foi possível remover o pedido ${id} do Dexie.`))
                }
                transaction.onabort = () => {
                    database.close()
                    reject(transaction.error ?? new Error(`A remoção do pedido ${id} do Dexie foi cancelada.`))
                }
            }
        })
    }, orderId)
}

async function getLocalClientSyncStatus(page: Page, clientId: number): Promise<string | null> {
    return page.evaluate((id) => {
        const request = indexedDB.open('VisionFlowDB')
        return new Promise<string | null>((resolve, reject) => {
            request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o Dexie.'))
            request.onsuccess = () => {
                const database = request.result
                const transaction = database.transaction('clientes', 'readonly')
                const recordRequest = transaction.objectStore('clientes').get(id)
                recordRequest.onsuccess = () => {
                    const record: unknown = recordRequest.result
                    if (typeof record !== 'object' || record === null || !('syncStatus' in record)) {
                        resolve(null)
                        return
                    }
                    resolve(typeof record.syncStatus === 'string' ? record.syncStatus : null)
                }
                transaction.oncomplete = () => database.close()
                transaction.onerror = () => {
                    database.close()
                    reject(transaction.error ?? new Error(`Não foi possível consultar o cliente ${id} no Dexie.`))
                }
            }
        })
    }, clientId)
}

async function hasCachedClients(page: Page, names: string[]): Promise<boolean> {
    return page.evaluate((expectedNames) => {
        const request = indexedDB.open('VisionFlowDB')
        return new Promise<boolean>((resolve, reject) => {
            request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o Dexie.'))
            request.onsuccess = () => {
                const database = request.result
                const transaction = database.transaction('clientes', 'readonly')
                const recordsRequest = transaction.objectStore('clientes').getAll()
                recordsRequest.onsuccess = () => {
                    const foundNames = recordsRequest.result.map((record) => {
                        if (typeof record !== 'object' || record === null) return null
                        const stored = record as { name?: unknown; data?: { name?: unknown } }
                        return typeof stored.data?.name === 'string'
                            ? stored.data.name
                            : typeof stored.name === 'string' ? stored.name : null
                    })
                    resolve(expectedNames.every((name) => foundNames.includes(name)))
                }
                transaction.oncomplete = () => database.close()
                transaction.onerror = () => {
                    database.close()
                    reject(transaction.error ?? new Error('Não foi possível consultar os clientes do Dexie.'))
                }
            }
        })
    }, names)
}

test.describe.serial('QA E2E completo — CRUD, relacionamentos e offline-first', () => {
    test.setTimeout(180000)

    const clientIds: number[] = []
    const addressIds: TestAddress[] = []
    const orderIds: number[] = []
    let uiCustomerId: number | null = null
    let offlineSyncedClientId: number | null = null
    let offlineDeletedClientId: number | null = null
    let offlineOrderId: number | null = null
    const observedClientCreateIds: Promise<number>[] = []
    const observedOrderCreateIds: Promise<number>[] = []
    let product: TestProduct | null = null
    let setupCustomerName = ''
    let alternateCustomerName = ''
    let uiCustomerName = ''
    let editedUiCustomerName = ''
    let offlineCustomerName = ''
    let editedOfflineCustomerName = ''
    let offlineDeletedCustomerName = ''

    test.afterEach(async ({ page, context }) => {
        await context.setOffline(false)
        clientIds.push(...await Promise.all(observedClientCreateIds))
        orderIds.push(...await Promise.all(observedOrderCreateIds))
        const hasRemoteRecords = clientIds.length > 0
            || addressIds.length > 0
            || orderIds.length > 0
            || uiCustomerId !== null
            || offlineSyncedClientId !== null
            || offlineOrderId !== null
            || offlineDeletedClientId !== null
        if (!hasRemoteRecords) return

        const headers = await getAuthHeaders(page)
        for (const orderId of new Set([...orderIds, ...(offlineOrderId === null ? [] : [offlineOrderId])])) {
            const response = await page.request.delete(`/pedidos/${orderId}`, { headers })
            if (response.status() !== 404) await assertApiSuccess(response, `Limpeza do pedido ${orderId}`)
        }

        for (const { clientId, addressId } of addressIds.splice(0)) {
            await deleteAddressViaApi(page, clientId, addressId)
        }

        const clientsToDelete = new Set([
            ...clientIds,
            ...(uiCustomerId === null ? [] : [uiCustomerId]),
            ...(offlineSyncedClientId === null ? [] : [offlineSyncedClientId]),
            ...(offlineDeletedClientId === null ? [] : [offlineDeletedClientId]),
        ])
        for (const clientId of clientsToDelete) {
            const response = await page.request.delete(`/clientes/${clientId}`, { headers })
            if (response.status() !== 404) await assertApiSuccess(response, `Limpeza do cliente ${clientId}`)
        }

        clientIds.length = 0
        orderIds.length = 0
        uiCustomerId = null
        offlineSyncedClientId = null
        offlineDeletedClientId = null
        offlineOrderId = null
        observedClientCreateIds.length = 0
        observedOrderCreateIds.length = 0
    })

    test('executa os quatro blocos de QA na sequência especificada', async ({
        page,
        context,
        loginTenant4,
    }) => {
        const browserErrors: string[] = []
        page.on('response', (response) => {
            const path = new URL(response.url()).pathname
            if (path === '/clientes' && response.request().method() === 'POST' && response.ok()) {
                observedClientCreateIds.push(responseId(response))
            }
            if (path === '/pedidos' && response.request().method() === 'POST' && response.ok()) {
                observedOrderCreateIds.push(responseId(response))
            }
        })
        page.on('console', (message) => {
            if (message.type() === 'error') browserErrors.push(message.text())
        })
        page.on('pageerror', (error) => browserErrors.push(error.message))
        await test.step('Setup — login, limpeza do Dexie e dados de API', async () => {
            await loginTenant4()
            await clearDexie(page)

            setupCustomerName = createUniqueName('Cliente setup pedido')
            alternateCustomerName = createUniqueName('Cliente alternativo pedido')
            offlineDeletedCustomerName = createUniqueName('Cliente removido offline')

            const setupCustomerId = await createClientViaApi(page, setupCustomerName)
            clientIds.push(setupCustomerId)
            addressIds.push({
                clientId: setupCustomerId,
                addressId: await createAddressViaApi(page, setupCustomerId),
            })

            const alternateCustomerId = await createClientViaApi(page, alternateCustomerName)
            clientIds.push(alternateCustomerId)
            addressIds.push({
                clientId: alternateCustomerId,
                addressId: await createAddressViaApi(page, alternateCustomerId),
            })

            offlineDeletedClientId = await createClientViaApi(page, offlineDeletedCustomerName)
            clientIds.push(offlineDeletedClientId)

            const availableProduct = (await listRealProducts(page)).find((candidate) => candidate.price > 0)
            if (!availableProduct) {
                throw new Error('A API não retornou nenhum produto com preço para compor o pedido E2E.')
            }
            product = {
                id: availableProduct.id,
                description: availableProduct.description,
                price: availableProduct.price,
            }

            expect(await getIdbStoreCount(page, 'sync_queue')).toBe(0)
            const clientsResponsePromise = page.waitForResponse((response) =>
                new URL(response.url()).pathname === '/clientes'
                && response.request().method() === 'GET',
            )
            await page.goto('/app/clientes')
            await clientsResponsePromise
            await expect.poll(
                () => hasCachedClients(page, [setupCustomerName, alternateCustomerName, offlineDeletedCustomerName]),
                { timeout: 30000 },
            ).toBe(true)
        })

        await test.step('Bloco 1 — CLI-01 Create: cria um cliente online', async () => {
            uiCustomerName = createUniqueName('Cliente CRUD online')
            editedUiCustomerName = `${uiCustomerName} atualizado`

            await page.goto('/app/clientes/novo')
            await page.getByLabel('Nome / Razão Social').fill(uiCustomerName)
            await page.getByLabel('Tel. Comercial').fill('11999990000')

            const createResponsePromise = page.waitForResponse((response) =>
                new URL(response.url()).pathname === '/clientes'
                && response.request().method() === 'POST',
            )
            await page.getByRole('button', { name: 'Salvar', exact: true }).click()
            const response = await createResponsePromise
            await assertApiSuccess(response, 'CLI-01 — criação do cliente')
            uiCustomerId = await responseId(response)
            await expect(page).toHaveURL(/\/app\/clientes(?:\?.*)?$/)
            await expect.poll(() => getIdbStoreCount(page, 'sync_queue'), { timeout: 30000 }).toBe(0)
            expect.soft(observedClientCreateIds, 'O cadastro online deve gerar somente um POST.').toHaveLength(1)
            expect(Number.isSafeInteger(uiCustomerId) && uiCustomerId > 0).toBe(true)
        })

        await test.step('CLI-02 Update: altera o nome e adiciona um endereço', async () => {
            if (uiCustomerId === null) throw new Error('O ID do cliente CLI-01 não foi salvo.')
            const clientId = uiCustomerId

            await expect.poll(
                () => getLocalClientSyncStatus(page, clientId),
                { timeout: 30000 },
            ).toBe('synced')
            await page.goto(`/app/clientes/${clientId}`)
            await expect(page).toHaveURL(/\/app\/clientes\/\d+/)
            await expect(page.getByRole('heading', { name: 'Cadastro de Cliente' })).toBeVisible()
            await expect(page.getByLabel('Nome / Razão Social')).toHaveValue(uiCustomerName)
            await page.getByLabel('Nome / Razão Social').fill(editedUiCustomerName)
            await page.getByLabel('Tel. Comercial').fill('11999990000')
            const updateResponsePromise = page.waitForResponse((response) => {
                const path = new URL(response.url()).pathname
                return (path === `/clientes/${clientId}` && response.request().method() === 'PUT')
                    || (path === '/clientes' && response.request().method() === 'POST')
            },
            )
            await page.getByRole('button', { name: 'Salvar', exact: true }).click()
            const updateResponse = await updateResponsePromise
            await assertApiSuccess(updateResponse, 'CLI-02 — atualização do cliente')
            expect.soft(updateResponse.request().method(), 'A edição não deve criar outro cliente.').toBe('PUT')
            await expect(page).toHaveURL(/\/app\/clientes(?:\?.*)?$/)
            await page.getByLabel('Pesquisar Cliente...').fill(editedUiCustomerName)
            await expect(page.getByRole('link').filter({ hasText: editedUiCustomerName }).first()).toBeVisible()

            await page.goto(`/app/clientes/${clientId}`)
            await expect(page).toHaveURL(/\/app\/clientes\/\d+/)
            await expect(page.getByRole('heading', { name: 'Cadastro de Cliente' })).toBeVisible()
            await page.getByRole('tab', { name: 'Endereços' }).click()
            await page.getByRole('button', { name: 'Adicionar Endereço' }).click()
            const addressDialog = page.getByRole('dialog', { name: 'Cadastro de Endereço' })
            const street = createUniqueName('Logradouro QA')
            const number = createUniqueAddressNumber()
            await addressDialog.getByLabel('Tipo').selectOption('entrega')
            await addressDialog.getByRole('textbox', { name: /^CEP/ }).fill('01001000')
            await addressDialog.getByLabel('Logradouro').fill(street)
            await addressDialog.getByLabel('Número').fill(number)
            await addressDialog.getByLabel('Bairro').fill('Centro')
            await addressDialog.getByLabel('Cidade').fill('São Paulo')
            await addressDialog.getByLabel('Estado').fill('SP')

            const addressResponsePromise = page.waitForResponse((response) =>
                new URL(response.url()).pathname === `/clientes/${uiCustomerId}/enderecos`
                && response.request().method() === 'POST',
            )
            await addressDialog.getByRole('button', { name: 'Salvar', exact: true }).click()
            const addressResponse = await addressResponsePromise
            await assertApiSuccess(addressResponse, 'CLI-02 — criação do endereço')
            addressIds.push({ clientId: uiCustomerId, addressId: await responseId(addressResponse) })
            await expect(addressDialog).toBeHidden()
            await expect(page.getByRole('button').filter({ hasText: `${street}, ${number}` })).toBeVisible()
        })

        await test.step('CLI-04 Read/Relacionamento: consulta CNPJ e valida o preenchimento', async () => {
            if (uiCustomerId === null) throw new Error('O ID do cliente CLI-01 não foi salvo.')

            await page.getByRole('tab', { name: 'Dados Gerais' }).click()
            await page.getByLabel('CPF/CNPJ').fill('61186888000193')
            const lookupResponsePromise = page.waitForResponse((response) =>
                new URL(response.url()).pathname === '/clientes/cnpj/61186888000193'
                && response.request().method() === 'GET',
            )
            const cnpjAddressResponsePromise = page.waitForResponse((response) =>
                new URL(response.url()).pathname === `/clientes/${uiCustomerId}/enderecos`
                && response.request().method() === 'POST',
            )
            await page.getByRole('button', { name: 'Consultar CNPJ' }).click()
            const lookupResponse = await lookupResponsePromise
            await assertApiSuccess(lookupResponse, 'CLI-04 — consulta de CNPJ')
            const cnpjAddressResponse = await cnpjAddressResponsePromise
            await assertApiSuccess(cnpjAddressResponse, 'CLI-04 — endereço retornado pela consulta de CNPJ')
            addressIds.push({ clientId: uiCustomerId, addressId: await responseId(cnpjAddressResponse) })
            await expect(page.getByLabel('Nome / Razão Social')).not.toHaveValue('')
            await expect(page.getByLabel('Apelido / Fantasia')).not.toHaveValue('')
            await expect(page.getByLabel('Tel. Comercial')).not.toHaveValue('')
        })

        await test.step('CLI-03 Delete: exclui o cliente e confirma a ausência na lista', async () => {
            if (uiCustomerId === null) throw new Error('O ID do cliente CLI-01 não foi salvo.')
            const customerAddresses = addressIds.filter(({ clientId }) => clientId === uiCustomerId)
            for (const address of customerAddresses) {
                await deleteAddressViaApi(page, address.clientId, address.addressId)
                addressIds.splice(addressIds.indexOf(address), 1)
            }
            await page.goto(`/app/clientes/${uiCustomerId}`)
            await page.getByRole('button', { name: 'Ações do cliente' }).click()
            const deleteResponsePromise = page.waitForResponse((response) =>
                new URL(response.url()).pathname === `/clientes/${uiCustomerId}`
                && response.request().method() === 'DELETE',
            )
            await page.getByRole('dialog').getByRole('button', { name: 'Excluir cliente' }).click()
            await assertApiSuccess(await deleteResponsePromise, 'CLI-03 — exclusão do cliente')
            await expect(page).toHaveURL(/\/app\/clientes(?:\?.*)?$/)

            await page.getByLabel('Pesquisar Cliente...').fill(editedUiCustomerName)
            await expect(page.locator(`main a[href="/app/clientes/${uiCustomerId}"]`)).toHaveCount(0, {
                timeout: 15000,
            })
            uiCustomerId = null
        })

        await test.step('Bloco 2 — CRUD de produtos: limitações da aplicação atual', async () => {
            test.info().annotations.push({
                type: 'info',
                description: 'Não executado: a aplicação não possui tela de gestão nem endpoint de escrita para produtos. O produto real do catálogo é usado nos testes de pedidos.',
            })
            expect(product).not.toBeNull()
        })

        await test.step('Preparação de cache online para os testes offline', async () => {
            if (product === null) throw new Error('O produto de teste não foi carregado.')
            await page.goto('/app/pedidos/novo')
            await page.getByRole('tab', { name: 'Produtos' }).click()
            await page.getByRole('button', { name: 'Adicionar Produto' }).last().click()
            const dialog = page.getByRole('dialog', { name: 'Adicionar produto' })
            await dialog.getByRole('textbox', {
                name: 'Buscar produto por código ou descrição...',
            }).fill(product.description)
            await expect(dialog.getByRole('button').filter({ hasText: product.description }).first()).toBeVisible()
            await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
            await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
            await page.goto('/app/clientes')
            await expect(page.getByRole('heading', { name: 'Clientes', exact: true })).toBeVisible()
        })

        await test.step('Bloco 3 — PED-01 Create: cria pedido online com o produto do setup', async () => {
            if (product === null) throw new Error('O produto de teste não foi carregado.')
            const orderId = await createDocument(page, '/app/pedidos/novo', setupCustomerName, product)
            orderIds.push(orderId)
            await expect(page).toHaveURL(/\/app\/pedidos(?:\?.*)?$/)
            await expect.poll(
                () => getIdbStoreCount(page, 'sync_queue'),
                { timeout: 30000 },
            ).toBe(0)
        })

        await test.step.skip(
            'PED-02 Update: altera quantidade e cliente',
            async () => {
                // Pulado: a API só lista tabelas de preço; não há endpoint para criar
                // uma tabela/vinculá-la ao produto neste ambiente.
            },
        )

        await test.step('PED-03 Read/Relacionamento: valida cliente, produto, quantidade e preço', async () => {
            if (orderIds.length === 0 || product === null) throw new Error('O pedido ou produto do setup não foi salvo.')
            const orderId = orderIds[0]
            await page.goto(`/app/pedidos/${orderId}`)
            await expect(page.getByLabel('Cliente')).toContainText(setupCustomerName)
            await page.getByRole('tab', { name: 'Produtos' }).click()
            await expect(page.getByRole('button').filter({ hasText: product.description }).first()).toBeVisible()

            const response = await page.request.get(`/pedidos/${orderId}`, {
                headers: await getAuthHeaders(page),
            })
            await assertApiSuccess(response, 'PED-03 — leitura do pedido')
            const data = await responseData(response)
            if (!isRecord(data) || !isRecord(data.cliente) || !Array.isArray(data.itens)) {
                throw new Error('A API retornou um pedido sem o relacionamento de cliente/itens esperado.')
            }
            expect(data.cliente.nome_razao_social).toBe(setupCustomerName)
            const item = data.itens[0]
            if (!isRecord(item) || !isRecord(item.product)) {
                throw new Error('O pedido salvo não contém o produto relacionado.')
            }
            expect(item.product.id).toBe(product.id)
            expect(item.product.descricao).toBe(product.description)
            expect(item.quantidade_informada).toBe(1)
            expect(item.sale_price).toBe(product.price)
        })

        await test.step('PED-04 Delete: exclui o pedido e confirma que saiu da listagem', async () => {
            if (orderIds.length === 0) throw new Error('O ID do pedido não foi salvo.')
            const orderId = orderIds[0]
            await deleteRecord(page, `/pedidos/${orderId}`, 'PED-04 — exclusão do pedido')
            orderIds.splice(orderIds.indexOf(orderId), 1)
            await removeCachedOrder(page, orderId)

            await page.goto('/app/pedidos')
            await page.getByLabel('Pesquisar por número, cliente ou data...').fill(setupCustomerName)
            await expect(page.locator(`main a[href="/app/pedidos/${orderId}"]`)).toHaveCount(0, {
                timeout: 15000,
            })
        })

        await test.step('PED-05 Orçamento: cria, salva e valida os relacionamentos', async () => {
            if (product === null) throw new Error('O produto de teste não foi carregado.')
            const budgetId = await createDocument(page, '/app/orcamentos/novo', setupCustomerName, product)
            orderIds.push(budgetId)
            await expect(page).toHaveURL(/\/app\/orcamentos(?:\?.*)?$/)

            const response = await page.request.get(`/orcamentos/${budgetId}`, {
                headers: await getAuthHeaders(page),
            })
            await assertApiSuccess(response, 'PED-05 — leitura do orçamento')
            const data = await responseData(response)
            if (!isRecord(data) || !isRecord(data.cliente) || !Array.isArray(data.itens)) {
                throw new Error('A API retornou um orçamento sem o relacionamento de cliente/itens esperado.')
            }
            expect(data.cliente.nome_razao_social).toBe(setupCustomerName)
            const item = data.itens[0]
            if (!isRecord(item) || !isRecord(item.product)) {
                throw new Error('O orçamento salvo não contém o produto relacionado.')
            }
            expect(item.product.id).toBe(product.id)
            expect(item.product.descricao).toBe(product.description)
        })

        await test.step('Bloco 4 — CLI-07: cria, edita e exclui dados com o navegador offline', async () => {
            offlineCustomerName = createUniqueName('Cliente criado offline')
            editedOfflineCustomerName = `${offlineCustomerName} editado`

            await context.setOffline(true)
            const navigation = page.getByRole('navigation', { name: 'Abrir navegação' })
            await navigation.getByRole('link', { name: 'Clientes', exact: true }).click()
            await expect(page).toHaveURL(/\/app\/clientes$/)
            await page.getByRole('button', { name: 'Adicionar Cliente', exact: true }).click()
            await expect(page).toHaveURL(/\/app\/clientes\/novo$/)
            await page.getByLabel('Nome / Razão Social').fill(offlineCustomerName)
            await page.getByLabel('Tel. Comercial').fill('11999990001')
            await page.getByRole('button', { name: 'Salvar', exact: true }).click()
            await expect(page).toHaveURL(/\/app\/clientes$/)

            const search = page.getByLabel('Pesquisar Cliente...')
            await search.fill(offlineCustomerName)
            const offlineClientLink = page.getByRole('link').filter({ hasText: offlineCustomerName }).first()
            await expect(offlineClientLink).toBeVisible()
            await expect(
                page.getByRole('main').getByRole('status').filter({ hasText: 'Pendente' }),
            ).toBeVisible()

            await offlineClientLink.click()
            await page.getByLabel('Nome / Razão Social').fill(editedOfflineCustomerName)
            await page.getByRole('button', { name: 'Salvar', exact: true }).click()
            await expect(page).toHaveURL(/\/app\/clientes$/)
            await expect.poll(() => getQueuedActions(page, 'cliente')).toContain('create')
            await expect.poll(() => getQueuedActions(page, 'cliente')).not.toContain('update')
            await search.fill(editedOfflineCustomerName)
            await expect(page.getByRole('link').filter({ hasText: editedOfflineCustomerName }).first()).toBeVisible()
            await expect(
                page.getByRole('main').getByRole('status').filter({ hasText: 'Pendente' }).first(),
            ).toBeVisible()

            if (offlineDeletedClientId === null) throw new Error('O cliente para exclusão offline não foi preparado.')
            await search.fill(offlineDeletedCustomerName)
            await expect(page.locator(`main a[href="/app/clientes/${offlineDeletedClientId}"]`)).toBeVisible()
            await page.locator(`main a[href="/app/clientes/${offlineDeletedClientId}"]`).click()
            await page.getByRole('button', { name: 'Ações do cliente' }).click()
            await page.getByRole('dialog').getByRole('button', { name: 'Excluir cliente' }).click()
            await expect(page).toHaveURL(/\/app\/clientes$/)
            await search.fill(offlineDeletedCustomerName)
            await expect(page.getByRole('link').filter({ hasText: offlineDeletedCustomerName })).toHaveCount(0)
            expect(await getIdbStoreCount(page, 'sync_queue')).toBeGreaterThan(0)
        })

        await test.step('PED-06: cria pedido offline com o cliente criado offline', async () => {
            if (product === null) throw new Error('O produto de teste não foi carregado.')
            const navigation = page.getByRole('navigation', { name: 'Abrir navegação' })
            await navigation.getByRole('link', { name: 'Pedidos', exact: true }).click()
            await expect(page).toHaveURL(/\/app\/pedidos$/)
            await page.getByRole('button', { name: 'Novo Pedido', exact: true }).click()
            await expect(page).toHaveURL(/\/app\/pedidos\/novo$/)
            await selectCustomer(page, editedOfflineCustomerName)
            await addProduct(page, product)
            await page.getByRole('button', { name: 'Salvar', exact: true }).click()
            await expect(page).toHaveURL(/\/app\/pedidos$/)

            const pendingStatuses = page.getByRole('main').getByRole('status').filter({ hasText: 'Pendente' })
            await expect(pendingStatuses).toBeVisible()
            const offlineOrderCard = page.getByRole('main').getByRole('link')
                .filter({ hasText: editedOfflineCustomerName })
                .first()
            await expect(offlineOrderCard).toBeVisible()
            await expect(offlineOrderCard).toContainText('Pendente')
        })

        await test.step('SYNC-01: reconecta, aguarda o SyncEngine e verifica persistência na API', async () => {
            const clientCreateResponsePromise = page.waitForResponse((response) =>
                new URL(response.url()).pathname === '/clientes'
                && response.request().method() === 'POST',
                { timeout: 60000 },
            )
            const offlineDeleteResponsePromise = page.waitForResponse((response) =>
                offlineDeletedClientId !== null
                && new URL(response.url()).pathname === `/clientes/${offlineDeletedClientId}`
                && response.request().method() === 'DELETE',
                { timeout: 60000 },
            )
            const orderCreateResponsePromise = page.waitForResponse((response) =>
                new URL(response.url()).pathname === '/pedidos'
                && response.request().method() === 'POST',
                { timeout: 60000 },
            )

            await context.setOffline(false)
            const [clientCreateResponse, offlineDeleteResponse, orderCreateResponse] = await Promise.all([
                clientCreateResponsePromise,
                offlineDeleteResponsePromise,
                orderCreateResponsePromise,
            ])
            await assertApiSuccess(clientCreateResponse, 'SYNC-01 — sincronização do cliente')
            await assertApiSuccess(offlineDeleteResponse, 'SYNC-01 — sincronização da exclusão do cliente')
            await assertApiSuccess(orderCreateResponse, 'SYNC-01 — sincronização do pedido')
            offlineSyncedClientId = await responseId(clientCreateResponse)
            offlineOrderId = await responseId(orderCreateResponse)

            await page.getByRole('navigation', { name: 'Abrir navegação' })
                .getByRole('link', { name: 'Clientes', exact: true }).click()
            await expect(
                page.getByRole('main').getByRole('status').filter({ hasText: 'Pendente' }),
            ).toHaveCount(0, { timeout: 30000 })

            const clientResponse = await page.request.get(`/clientes/${offlineSyncedClientId}`, {
                headers: await getAuthHeaders(page),
            })
            await assertApiSuccess(clientResponse, 'SYNC-01 — leitura do cliente sincronizado')
            const clientData = await responseData(clientResponse)
            if (!isRecord(clientData)) throw new Error('A API retornou um cliente sincronizado inválido.')
            expect(clientData.nome_razao_social).toBe(editedOfflineCustomerName)

            const orderResponse = await page.request.get(`/pedidos/${offlineOrderId}`, {
                headers: await getAuthHeaders(page),
            })
            await assertApiSuccess(orderResponse, 'SYNC-01 — leitura do pedido sincronizado')
            const orderData = await responseData(orderResponse)
            if (!isRecord(orderData) || !isRecord(orderData.cliente) || !Array.isArray(orderData.itens)) {
                throw new Error('A API retornou um pedido sincronizado sem seus relacionamentos.')
            }
            expect(orderData.cliente.id).toBe(offlineSyncedClientId)
            expect(orderData.cliente.nome_razao_social).toBe(editedOfflineCustomerName)
            const item = orderData.itens[0]
            if (!isRecord(item) || !isRecord(item.product) || product === null) {
                throw new Error('O pedido sincronizado não contém o produto esperado.')
            }
            expect(item.product.id).toBe(product.id)
            expect(item.product.descricao).toBe(product.description)

            await page.goto('/app/pedidos')
            const syncedOrderCard = page.locator(`main a[href="/app/pedidos/${offlineOrderId}"]`)
            await expect(syncedOrderCard).toBeVisible()
            const browserErrorCountBeforeOpening = browserErrors.length
            await syncedOrderCard.click()
            await expect(page).toHaveURL(new RegExp(`/app/pedidos/${offlineOrderId}$`))
            await expect(page.getByRole('heading', { name: /Pedido/ })).toBeVisible()
            await expect(page.getByLabel('Cliente')).toContainText(editedOfflineCustomerName)
            await page.getByRole('tab', { name: 'Produtos' }).click()
            const reopenedItem = page.getByRole('button').filter({ hasText: product.description })
            await expect(reopenedItem).toBeVisible()
            await expect(reopenedItem).toContainText('1')
            expect(
                browserErrors.slice(browserErrorCountBeforeOpening),
                'Abrir o pedido sincronizado não deve gerar erros no console.',
            ).toEqual([])

            if (offlineDeletedClientId !== null) {
                const deletedClientResponse = await page.request.get(`/clientes/${offlineDeletedClientId}`, {
                    headers: await getAuthHeaders(page),
                })
                expect(deletedClientResponse.status()).toBe(404)
                clientIds.splice(clientIds.indexOf(offlineDeletedClientId), 1)
                offlineDeletedClientId = null
            }
        })
    })
})
