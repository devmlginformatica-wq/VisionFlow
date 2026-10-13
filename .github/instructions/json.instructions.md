---
applyTo: "src/mocks/**/*.json"
---

# Padrão de JSON mock — Vision Flow

## Envelope padrão
{
  "success": true,
  "data": { },
  "error": null
}

Envelope de erro:
{
  "success": false,
  "data": null,
  "error": { "code": "CLIENTE_NAO_ENCONTRADO", "message": "Cliente não encontrado" }
}

## Regras
- Campos em snake_case (bate com ERP Delphi).
- Datas ISO 8601: `2026-01-30T10:00:00Z`.
- Monetários: `number`. IDs: `int`.
- Sem `null` desnecessário — omitir campo quando não houver valor.
- Sem comentários dentro do JSON.
- Um arquivo por endpoint (não juntar múltiplos endpoints em um arquivo).

## Estrutura de pastas
src/mocks/<feature>/
├── listar.json          (GET /<feature>)
├── detalhe_<id>.json    (GET /<feature>/{id})
└── <acao>.json          (POST específico, se houver)

Exemplos:
- src/mocks/clientes/listar.json
- src/mocks/clientes/detalhe_24129.json
- src/mocks/clientes/cnpj/61186888000193.json
- src/mocks/pedido/listar.json
- src/mocks/pedido/detalhe_1001.json
- src/mocks/shell/empresa.json
- src/mocks/home/indicadores.json

## Nomenclatura de arquivos
- Sempre em pt_BR (bate com a feature).
- Usar snake_case (ex: `detalhe_1001.json`, não `detalhe-1001.json`).
- IDs de detalhe usam o formato `detalhe_<id>.json`.

## Tipos esperados por campo
- IDs: `int`.
- Valores monetários: `number` (ex: `1250.90`), nunca string.
- Datas: ISO 8601 UTC (`2026-01-30T10:00:00Z`).
- Booleanos: `true`/`false`.
- Enums: `string` em snake_case (ex: `"em_digitacao"`).

## O que NÃO fazer
❌ Comentários no JSON.
❌ Campos em camelCase.
❌ Datas em formato local (`30/01/2026`).
❌ Monetários como string (`"1250.90"`).
❌ IDs como string (`"24129"`).
❌ Múltiplos endpoints no mesmo arquivo.
❌ Null explícito em campos opcionais (omitir).