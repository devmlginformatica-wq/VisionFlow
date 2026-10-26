# Plano de Testes de QA — Vision Flow (PWA Offline-First)

**Versão do plano:** 1.0  
**Data:** 26/10/2026  
**Produto:** Vision Flow — aplicação de força de vendas  
**Objetivo:** validar de ponta a ponta os fluxos de um vendedor em condições online, offline e de reconexão, antes da publicação em produção.

## 1. Escopo e critérios de execução

Este plano cobre autenticação e sessão, navegação, clientes e endereços, pedidos e orçamentos, sincronização da fila local e instalação/uso do PWA. A execução deve ocorrer em ambiente de QA ou homologação isolado, com backend e dados descartáveis para testes. Não executar os casos destrutivos em contas ou dados reais.

### Como registrar o resultado

Para cada caso, marque **uma** opção e registre evidências (captura de tela, horário, ID do registro, log de rede ou resposta da API) quando houver falha:

- `[ ] PASS` — resultado observado corresponde ao esperado.
- `[ ] FAIL` — resultado observado diverge; abrir defeito com o ID do caso e as evidências.
- `Resultado: ____ | Evidência/defeito: __________________________________________`

### Ambiente e pré-condições

- [ ] Usar build candidata à produção e URL de homologação configurada para o backend correspondente.
- [ ] Confirmar versão/build do frontend, versão do backend, navegador, SO, dispositivo, horário e fuso.
- [ ] Usar usuário vendedor válido com empresa/tenant e permissões para clientes, pedidos, orçamentos e catálogos.
- [ ] Preparar clientes de teste, endereços, produtos com preço, condições/formas de pagamento, transportadora e tabela de preço válidos.
- [ ] Garantir que os registros usados em conflitos possam ser alterados diretamente no backend de QA.
- [ ] Usar CNPJs de teste controlados: um consultável e válido, um não encontrado/recusado, um já consultado para cache e outro nunca consultado.
- [ ] Em todos os testes offline, carregar a interface e os dados necessários enquanto online antes de interromper a rede. Separar explicitamente os testes de dados em cache e sem cache.
- [ ] Para alternar conectividade, usar DevTools/Playwright ou modo avião do dispositivo. Confirmar também a conectividade do backend; não assumir que desligar o Wi-Fi e manter dados móveis equivale a offline.
- [ ] Limpar dados de teste no backend ao final; não limpar IndexedDB, cache ou armazenamento entre passos de um caso, exceto quando o caso pedir um estado limpo.
- [ ] Anotar e preservar a fila local antes de recarregar ou limpar dados. Não apagar dados locais pendentes sem registrar IDs e payloads necessários para recuperação.

**Dispositivos/navegadores recomendados:** Chrome/Edge desktop (Chromium), Android Chrome instalado como PWA e Safari no iOS instalado na Tela de Início. Registrar diferenças de suporte do sistema operacional como observação, sem confundir limitação do navegador com falha funcional.

## 2. Autenticação e Sessão

### AUTH-01 — Login online válido

**Passos**
1. Com rede disponível, abrir `/login`.
2. Informar credenciais válidas do vendedor e submeter uma vez.
3. Observar a requisição de autenticação, o estado de carregamento e a navegação após a resposta.
4. Atualizar a página e abrir uma rota protegida diretamente.

**Esperado**
- O botão/indicador mostra carregamento e não permite submissões duplicadas.
- Login bem-sucedido cria sessão autenticada e redireciona à rota inicial ou à rota protegida originalmente solicitada.
- A interface do vendedor e os dados do tenant correto são exibidos; nenhuma credencial ou token aparece em texto na tela/log.
- A sessão continua válida após atualização enquanto o token ainda for válido.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### AUTH-02 — Credenciais inválidas e validação de formulário

**Passos**
1. Tentar login com senha incorreta; depois repetir com e-mail vazio ou formato inválido.
2. Confirmar que o usuário permanece na tela de login.
3. Corrigir os dados e repetir com credenciais válidas.

