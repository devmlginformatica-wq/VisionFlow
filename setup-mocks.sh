#!/usr/bin/env bash
# =============================================================================
# Vision Flow — Cria toda a estrutura de mocks JSON (React + Vite PWA)
# Uso: bash setup-mocks.sh
# =============================================================================

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  Vision Flow — Criando mocks em src/mocks/"
echo "════════════════════════════════════════════════════════════════"

# -----------------------------------------------------------------------------
# 1. Estrutura de pastas
# -----------------------------------------------------------------------------
echo "▶ Criando pastas..."
mkdir -p src/mocks/auth
mkdir -p src/mocks/home
mkdir -p src/mocks/notificacoes
mkdir -p src/mocks/shell
mkdir -p src/mocks/clientes/24129
mkdir -p src/mocks/clientes/cnpj
mkdir -p src/mocks/pedido
mkdir -p src/mocks/empresas
mkdir -p src/mocks/transportadoras
mkdir -p src/mocks/condicoes_pagamento
mkdir -p src/mocks/formas_pagamento
mkdir -p src/mocks/tabelas_preco
mkdir -p src/mocks/produtos

# -----------------------------------------------------------------------------
# 2. auth/login.json
# -----------------------------------------------------------------------------
cat > src/mocks/auth/login.json <<'EOF'
{
  "success": true,
  "data": {
    "usuario": {
      "id": 1,
      "nome": "Régys Borges",
      "email": "admin@visionflow.app",
      "token": "mock-token-123"
    }
  },
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 3. home/indicadores.json
# -----------------------------------------------------------------------------
cat > src/mocks/home/indicadores.json <<'EOF'
{
  "success": true,
  "data": {
    "vendas_mes": 128450.75,
    "vendas_hoje": 3240.00,
    "pedidos_em_digitacao": 3,
    "orcamentos_em_digitacao": 1,
    "clientes_em_digitacao": 5,
    "pedidos_aguardando_aprovacao": 2,
    "agendas_pendentes": 4,
    "tarefas_pendentes": 7,
    "notificacoes_nao_lidas": 2
  },
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 4. notificacoes/listar.json
# -----------------------------------------------------------------------------
cat > src/mocks/notificacoes/listar.json <<'EOF'
{
  "success": true,
  "data": [
    { "id": 1, "titulo": "Pedido 1001 aguardando aprovação", "lida": false, "data": "2026-01-30T09:00:00Z" },
    { "id": 2, "titulo": "Novo cliente cadastrado", "lida": false, "data": "2026-01-29T15:00:00Z" }
  ],
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 5. shell/empresa.json
# -----------------------------------------------------------------------------
cat > src/mocks/shell/empresa.json <<'EOF'
{
  "success": true,
  "data": {
    "nome": "Vision Flow Distribuidora",
    "cnpj": "12.345.678/0001-90",
    "regional": "Rio Claro - SP",
    "contato": "(19) 3524-1234",
    "usuario_logado": {
      "id": 1,
      "nome": "Régys Borges",
      "email": "admin@visionflow.app"
    }
  },
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 6. clientes/listar.json
# -----------------------------------------------------------------------------
cat > src/mocks/clientes/listar.json <<'EOF'
{
  "success": true,
  "data": [
    {
      "id": 24129,
      "nome": "ALESSANDRO SILVA TOMAZ",
      "fantasia": "ALESSANDRO SILVA TOMAZ",
      "razao_social": "ALESSANDRO SILVA TOMAZ",
      "cpf_cnpj": "039.441.526-46",
      "tipo_pessoa": "PF",
      "status": "aberto",
      "situacao_cadastro": "em_digitacao",
      "situacao_compra": "sem_compra",
      "data_abertura": "2026-10-02",
      "cor_indicador": "verde",
      "endereco_resumo": "FAZENDA BARREIROS, 0 - ZONA RURAL",
      "endereco_completo": "FAZENDA BARREIROS, 0 - ZONA RURAL, RIO CLARO - SP - CEP 13504-185",
      "ultimo_pedido": null,
      "ultimo_atendimento": null
    },
    {
      "id": 5060,
      "nome": "fantazia",
      "fantasia": "fantazia",
      "razao_social": "razão",
      "cpf_cnpj": "61.186.888/0001-93",
      "tipo_pessoa": "PJ",
      "status": "aberto",
      "situacao_cadastro": "em_digitacao",
      "situacao_compra": "sem_compra",
      "data_abertura": "2026-10-02",
      "cor_indicador": "vermelho",
      "endereco_resumo": "O AVENIDA 52, S/N - ALTO DO SANTANA",
      "endereco_completo": "O AVENIDA 52, S/N - ALTO DO SANTANA, RIO CLARO - SP - CEP 13504-185",
      "ultimo_pedido": null,
      "ultimo_atendimento": null
    }
  ],
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 7. clientes/24129/enderecos.json
# -----------------------------------------------------------------------------
cat > src/mocks/clientes/24129/enderecos.json <<'EOF'
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
EOF

# -----------------------------------------------------------------------------
# 8. clientes/cnpj/61186888000193.json
# -----------------------------------------------------------------------------
cat > src/mocks/clientes/cnpj/61186888000193.json <<'EOF'
{
  "success": true,
  "data": {
    "cnpj": "61.186.888/0001-93",
    "razao_social": "EMPRESA EXEMPLO LTDA",
    "nome_fantasia": "Exemplo",
    "inscricao_estadual": "123.456.789.012",
    "email": "contato@exemplo.com.br",
    "telefone": "(34) 98822-1845",
    "endereco": {
      "logradouro": "AVENIDA 52",
      "numero": "S/N",
      "complemento": "",
      "bairro": "ALTO DO SANTANA",
      "cidade": "RIO CLARO",
      "estado": "SP",
      "cep": "13504-185"
    }
  },
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 9. pedido/listar.json
# -----------------------------------------------------------------------------
cat > src/mocks/pedido/listar.json <<'EOF'
{
  "success": true,
  "data": [
    { "id": 1001, "numero": "1001", "tipo": "pedido", "cliente_nome": "ALESSANDRO SILVA TOMAZ",
      "data_emissao": "2026-01-30T10:15:00Z", "total_liquido": 347.50, "status": "em_digitacao" }
  ],
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 10. pedido/detalhe_1001.json
# -----------------------------------------------------------------------------
cat > src/mocks/pedido/detalhe_1001.json <<'EOF'
{
  "success": true,
  "data": {
    "id": 1001,
    "tipo": "pedido",
    "numero": "1001",
    "numero_cliente": "OC-2026-045",
    "status": "em_digitacao",
    "data_emissao": "2026-01-30T10:15:00Z",
    "data_entrega": "2026-02-05T00:00:00Z",
    "empresa": { "id": 1, "nome": "Vision Flow Distribuidora" },
    "cliente": { "id": 24129, "nome": "ALESSANDRO SILVA TOMAZ", "cpf_cnpj": "039.441.526-46" },
    "condicao_pagamento": { "id": 3, "descricao": "30/60/90 dias" },
    "forma_pagamento": { "id": 2, "descricao": "Boleto" },
    "transportadora": { "id": 7, "nome": "Transportes Silva" },
    "endereco_faturamento_id": 1,
    "endereco_entrega_id": 1,
    "endereco_cobranca_id": 1,
    "valor_frete": 120.00,
    "observacoes": "",
    "observacoes_nf": "",
    "itens": [
      {
        "sequencia": 1,
        "codigo_cliente": "CLI-001",
        "produto": {
          "id": 555, "codigo": "P555", "descricao": "Cabo Flexível 2,5mm",
          "familia": "Elétrica", "marca": "Sil", "unidade": "MT",
          "peso_liquido": 0.25, "peso_bruto": 0.28, "cubagem": 0.001,
          "comprimento": 100.0, "largura": 1.0, "altura_espessura": 1.0,
          "qtde_embalagem": 100, "permite_venda_sem_estoque": true
        },
        "tabela_preco": { "id": 1, "nome": "Padrão", "vigencia": "2026-12-31" },
        "quantidade": 50, "preco_venda": 4.75, "valor_desconto": 10.00,
        "total_item": 227.50, "observacao": ""
      }
    ],
    "totais": {
      "quantidade_mix": 50, "quantidade_volume": 1, "cubagem_total": 0.05,
      "peso_liquido": 12.5, "peso_bruto": 14.0,
      "total_bruto": 237.50, "total_desconto": 10.00, "total_liquido": 347.50
    }
  },
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 11. empresas/listar.json
# -----------------------------------------------------------------------------
cat > src/mocks/empresas/listar.json <<'EOF'
{
  "success": true,
  "data": [
    { "id": 1, "nome": "Vision Flow Distribuidora" }
  ],
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 12. transportadoras/listar.json
# -----------------------------------------------------------------------------
cat > src/mocks/transportadoras/listar.json <<'EOF'
{
  "success": true,
  "data": [
    { "id": 7, "nome": "Transportes Silva" },
    { "id": 8, "nome": "Rápido Central" }
  ],
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 13. condicoes_pagamento/listar.json
# -----------------------------------------------------------------------------
cat > src/mocks/condicoes_pagamento/listar.json <<'EOF'
{
  "success": true,
  "data": [
    { "id": 1, "descricao": "À vista" },
    { "id": 3, "descricao": "30/60/90 dias" }
  ],
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 14. formas_pagamento/listar.json
# -----------------------------------------------------------------------------
cat > src/mocks/formas_pagamento/listar.json <<'EOF'
{
  "success": true,
  "data": [
    { "id": 1, "descricao": "Dinheiro" },
    { "id": 2, "descricao": "Boleto" },
    { "id": 3, "descricao": "PIX" }
  ],
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 15. tabelas_preco/listar.json
# -----------------------------------------------------------------------------
cat > src/mocks/tabelas_preco/listar.json <<'EOF'
{
  "success": true,
  "data": [
    { "id": 1, "nome": "Padrão", "vigencia": "2026-12-31" },
    { "id": 2, "nome": "Atacado", "vigencia": "2026-12-31" }
  ],
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 16. produtos/listar.json
# -----------------------------------------------------------------------------
cat > src/mocks/produtos/listar.json <<'EOF'
{
  "success": true,
  "data": [
    { "id": 555, "codigo": "P555", "descricao": "Cabo Flexível 2,5mm",
      "familia": "Elétrica", "marca": "Sil", "unidade": "MT",
      "tabela_preco_padrao_id": 1, "preco_venda": 4.75 },
    { "id": 556, "codigo": "P556", "descricao": "Disjuntor 20A",
      "familia": "Elétrica", "marca": "Steck", "unidade": "UN",
      "tabela_preco_padrao_id": 1, "preco_venda": 32.90 }
  ],
  "error": null
}
EOF

# -----------------------------------------------------------------------------
# 17. Fim
# -----------------------------------------------------------------------------
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ Mocks criados com sucesso!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "▶ Árvore final:"
find src/mocks -type f | sort
echo ""
echo "▶ Total: $(find src/mocks -type f | wc -l) arquivos"
echo ""
