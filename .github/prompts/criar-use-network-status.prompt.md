# Prompt: Criar useNetworkStatus e NetworkBadge

## Contexto
Iniciando a fase offline-first. Precisamos detectar o status da rede para a UI e para o motor de sincronização.

## Objetivo
Criar a infraestrutura básica de detecção de rede, sem tocar em Dexie ou repositórios ainda.

## Arquivos a criar/alterar
1. `src/core/utils/useNetworkStatus.ts`
   - Hook que retorna `{ isOnline: boolean }`
   - Escuta `navigator.onLine` no mount
   - Escuta os eventos `'online'` e `'offline'` do `window`
   - Remove listeners no unmount
   - Sem dependências externas

2. `src/core/components/NetworkBadge.tsx`
   - Componente visual pequeno que mostra "Online" ou "Offline"
   - Usa `useNetworkStatus`
   - Usa i18n (chaves: `network.online`, `network.offline`)
   - Tailwind puro, usando as cores do tema (turquesa quando online, vermelho/âmbar quando offline)
   - Máximo 50 linhas

3. Adicionar chaves de i18n em:
   - `src/i18n/locales/pt_BR.json` (ou caminho correspondente do projeto)
   - `src/i18n/locales/en.json`
   (Entregar os arquivos JSON completos atualizados)

4. Modificação mínima em `src/core/shell/TopBar.tsx` (ou equivalente)
   - Adicionar `<NetworkBadge />` na área de ações
   - Cole o arquivo completo atualizado

## Restrições
- Não crie Dexie, sync queue ou repositórios offline ainda.
- Não refatore nada além do necessário.
- Se o caminho de i18n ou TopBar for diferente, PERGUNTE antes de gerar.