**Esperado**
- Erro de autenticação/validação aparece de forma compreensível e acessível; nenhum estado autenticado é criado.
- O erro anterior é limpo ou atualizado após nova tentativa; submissões consecutivas não travam o formulário.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### AUTH-03 — Sessão expirada: resposta HTTP 401 online

**Passos**
1. Autenticar online e abrir uma tela protegida.
2. No backend de QA, revogar/expirar o token ou configurar a próxima chamada autenticada para responder HTTP 401.
3. Com a rede confirmadamente online, provocar uma chamada protegida (por exemplo, atualizar a listagem).
4. Inspecionar a navegação, o armazenamento de sessão e a chamada subsequente.

**Esperado**
- A resposta 401 online encerra a sessão e envia o usuário para login com indicação de sessão expirada.
- Token/dados de autenticação deixam de ser usados; a tela protegida não permanece acessível como se autenticada.
- Após novo login, as chamadas usam o token novo. Não aceitar loop infinito de redirecionamento nem uma tela protegida em estado parcialmente autenticado.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### AUTH-04 — Queda de rede durante o login

**Passos**
1. Abrir `/login` online e preencher credenciais válidas.
2. Interromper a rede imediatamente antes ou durante o envio.
3. Observar mensagem, indicador de carregamento e armazenamento de sessão.
4. Restaurar a rede e enviar novamente.

**Esperado**
- A falha de transporte é comunicada; o formulário deixa o estado de carregamento e permite nova tentativa.
- Não cria sessão parcial nem redireciona como login bem-sucedido.
- Ao restaurar a rede, uma nova tentativa funciona sem recarregar o app (salvo mensagem explícita de erro).

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### AUTH-05 — Token expirado durante operação offline

**Passos**
1. Autenticar online e carregar clientes/pedidos necessários para uso offline.
2. Desconectar a rede e manter o app aberto.
3. Fazer uma operação local suportada e, se possível, deixar o token expirar no relógio/backend enquanto o dispositivo permanece offline.
4. Navegar entre telas e atualizar/reabrir o app ainda offline.
5. Restaurar a rede e observar a resposta de autenticação durante a sincronização.

**Esperado**
- Enquanto offline, o vencimento temporal do token ou ausência de resposta HTTP **não** desloga o vendedor: shell e dados cacheados permanecem acessíveis.
- Alterações locais continuam marcadas pendentes e não são descartadas.
- Quando online, se a API responder 401/403, a sessão é encerrada de acordo com AUTH-03; a fila não é apresentada como sincronizada nem apagada por essa falha.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

## 3. Navegação e Performance

### NAV-01 — Alternância repetida entre Clientes, Pedidos e Orçamentos

**Passos**
1. Autenticar e carregar as três listas.
2. Alternar entre `/app/clientes`, `/app/pedidos` e `/app/orcamentos` ao menos 20 vezes, incluindo cliques rápidos e alternância pelo menu.
3. Repetir com uma lista carregando, com dados e vazia.
4. Abrir/fechar editor/modal, voltar à lista e repetir a navegação.
5. Manter Console e aba Network abertas durante o teste.

**Esperado**
- Sem exceções de DOM, especialmente `insertBefore`, `removeChild`, `NotFoundError` ou erro de renderização React.
- Menu, rota, título e conteúdo correspondem à seção selecionada; nenhuma tela fica em branco ou sobreposta.
- Repetir navegação rápida não cria requisições duplicadas que corrompam estado nem perde filtros/scroll que devam ser preservados.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### NAV-02 — Loading, skeleton e estado vazio

**Passos**
1. Simular rede lenta (por exemplo, throttling) ao abrir cada lista.
2. Observar o primeiro frame, o estado de carregamento, resposta e estado final.
3. Repetir com resposta vazia legítima, erro de servidor e dados previamente cacheados.
4. Fazer reload em cada condição.

