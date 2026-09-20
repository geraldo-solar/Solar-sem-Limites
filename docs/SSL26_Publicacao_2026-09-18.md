# SSL26 — publicação das proteções de saída

18/09/2026, instalação inicial conferida por volta de 13h43 de Belém, seguida da correção de contatos legados no descadastro. **Instalação parcial em produção; campanha e sincronização continuam desligadas.** Este registro substitui os estados anteriores “migração não aplicada / código apenas local” para os itens abaixo. Não altera preço, regulamento, datas, guia ou outras campanhas.

## Resultado da publicação

**Aceite posterior, sem outro deploy, às 14h58:** usuário concluiu a prévia; marcador do botão local QA conferido no painel ManyChat e descadastro preservado no ERP/Brevo. Preparação geral atual **70%**; campanha/processadores continuam desligados. Botão local e callback foram testados separadamente, não como jornada integral. [Provas atuais](SSL26_Callback_HTTPS_2026-09-18.md). A referência a 69% a seguir é da publicação anterior a essa confirmação.

**Publicação posterior atual:** mesma revisão ERP `7fd263b` republicada com somente `SSL26_CONTROLS_ENABLED=true`, em `dpl_5X9YZaVnSx6tX9jfH1i9eJiGyoU9`, READY, build 80 s, alias oficial conferido. Sem código novo ou upload de alterações locais. Sincronização, supressão automática e auditoria geral continuam false. Testes HTTPS e pelo ManyChat retornaram 202 para o pedido já registrado de Geraldo, sem reiniciar trabalhos ou enviar mensagens. Site não republicado. [Relatório atual e teste de botão pendente](SSL26_Callback_HTTPS_2026-09-18.md). **As tabelas e provas abaixo registram as publicações anteriores. Preparação atual: 69%.**

**Teste posterior autorizado, sem novo deploy:** em 18/09 às 14h16 de Belém, saída apenas do contato de Geraldo confirmada em ManyChat/ERP/Brevo, usando o código publicado em execução isolada com serviços reais. Gates de produção mantidos desligados; nenhuma mensagem enviada. [Evidências e limitações](SSL26_Teste_Saida_2026-09-18.md). As referências abaixo a “nenhum contato alterado” descrevem a instalação anterior a esse teste.

| Item | URL | Destino | Status | Commit | Tecnologia | Build |
|---|---|---|---|---|---|---|
| Página | https://www.hotelsolar.tur.br/solarsemlimitescadastro | Produção | READY | `987ac2c` | React/Vite estático + API Node | 24 s |
| ERP | https://erp-hotel-solar.vercel.app | Produção | READY | `7fd263b` | Next.js 16.1.6 | 70 s |

- Site: `dpl_9wdCEk4VskkPVLQQacqmrdF1GSfb`, URL imutável `https://sitehotelsolar-54i6q2mq2-geraldo-barros-projects-7276ca26.vercel.app`.
- ERP: `dpl_BTF3LJ8nfX55EQkq9fAuyxEACv5C`, URL imutável `https://erp-hotel-solar-2f5sfzurv-geraldo-barros-projects-7276ca26.vercel.app`.
- ERP imediatamente anterior, preservado para reversão: `dpl_8txiwhAB3fQ54eAuSdFJpXWNGUb5` / `a7f3ace`, build 77 s.
- Revisões anteriores preservadas para eventual reversão: site `dpl_DUb9bdnpiaL59UJfGCKmgNj5R9S7` / `dce530f`; ERP `dpl_FqGqU2otqnFPjLcmpKaD43gyPMPJ` / `9408202`.

Publicação por commits seletivos em cópias isoladas, não por envio integral dos diretórios de trabalho. No site foram alterados apenas `api/capture-lead.ts`, o apontamento de bundle do cadastro e um novo bundle compilado. Arquivos antigos e guia foram preservados. No ERP, 13 arquivos de código/testes/documentação SSL26, sem alterações na integração FNRH.

## Instalado e verificado

- Rodada seguinte: corrigida a localização de contatos legados na fila de saída, com confirmação de conta e WhatsApp real após busca nos campos auditados. Publicados somente código, testes e documentação da correção (`7fd263b`). 88 testes ERP, tipagem e diff aprovados; três rotas conferidas com 401 sem chave/503 autenticado e corpo vazio. Logs error do novo deployment filtrados para SSL26, janela 1 h: zero registros na consulta. Site não republicado. [Auditoria parcial e preparação do teste real](SSL26_Auditoria_ManyChat_2026-09-18.md).

