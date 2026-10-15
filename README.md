# VisionFlow
# Se não tem node_modules ainda
npm install

# Roda
npm run dev

npm run build
npx playwright test 

Bug identificado com precisão: o editor de pedido usa MOCK em vez de API para carregar clientes.

═══════════════════════════════════════
EVIDÊNCIAS
═══════════════════════════════════════

`src/features/pedido/presentation/viewmodels/usePedidoEditorViewModel.ts`:
- Linha 6: importa `orderCatalogs` de MockPedidoRepository
- Linha 71: usa `orderCatalogs.clients.find(...)`
- Linha 110: retorna `catalogs: orderCatalogs`

`src/features/pedido/presentation/components/editor/PedidoCustomerSelect.tsx`:
- Linha 21: `catalogs.clients.find(...)`
- Linha 32: `catalogs.clients.map(...)` para renderizar as options

`MockPedidoRepository.ts:114`:
- `orderCatalogs.clients = clientsMock.data` (IDs 24129, 5060)

Resultado: um pedido real com `cliente.id = 28` não encontra opção no select.

═══════════════════════════════════════
TAREFA
═══════════════════════════════════════

Substituir o mock de clientes do editor de pedido pela API real,
SEM alterar o componente `PedidoCustomerSelect` (ele só lê `.clients`).

## Passo 1 — usePedidoEditorViewModel.ts

- Remover o import de `orderCatalogs`
- Criar estado `catalogs` com a forma `{ clients: Array<{ id: number; nome: string }> }`
- Ao montar, buscar clientes via `apiClienteRepository.list()`
- Mapear `Cliente` → `{ id, nome: cliente.name }`
- Retornar `catalogs` no objeto de retorno
- O resto (linha 71, `find`) continua funcionando porque a forma é a mesma

## Passo 2 — Se `orderCatalogs` for usado em outros ViewModels

Procure por outros usos:

```bash
grep -rn "orderCatalogs" src/features/pedido/ --include="*.ts" --include="*.tsx"
```

Se houver outros ViewModels usando, replicar o mesmo padrão.

## Passo 3 — Se existem outros catálogos no select

`orderCatalogs` provavelmente tem outros campos (`products`, `paymentConditions`, etc).
Se o editor também usa esses outros catálogos, avaliar se devem ser trocados também.

**MAS** foque no `clients` nesta tarefa. Se sobrar tempo, trate os outros.

## Passo 4 — Import do ApiClienteRepository

Confirme o caminho correto:

```bash
find src/features/cliente -name "ApiClienteRepository.ts"
```

E o nome do export (`apiClienteRepository`, `clienteRepository`, etc).

═══════════════════════════════════════
VALIDAÇÃO
═══════════════════════════════════════

1. `npm run build`
2. `npx playwright test` → 9/9 devem passar
3. Abrir `/pedidos/2` no navegador → select de Cliente deve mostrar o nome real (não "Selecione")

Cole:
- Diff de cada arquivo alterado
- Saída de `npx playwright test`

Não commite.

cd /workspaces/VisionFlow

for i in 1 2 3; do
  echo "═══ Rodada $i ═══"
  npx playwright test 2>&1 | grep -E "passed|failed"
done