**Esperado**
- Durante a carga, skeleton/loading aparece; “Nenhum registro encontrado”/empty state não pisca antes da resposta que confirma lista vazia.
- Lista vazia só aparece após carregamento concluído com zero registros.
- Em erro, mostrar estado de erro e ação de tentar novamente, sem apresentar falha como lista vazia.
- Com dados locais, a interface apresenta o cache sem atraso artificial; refresh remoto em background não apaga os dados existentes ao falhar.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### NAV-03 — Filtros, retorno e responsividade

**Passos**
1. Aplicar filtro e busca em clientes e pedidos; abrir um registro e voltar.
2. Repetir nas rotas de orçamento.
3. Repetir em viewport mobile (<768 px), tablet (768–1023 px) e desktop (>=1024 px).

**Esperado**
- Filtro/consulta e posição da lista são preservados no retorno conforme a navegação esperada.
- Campos, ações e modais permanecem operáveis; sem conteúdo cortado, scroll horizontal indevido ou botões inacessíveis.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

## 4. Clientes (CRUD e Relações)

### CLI-01 — Criar cliente ONLINE

**Passos**
1. Em `/app/clientes`, criar cliente com nome/razão social e telefone obrigatórios, documento válido e dados opcionais.
2. Se aplicável, consultar o CNPJ antes de salvar; revisar os campos preenchidos.
3. Salvar e observar a resposta, a listagem e o detalhe após reabrir.

**Esperado**
- Validações obrigatórias impedem salvar dados inválidos e indicam o campo.
- Cliente é persistido na API, aparece uma única vez na lista e reabre com os mesmos dados.
- Estado fica sincronizado (sem selo “Pendente”); documento e telefone mantêm a formatação/normalização esperada.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### CLI-02 — Editar cliente ONLINE

**Passos**
1. Abrir cliente conhecido, alterar campos editáveis e salvar.
2. Atualizar a página e consultar novamente.

**Esperado**
- Valores persistem no backend e no app; não é criado cliente duplicado.
- Alteração confirmada não mantém selo de pendência. Títulos/áreas somente leitura não são alterados pela edição.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### CLI-03 — Excluir cliente ONLINE

**Passos**
1. Usar cliente descartável sem relações bloqueadoras.
2. Acionar exclusão e confirmar o diálogo de confirmação.
3. Atualizar a lista e tentar abrir a rota direta do registro excluído.

**Esperado**
- Exclusão exige confirmação, chama a API uma única vez e remove o registro da lista.
- Mensagem clara em caso de erro; não remover visualmente como sucesso caso a API recuse.
- Relações/restrições do backend (por exemplo, cliente com pedido) são apresentadas sem perda dos dados do cliente.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### CLI-04 — Consulta de CNPJ ONLINE, cacheada e não cacheada

**Passos**
1. Com rede, consultar CNPJ de teste nunca consultado e observar a resposta da API.
2. Confirmar preenchimento de razão social, fantasia, IE, e-mail, telefone e dados de endereço retornados.
3. Consultar o mesmo documento novamente; comparar a resposta e evitar duplicação/alteração de campos não retornados.
4. Consultar documento inválido/inexistente e documento com máscara/formatação diferente.

**Esperado**
- A consulta online normaliza o documento (apenas dígitos na chamada), apresenta resultado coerente e grava cache utilizável offline.
- Dados faltantes não apagam campos existentes inadvertidamente; erros de validação/indisponibilidade não preenchem dados falsos nem confirmam sucesso.
- Máscara é aceita sem gerar documento diferente do mesmo CNPJ normalizado.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### CLI-05 — Consulta de CNPJ OFFLINE com e sem cache

**Passos**
1. Consultar online um CNPJ e confirmar que a consulta terminou; desligar a rede.
2. Consultar o mesmo CNPJ com e sem pontuação.
3. Consultar um CNPJ nunca consultado neste dispositivo.
4. Repetir após fechar e reabrir o app offline.

