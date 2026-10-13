# Contrato Backend: Catálogos e Endereços

Este documento especifica os endpoints que faltam para o frontend deixar de usar os mocks nos catálogos de cliente e pedido/orçamento. Também registra os campos que devem ser incluídos no detalhe de pedido para preencher corretamente o editor.

Base local: `http://localhost:8080`

Na verificação realizada em 06/10/2026, os endpoints de catálogo e endereços abaixo retornaram `404`. As rotas atuais de pedidos, clientes, home, shell, agenda, tarefas e notificações continuam sendo contratos existentes; este documento complementa esses contratos.

## Regras Gerais

- Todas as rotas deste documento devem exigir `Authorization: Bearer <token>`, exceto se o backend decidir que a consulta pública de CEP deve ser aberta.
- Respostas seguem o envelope padrão:

```json
{
  "success": true,
  "data": [],
  "error": null
}
```

- Erros seguem o mesmo envelope, com `success: false`, `data: null` e `error` contendo `code` e `message`.
- As listas devem ser arrays dentro de `data`, inclusive quando vazias.
- IDs são inteiros estáveis. Valores monetários e quantidades são números JSON, nunca strings formatadas.
- Datas devem usar ISO 8601 (`YYYY-MM-DD` ou timestamp ISO 8601 conforme o campo).
- Propriedades abaixo são snake_case.

## Endpoints de Catálogo

### `GET /empresas`

Usado para selecionar a empresa no editor de pedido.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Vision Flow Distribuidora"
    }
  ],
  "error": null
}
```

### `GET /condicoes_pagamento`

Usado nos padrões do cliente e no editor de pedido.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "descricao": "À vista"
    },
    {
      "id": 3,
      "descricao": "30/60/90 dias"
    }
  ],
  "error": null
}
```

### `GET /formas_pagamento`

Usado nos padrões do cliente e no editor de pedido.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "descricao": "Dinheiro"
    },
    {
      "id": 2,
      "descricao": "Boleto"
    },
    {
      "id": 3,
      "descricao": "PIX"
    }
  ],
  "error": null
}
```

### `GET /transportadoras`

Usado nos padrões do cliente e no editor de pedido.

```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "nome": "Transportes Silva"
    },
    {
      "id": 8,
      "nome": "Rápido Central"
    }
  ],
  "error": null
}
```

### `GET /tabelas_preco`

Usado nos padrões do cliente e para exibir/selecionar a tabela aplicada ao item do pedido.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Padrão",
      "vigencia": "2026-12-31"
    },
    {
      "id": 2,
      "nome": "Atacado",
      "vigencia": "2026-12-31"
    }
  ],
  "error": null
}
```

### `GET /produtos`

Usado pelo seletor de produtos. A API deve fornecer os dados de exibição, preço padrão e dados adicionais mostrados no editor de item. Não omitir os campos numéricos/booleanos: o frontend precisa deles para preencher os detalhes do item.

```json
{
  "success": true,
  "data": [
    {
      "id": 555,
      "codigo": "P555",
      "descricao": "Cabo Flexível 2,5mm",
      "familia": "Elétrica",
      "marca": "Sil",
      "unidade": "MT",
      "peso_liquido": 0.08,
      "peso_bruto": 0.09,
      "cubagem": 0.0001,
      "comprimento": 100,
      "largura": 0.25,
      "altura_espessura": 0.25,
      "qtde_embalagem": 1,
      "permite_venda_sem_estoque": true,
      "estoque": 1200,
      "tabela_preco_padrao_id": 1,
      "preco_venda": 4.75
    },
    {
      "id": 556,
      "codigo": "P556",
      "descricao": "Disjuntor 20A",
      "familia": "Elétrica",
      "marca": "Steck",
      "unidade": "UN",
      "peso_liquido": 0.12,
      "peso_bruto": 0.15,
      "cubagem": 0.0003,
      "comprimento": 8,
      "largura": 3,
      "altura_espessura": 7,
      "qtde_embalagem": 1,
      "permite_venda_sem_estoque": false,
      "estoque": 84,
      "tabela_preco_padrao_id": 1,
      "preco_venda": 32.9
    }
  ],
  "error": null
}
```

Campos mínimos consumidos pelo seletor: `id`, `codigo`, `descricao`, `familia`, `marca`, `unidade`, `tabela_preco_padrao_id` e `preco_venda`. O editor de item também consome `peso_liquido`, `peso_bruto`, `cubagem`, `comprimento`, `largura`, `altura_espessura`, `qtde_embalagem`, `permite_venda_sem_estoque` e `estoque`.

## Endereços de Cliente

### `GET /clientes/{cliente_id}/enderecos`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo": "cobranca",
      "finalidade": "principal",
      "cep": "13504-185",
      "logradouro": "FAZENDA BARREIROS",
      "numero": "0",
      "complemento": "",
      "bairro": "ZONA RURAL",
      "cidade": "RIO CLARO",
      "estado": "SP",
      "ponto_referencia": "",
      "restricoes_entrega": ""
    }
  ],
  "error": null
}
```

### `POST /clientes/{cliente_id}/enderecos`

Request:

```json
{
  "tipo": "entrega",
  "finalidade": "principal",
  "cep": "13504-185",
  "logradouro": "Avenida 52",
  "numero": "100",
  "complemento": "Galpão B",
  "bairro": "Alto do Santana",
  "cidade": "Rio Claro",
  "estado": "SP",
  "ponto_referencia": "Portão lateral",
  "restricoes_entrega": "Receber em horário comercial"
}
```

Response: `201 Created` e o endereço salvo dentro do envelope, incluindo o `id` atribuído:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "tipo": "entrega",
    "finalidade": "principal",
    "cep": "13504-185",
    "logradouro": "Avenida 52",
    "numero": "100",
    "complemento": "Galpão B",
    "bairro": "Alto do Santana",
    "cidade": "Rio Claro",
    "estado": "SP",
    "ponto_referencia": "Portão lateral",
    "restricoes_entrega": "Receber em horário comercial"
  },
  "error": null
}
```

