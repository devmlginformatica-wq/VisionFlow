# Prompt: Criar UI de Status de Sincronização

## Contexto
A infraestrutura offline está pronta. Clientes e Pedidos já salvam offline com `syncStatus`.
Agora precisamos mostrar isso visualmente para o usuário, sem alterar a regra de negócio das telas.

## Objetivo
Criar um componente visual reutilizável para exibir o status de sincronização e adicioná-lo aos cards de listagem de Cliente e Pedido.

## Arquivos a criar/alterar
1. `src/core/components/SyncStatusBadge.tsx`
   - Componente que recebe `syncStatus: 'synced' | 'pending' | 'error'`.
   - Se `synced`, pode não renderizar nada ou renderizar um ícone de nuvem com check (discreto).
   - Se `pending`, renderiza um ícone de relógio/nuvem com seta (amarelo/âmbar) e um tooltip ou texto "Pendente".
   - Se `error`, renderiza um ícone de alerta (vermelho) e texto "Erro ao sincronizar".
   - Use `lucide-react` para os ícones e Tailwind puro com as variáveis do tema.
   - Use i18n (adicionar chaves `sync.pending`, `sync.error`).

2. Alterar os cards de listagem para exibir o Badge:
   - Em `src/features/cliente/presentation/components/ClienteCard.tsx` (ou equivalente).
   - Em `src/features/pedido/presentation/components/PedidoCard.tsx` (ou equivalente).
   - Apenas adicione o `<SyncStatusBadge />` passando o `syncStatus` da entidade. Se o campo não existir na tipagem da View, faça o cast ou adicione opcional na interface da View.

3. Atualizar os arquivos de i18n com as chaves de sync.

## Restrições
- NÃO crie novos fluxos de tela (ex: modal de conflito). Apenas o indicador visual nos cards.
- Se precisar alterar o `ClienteCard` ou `PedidoCard`, apenas adicione a tag visual sem mexer no layout principal.