**Esperado**
- Cache existente retorna os dados previamente consultados, inclusive após reabertura offline.
- CNPJ sem cache informa que a consulta exige conexão; não inventa dados, não trava o formulário e não derruba a sessão.
- CNPJ em cache e sem cache são diferenciados pelo valor normalizado, não por sua máscara.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### CLI-06 — Endereços ONLINE e OFFLINE

**Passos**
1. Abrir cliente online, acessar aba Endereços e carregar os endereços; criar/editar endereço para exercitar leitura e atualização.
2. Desconectar e abrir o mesmo cliente; consultar os endereços cacheados.
3. Abrir modal, cancelar com botão, ESC e clique no overlay; testar adicionar/editar sem salvar e validar campos de CEP.
4. Tentar abrir endereço de cliente que nunca teve endereços carregados/cacheados.

**Esperado**
- Endereços do cliente carregados online ficam disponíveis offline e vinculados ao cliente correto.
- Modal permite ver/editar os dados cacheados; cancelamento não altera URL nem persiste mudanças.
- CEP sem rede não aparenta ter sido consultado; valores editados offline devem seguir a regra de persistência/sincronização definida para o escopo e não sumir silenciosamente.
- Sem cache, mostrar lista vazia apenas se confirmada localmente; se a informação é desconhecida, não alegar que o cliente não possui endereços.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### CLI-07 — Criar, editar e excluir cliente OFFLINE

**Passos**
1. Desconectar a rede e criar cliente com os campos mínimos válidos.
2. Confirmar o registro local; editar um campo e salvar.
3. Excluir o cliente local ainda offline.
4. Repetir em cliente distinto: manter a criação/edição pendente para testar sincronização na reconexão (CLI-08).
5. Fechar e reabrir o app offline antes de confirmar persistência.

**Esperado**
- Cliente criado/alterado localmente aparece imediatamente e recebe selo “Pendente”.
- Dados e status sobrevivem ao reload/reabertura.
- Excluir criação ainda não sincronizada remove o registro e suas operações locais relacionadas, sem enviar create seguido de delete à API após reconexão.
- Erro ao persistir/enfileirar deve ser visível e não pode aparentar sucesso sincronizável.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### CLI-08 — Sincronizar cliente pendente ao voltar online

**Passos**
1. Criar ou editar cliente offline conforme CLI-07.
2. Registrar ID local temporário, valores e selo pendente.
3. Restaurar a rede e aguardar a sincronização automática; se disponível, acionar sincronização manual.
4. Consultar a API/lista online, reabrir o cliente e atualizar.

**Esperado**
- Operação é enviada à API, recebe ID definitivo e o registro local é remapeado; relações/rotas passam a usar o ID definitivo.
- Cliente não duplica na lista; selo muda de “Pendente” para sincronizado após sucesso.
- Dados mais recentes permanecem e operação correspondente sai da fila.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

## 5. Pedidos e Orçamentos (CRUD e Catálogos)

### PED-01 — Criar Pedido ONLINE e Orçamento ONLINE

**Passos**
1. Criar pedido com cliente, endereços, condição e forma de pagamento, transportadora, frete e ao menos um produto válido.
2. Conferir valores/totais e finalizar; repetir em `/app/orcamentos` como orçamento.
3. Atualizar listas, abrir cada registro e validar seu tipo.

**Esperado**
- Pedido e orçamento usam fluxo apropriado e aparecem na listagem correspondente.
- Campos relacionados são coerentes com o cliente; seletores de endereço só ficam disponíveis após selecionar cliente.
- Adicionar/editar/remover item recalcula totais; valores respeitam formato BRL e dados/itens persistem após reload.
- Orçamento permanece orçamento e pedido permanece pedido, sem conversão acidental.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### PED-02 — Catálogo de produtos ONLINE e OFFLINE

**Passos**
1. Online, buscar produto por descrição e código e abrir resultado; adicionar item e verificar preço/tabela.
2. Confirmar cache dos catálogos e produtos carregados.
3. Offline, buscar produto já carregado em cache e adicionar ao pedido.
4. Ainda offline, buscar produto que nunca foi carregado/cacheado.
5. Repetir com busca sem resultados, termos parciais, acentos e alteração de quantidade/desconto.