### `DELETE /clientes/{cliente_id}/enderecos/{endereco_id}`

Remover o endereço indicado. Resposta recomendada: `200 OK` com `data: null` no envelope ou `204 No Content`. Como o cliente HTTP aceita resposta sem corpo, ambas são suportadas.

### `GET /cep/{cep}`

Consulta usada pelo formulário de endereço. O parâmetro deve aceitar CEP com ou sem hífen; a resposta deve manter os campos que o formulário preenche.

```json
{
  "success": true,
  "data": {
    "cep": "13504-185",
    "logradouro": "Avenida 52",
    "numero": "",
    "complemento": "",
    "bairro": "Alto do Santana",
    "cidade": "Rio Claro",
    "estado": "SP"
  },
  "error": null
}
```

## Complemento de `GET /pedidos/{id}`

O endpoint de detalhe já existe, mas a resposta atual omite atributos usados pelo editor. Para cada item, retornar produto completo e referência da tabela de preço. Os campos de totais devem estar presentes. Este exemplo mostra o formato esperado:

```json
{
  "success": true,
  "data": {
    "id": 1001,
    "tipo": "pedido",
    "numero": "1001",
    "numero_cliente": "OC-2026-045",
    "status": "em_digitacao",
    "data_emissao": "2026-10-05T08:15:00Z",
    "data_entrega": "2026-10-10T00:00:00Z",
    "empresa": {
      "id": 1,
      "nome": "Vision Flow Distribuidora"
    },
    "cliente": {
      "id": 24129,
      "nome": "ALESSANDRO SILVA TOMAZ",
      "cpf_cnpj": "039.441.526-46"
    },
    "condicao_pagamento": {
      "id": 3,
      "descricao": "30/60/90 dias"
    },
    "forma_pagamento": {
      "id": 2,
      "descricao": "Boleto"
    },
    "transportadora": {
      "id": 7,
      "nome": "Transportes Silva"
    },
    "endereco_faturamento_id": 1,
    "endereco_entrega_id": 1,
    "endereco_cobranca_id": 1,
    "valor_frete": 120,
    "observacoes": "Entrega urgente",
    "observacoes_nf": "",
    "itens": [
      {
        "sequencia": 1,
        "codigo_cliente": "",
        "produto": {
          "id": 555,
          "codigo": "P555",
          "descricao": "Cabo Flexível 2,5mm",
          "familia": "Elétrica",
          "marca": "Sil",
          "unidade": "MT",
          "peso_liquido": 0.08,
          "peso_bruto": 0.09,
          "cubagem": 0.0001,
          "comprimento": 100,
          "largura": 0.25,
          "altura_espessura": 0.25,
          "qtde_embalagem": 1,
          "permite_venda_sem_estoque": true
        },
        "tabela_preco": {
          "id": 1,
          "nome": "Padrão",
          "vigencia": "2026-12-31"
        },
        "quantidade": 50,
        "preco_venda": 4.75,
        "valor_desconto": 10,
        "total_item": 227.5,
        "observacao": ""
      }
    ],
    "totais": {
      "quantidade_mix": 1,
      "quantidade_volume": 50,
      "cubagem_total": 0.005,
      "peso_liquido": 4,
      "peso_bruto": 4.5,
      "total_bruto": 237.5,
      "total_desconto": 10,
      "total_liquido": 347.5
    }
  },
  "error": null
}
```

`estoque` é consumido na resposta de `GET /produtos` para inclusão de um novo item. No detalhe de pedido, o frontend hoje inicializa esse valor localmente como zero; se estoque histórico for necessário, pode ser incluído dentro de `produto`.

## Matriz de Implementação

| Método | Endpoint | Necessidade |
|---|---|---|
| `GET` | `/empresas` | Catálogo para pedido |
| `GET` | `/condicoes_pagamento` | Padrões do cliente e pedido |
| `GET` | `/formas_pagamento` | Padrões do cliente e pedido |
| `GET` | `/transportadoras` | Padrões do cliente e pedido |
| `GET` | `/tabelas_preco` | Padrões do cliente e pedido |
| `GET` | `/produtos` | Busca e inclusão de item |
| `GET` | `/clientes/{cliente_id}/enderecos` | Endereços do cliente |
| `POST` | `/clientes/{cliente_id}/enderecos` | Incluir endereço |
| `DELETE` | `/clientes/{cliente_id}/enderecos/{endereco_id}` | Excluir endereço |
| `GET` | `/cep/{cep}` | Preencher endereço pelo CEP |
| `GET` | `/pedidos/{id}` | Completar produto, tabela e totais no detalhe |

## Resposta de Erro

Exemplo para recurso não encontrado:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RECURSO_NAO_ENCONTRADO",
    "message": "O recurso solicitado não foi encontrado."
  }
}
```

Para uma lista sem registros, retornar `200 OK` com `data: []`, não `404`.