- Supabase `sxplhqjnalnckzijvkjm`: aplicada a migração `202609181600_ssl26_suppression_delivery.sql`. As duas novas tabelas responderam 200 para servidor e 401 para público. Sete funções: execução negada a anon/authenticated e permitida a service_role. **Não reaplicar a migração anterior da ponte depois desta: ela contém uma versão antiga da função de controle.**
- Brevo: criado e relido `SSL26_OPT_OUT`, atributo normal booleano. Conta Hotel Solar e lista 24 `SSL26_LEADS`, pasta 23, conferidas. Nenhum contato alterado.
- ERP: segredos exclusivos do callback e worker instalados como Secret somente em produção; lista Brevo 24 configurada. `SSL26_CONTROLS_ENABLED=false`, `SSL26_SUPPRESSION_ENABLED=false`; sincronização e auditoria continuam false. Chaves existentes de ingestão/ManyChat e demais integrações preservadas.
- Página, novo bundle `index-0W1W_peK.js` e PDF: HTTP 200. A página publicada abriu no navegador com formulário e conteúdo. GET da API: 405, sem cadastro enviado.
- Callback, processador de saída e processador da ponte: sem credencial 401; com credencial correta e corpo vazio 503, por controle de ativação desligado. Respostas `no-store, private`. Nenhum dado de contato submetido nesses testes.
- Repetidos 83 testes ERP (incluindo as duas suítes PostgreSQL, nenhuma ignorada), 20 de API da landing, TypeScript ERP e build da landing: aprovados. Os 8 testes de interface aprovados na rodada anterior não foram repetidos em produção. Não são comprovação de supressão real entre provedores.

## ManyChat: chave salva e autenticação conferida

Conta Hotel Solar, fluxo `SSL26_02_WA_BOAS_VINDAS`, etapa `SSL26 | Registrar saída WA`. Mantidas as três ações anteriores: tag de saída, data/hora e origem. Adicionada depois delas uma requisição externa:

- POST `https://erp-hotel-solar.vercel.app/api/ssl26/manychat-control`.
- `Content-Type: application/json`.
- JSON com apenas `subscriberId`, vinculado pelo seletor ao **ID do contato** nativo, sem ID fixo e sem Full Contact Data.
- `Authorization` preenchido por Geraldo, que confirmou “salvei”. Reabertura do diálogo confirmou formato Bearer correto e ausência do marcador. Valores foram ocultados nas observações; nenhum segredo é registrado neste documento.
- O contato de teste selecionado no editor foi confirmado por consulta somente de leitura à API ManyChat: ID/conta e WhatsApp real coincidiram exatamente com o destinatário autorizado por Geraldo. Não se confiou somente no nome.
- Antes do teste, a rota de produção foi conferida com corpo vazio: 503 `integration_disabled`. Em seguida, “Solicitação de teste” no próprio editor ManyChat enviou somente o ID nativo do contato e recebeu o mesmo 503 `integration_disabled`. O código autentica antes de verificar esse bloqueio: a resposta comprova chegada/autenticação, não execução do descadastro.
- Nenhum fluxo foi executado/publicado, nenhuma tag/contato foi alterada, nenhuma saída foi registrada e nenhuma mensagem foi enviada. O diálogo foi fechado sem modificar a configuração salva por Geraldo.

**Ação de Geraldo concluída:** segredo exclusivo do callback salvo e validado. Não é a API key do ManyChat. Não copiar a chave para conversa, URL ou documento público. Os controles de execução continuam desligados; não publicar o fluxo antes da auditoria e homologação completa.

O arquivo privado foi criado com permissão 600 e está ignorado pelo Git. O editor ManyChat ficou disponível para a próxima etapa, com fluxo salvo como rascunho.

## Observabilidade pós-publicação

- Consulta de logs com nível error, janela de 1 h, restrita a cada novo deployment e às rotas `/api/ssl26` e `/api/capture-lead`: zero registros encontrados. É uma amostra inicial, não garantia de ausência de problemas futuros.
- Drains de logs: não verificados nesta etapa.
- Monitoramento recorrente: não instalado; conciliação e processamento automático ainda pendentes.
- O site já apresentava diagnóstico de tipagem não bloqueante para `@vercel/node` no build anterior. Esta publicação não corrige esse assunto nem declara a tipagem completa do site limpa.

## O que ainda impede a ativação

1. Chave no rascunho e autenticação concluídas. Falta auditoria dos gatilhos existentes; não marcar auditoria como pronta somente para remover o bloqueio.
2. Homologar callback, processamento por provedor, audiência Brevo sem retirados e saída antes/durante boa-vinda, usando somente destinatário autorizado.
3. Conectar pausa de atendimento, comprador, saída por texto e descadastro iniciado no Brevo. Não é sincronização bidirecional completa.
4. Conectar o registro de boa-vinda única a um disparador controlado; tratar janela de WhatsApp/modelo e resultado incerto.
5. Definir reprocessamento/conciliação da fila, captura antes de chegar ao ERP e contatos novos/legados não identificáveis. Não há scheduler automático nesta versão.

Uma saída pendente somente no ERP ainda não é conhecida pela landing antes de chegar ao Brevo. Os controles preventivos publicados não substituem esse caminho completo. **Estimativa de preparação mantida em 67%; não liberar anúncios ou mensagens com base apenas nos testes locais ou no status READY.**

## Nota para a próxima manutenção

Cópias usadas na publicação: `/private/tmp/ssl26-release.xnMS4U/erp` e `/private/tmp/ssl26-release.xnMS4U/sitehotelsolar`. Os diretórios originais de trabalho foram preservados, incluindo alterações não relacionadas. O Git do ERP original ainda tem base local `9408202` e alterações não commitadas; reconciliar com o remoto `7fd263b` antes de nova publicação, sem reset destrutivo. O repositório `Solar-sem-Limites` da landing é distinto de `sitehotelsolar`, que atende o domínio oficial.