**Esperado**
- Online, resultados correspondem à consulta e ao catálogo do tenant; preço e detalhes exibidos são consistentes.
- Offline, produto em cache pode ser encontrado e usado; produto sem cache informa necessidade de conexão sem travar a tela.
- Alterações respeitam validação de quantidade/preço/desconto e atualizam os totais sem duplicar itens por buscas repetidas.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### PED-03 — Criar Pedido OFFLINE

**Passos**
1. Antes de ficar offline, carregar pedido/lista, cliente, endereços e catálogos necessários.
2. Desconectar; criar pedido com produto cacheado, salvar/finalizar conforme fluxo disponível.
3. Anotar valores, quantidade de itens e status; recarregar e reabrir o pedido local.

**Esperado**
- Pedido é gravado localmente e aparece imediatamente com selo “Pendente”.
- Itens, cliente, referências, totais e tipo sobrevivem à reabertura.
- Fluxo não apresenta confirmação de persistência no backend enquanto não houver sync.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### PED-04 — Editar Pedido ONLINE e OFFLINE

**Passos**
1. Online, editar pedido existente: alterar dados gerais, item, quantidade, desconto ou frete; salvar e reabrir.
2. Selecionar outro cliente e confirmar atualização dos endereços disponíveis.
3. Offline, editar um pedido previamente cacheado e alterar dados/itens; reabrir após reload.
4. Reconectar e confirmar a operação pendente.

**Esperado**
- Online, mudanças persistem e totais recalculam corretamente; não há duplicação do pedido.
- Offline, mudanças locais aparecem imediatamente, permanecem após reload e recebem status pendente.
- Após sync bem-sucedido, backend e app exibem os mesmos dados e status sincronizado.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### PED-05 — Conflito de edição: regra `newer-wins`

**Regra de aceite:** a comparação usa `updated_at`; a versão remota só vence se seu timestamp for **estritamente posterior** ao timestamp local. Timestamp local deve ser o `updated_at` do payload, ou o horário de criação da operação se ausente. Empate não significa “remoto mais novo”.

**Passos**
1. Carregar e cachear um pedido conhecido; desconectar.
2. Editar offline e salvar alteração A. Registrar timestamp local `L` e conteúdo.
3. Em outro cliente/sessão conectado ao backend de QA, alterar o mesmo pedido para conteúdo B e garantir `updated_at` remoto `R > L`.
4. Reconectar, deixar a fila sincronizar e abrir o pedido.
5. Repetir em registro separado com timestamp remoto anterior a `L`.
6. Repetir com timestamps iguais (se o backend permitir), e conferir os timestamps retornados em vez de inferir pelo relógio visual.

**Esperado**
- Se `R > L`, valor remoto B é mantido; update local conflitante não sobrescreve a versão remota, e operação pendente é removida/status deixa de indicar sync pendente conforme implementação.
- Se `R < L`, a alteração local A é enviada e passa a ser a versão persistida.
- Se `R = L`, a condição “remoto mais novo” é falsa; verificar se a API aceita update local e se não há perda silenciosa. Registrar qualquer regra diferente como desvio.
- Em todos os casos, nenhuma versão é duplicada; a tela mostra estado coerente com o backend e o resultado pode ser explicado pelos timestamps capturados.

- [ ] PASS — [ ] FAIL  
Resultado/evidência (IDs, conteúdo A/B, L/R): ___________________________________

### PED-06 — Excluir Pedido OFFLINE

**Passos**
1. Com pedido já sincronizado e cacheado, ficar offline.
2. Excluir o pedido e confirmar o diálogo.
3. Inspecionar lista/status local e reabrir o app offline; reconectar depois.
4. Repetir separadamente com pedido criado localmente ainda pendente.

**Esperado**
- Pedido existente removido localmente e exclusão enfileirada; a interface indica pendência conforme estado visual previsto.
- Após reconexão, delete chega ao backend e operação sai da fila.
- Pedido criado localmente e excluído antes do sync não deve ser criado no backend.
- Falha na exclusão remota não deve reaparecer como exclusão confirmada no servidor; estado de erro é comunicável e recuperável.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

## 6. Mecanismo de Sync (Fila e Retentativas)

### SYNC-01 — Várias operações offline e ordem FIFO

**Passos**
1. Desconectar a rede e, nesta ordem, criar Cliente A, Pedido A, Cliente B e Pedido B. Se possível, adicionar também uma edição/deleção de registro existente.
2. Registrar ordem de criação, IDs locais temporários, payloads e horários; garantir que todas estejam pendentes.
3. Fechar/reabrir o app offline e confirmar que todas as operações ainda estão presentes.
4. Reconectar, observar chamadas em Network/Logs do backend e consultar a ordem de processamento.
5. Verificar IDs remapeados de clientes e pedidos, inclusive referências cliente-pedido.

**Esperado**
- Todas as operações persistidas são processadas sem perda ou duplicação; chamadas respeitam FIFO por horário de enfileiramento, preservando dependências (por exemplo, cliente antes do pedido que o referencia).
- Criações bem-sucedidas recebem IDs definitivos; referências no pedido apontam para o cliente correto.
- Ao fim, nenhuma operação concluída permanece pendente e todos os selos refletem sincronização.
- Registrar especificamente operações com timestamps idênticos: sua ordem também deve ser determinística e compatível com a ordem de enqueue; qualquer inversão é falha.

- [ ] PASS — [ ] FAIL  
Resultado/evidência (ordem local/servidor): _____________________________________

### SYNC-02 — HTTP 500/falha de servidor mantém fila e retenta

**Passos**
1. Criar uma alteração offline que gere operação pendente.
2. Restaurar rede e configurar backend/proxy de QA para responder HTTP 500 à operação de sync.
3. Observar fila, badge, contador/tentativa e mensagem/log.
4. Deixar app aberto e aguardar nova tentativa prevista ou acionar retry/reconectar conforme mecanismo de sync.
5. Corrigir backend para sucesso e provocar nova tentativa.

**Esperado**
- HTTP 500 é tratado como falha transitória: operação permanece na fila, status do registro continua pendente e tentativa/erro ficam registradas.
- Não há loop agressivo de chamadas nem indicador de sync concluído.
- Após backend voltar, a operação é tentada novamente, enviada uma única vez com efeito final idempotente e removida da fila após sucesso.

- [ ] PASS — [ ] FAIL  
Resultado/evidência (status/attempts antes e depois): _____________________________

### SYNC-03 — HTTP 400/erro de validação remove da fila e marca erro

**Passos**
1. Criar operação pendente que possa ser rejeitada (usar fixture controlada, nunca dados de vendedor real).
2. Reconectar e configurar o backend para responder HTTP 400 com erro de validação legível.
3. Conferir registro no app, estado da fila e retorno/log da API.
4. Corrigir os dados localmente (ou criar nova operação válida) e avaliar o fluxo de recuperação previsto.

**Esperado**
- HTTP 400 é tratado como erro de negócio: operação rejeitada é removida da fila, registro recebe status “Erro” e a causa fica visível/diagnosticável.
- O app não insiste automaticamente na mesma operação inválida nem a mostra como sincronizada.
- O erro não apaga dados locais; há caminho claro para corrigir e reenviar, sem duplicar a operação rejeitada.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### SYNC-04 — Reinício, concorrência e sessão inválida durante sync

**Passos**
1. Com operações pendentes, fechar/atualizar o app no meio da sincronização e reabrir.
2. Disparar sync automática por abertura/reconexão e, se disponível, manualmente quase ao mesmo tempo.
3. Repetir com backend respondendo 401/403 a uma operação.

**Esperado**
- Reinício não perde nem duplica operações; mecanismo impede processamento concorrente duplicado.
- Falha de autenticação pausa a fila e não é classificada como erro de validação nem transforma operações em sucesso.
- Online, sessão segue a regra AUTH-03; offline, a sessão continua disponível e a fila preservada até ser possível autenticar/sincronizar.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

## 7. PWA (Instalação e Offline Shell)

### PWA-01 — Instalação em Android/iOS

**Passos**
1. Abrir a URL segura de QA no Android Chrome e instalar pelo prompt/menu “Instalar app”.
2. Abrir o app instalado e verificar nome, ícone, modo standalone e rota inicial.
3. No iOS, abrir no Safari, usar Compartilhar → “Adicionar à Tela de Início” e abrir pelo ícone.
4. Fechar e abrir novamente; confirmar atualização da versão após publicar build candidata.

**Esperado**
- Manifest, nome, ícone e `start_url` identificam Vision Flow; abertura ocorre em modo de app sem chrome do navegador quando suportado.
- Não instala página de erro/versão antiga; atualizar app não apaga registros pendentes.
- Registrar diferenças específicas de instalação, atualização e cache por plataforma.

- [ ] PASS — [ ] FAIL  
Resultado/evidência (dispositivo/SO/versão): _____________________________________

### PWA-02 — Offline shell após fechar o app

**Passos**
1. Online, abrir o app e visitar home e telas essenciais; aguardar instalação/ativação do Service Worker e cache de assets.
2. Fechar completamente o app (remover da lista de recentes quando aplicável).
3. Ativar modo avião/desligar Wi-Fi e dados móveis.
4. Abrir o app pelo ícone instalado e navegar entre as telas shell e dados locais carregados.
5. Repetir após update do PWA e em primeira abertura sem cache.

**Esperado**
- Com assets já cacheados, shell/interface carrega sem conexão e apresenta conteúdo local disponível, sem tela de erro do navegador.
- Dados que não estejam no IndexedDB/cache não são apresentados como carregados; informar indisponibilidade sem travar o shell.
- Primeira abertura sem qualquer cache offline pode não carregar; registrar como limitação de bootstrap, não confundir com comportamento após cache inicial.

- [ ] PASS — [ ] FAIL  
Resultado/evidência: ____________________________________________________________

### PWA-03 — Service Worker não intercepta/cacheia respostas de API

**Passos**
1. Online, abrir DevTools → Application/Storage e confirmar Service Worker ativo; abrir Network com preservação de log.
2. Provocar chamadas para autenticação, clientes, pedidos, orçamentos e catálogos; observar URL, método, status, origem da resposta e indicação de Service Worker/cache.
3. Repetir com rede offline e observar falha de chamada API, mantendo navegação do shell.
4. Restaurar a rede e atualizar uma lista para confirmar resposta atual do backend, não resposta stale servida de cache HTTP/SW.
5. Verificar endpoints com e sem prefixo base configurado em homologação, se aplicável.

**Esperado**
- Chamadas de API são `NetworkOnly`: online chegam ao backend e offline falham explicitamente/entram nos fluxos offline-first; SW não retorna payload antigo como se fosse resposta atual.
- Rotas de API não caem no fallback de navegação do app (`index.html`); sem resposta HTML “bem-sucedida” para endpoint de API.
- Assets e navegação do shell continuam cacheáveis/offline; a exclusão de API não quebra carregamento do PWA.

- [ ] PASS — [ ] FAIL  
Resultado/evidência (endpoint, método, status, fonte): ____________________________

## 8. Fechamento da rodada

- [ ] Todos os casos executados ou marcados como não aplicáveis com justificativa.
- [ ] Defeitos abertos referenciam ID do caso, passos, resultado obtido/esperado e evidência reproduzível.
- [ ] Operações de teste sincronizadas ou removidas com segurança; fila local e registros de QA revisados.
- [ ] Resultado final da rodada: `[ ] APROVADO` · `[ ] REPROVADO` · `[ ] APROVADO COM RESSALVAS`
- **QA responsável:** ____________________  **Data:** __________  **Build:** ____________________
- **Ressalvas/bloqueadores:** _________________________________________________________________
