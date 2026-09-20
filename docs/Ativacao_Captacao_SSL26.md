# Ativação da captação — Solar Sem Limites 2026

## Objetivo

Colocar a landing `/solarsemlimitescadastro` em produção sem misturar os leads de novembro de 2026 com compradores antigos, reservas ou atendimentos correntes do Hotel Solar.

## Situação atual — 18/09/2026, após execução do SQL

- Geraldo aplicou a migração; quatro tabelas vazias e cinco funções SSL26 conferidas no Supabase do ERP. Servidor autorizado; chamadas públicas às tabelas/funções recusadas (401 / `42501`).
- ERP publicado: commit `9408202`, deployment `dpl_FqGqU2otqnFPjLcmpKaD43gyPMPJ`, **READY**, build Next.js em aproximadamente 2 minutos.
- Site publicado: commit `dce530f`, deployment `dpl_DUb9bdnpiaL59UJfGCKmgNj5R9S7`, **READY**, build da API Node em 15 segundos. Layout/guia não alterados.
- Segredo exclusivo compartilhado cadastrado como Secret em produção: `SSL26_INGEST_TOKEN` no ERP / `LEAD_WEBHOOK_TOKEN` no site. URL `https://erp-hotel-solar.vercel.app/api/ssl26/ingest`. Nenhuma chave existente substituída ou exibida.
- Recebimento habilitado (`SSL26_INGEST_ENABLED=true`); sincronização e auditoria ManyChat continuam `false`. Controle/worker sem tokens; sem processamento automático, inscrição ManyChat ou WhatsApp.
- Provas sem gravação: receptor reconheceu a chave e respondeu 400 a corpo inválido; sem chave respondeu 401. Site/página/guia disponíveis; perfil sem comprovante recusado com 403 / `no-store`. Banco estava com zero leads na conferência.
- **Teste real de cadastro/perfil/e-mail concluído em 18/09:** Geraldo cadastrou-se às 10h51 e escolheu `ja_hospedou`. Consulta ao banco às 10h53 confirmou um único cadastro para o e-mail autorizado, WhatsApp correspondente, consentimento versionado e os dois eventos (captura/perfil). Logs da página: HTTP 200, `integration: accepted` em ambos e `emailDelivery: accepted` na captura. Geraldo confirmou depois, nesta conversa, que recebeu o e-mail deste cadastro. ManyChat permanece desativado; na última conferência os eventos estavam `pending`, com zero tentativas e sem vínculo. Nenhum reenvio, novo cadastro ou alteração remota foi feito para registrar essa confirmação.
- Build do site manteve diagnóstico não bloqueante de tipos `@vercel/node`, também presente na publicação anterior. Não é evidência de falha em tempo de execução, mas não equivale a checagem de tipos limpa do repositório público.

## Revisão de operação — 17/09/2026

Materiais de execução: [fluxos ManyChat](SSL26_Operacao_ManyChat.md), [mensagens completas](SSL26_Regua_Conteudo.md) e [produção, live e liberação](SSL26_Producao_e_Lancamento.md). São preparados, não disparos agendados.

Consulta aos nomes das variáveis de produção em 17/09 encontrou `BREVO_API_KEY`; não encontrou `LEAD_WEBHOOK_URL` nem `LEAD_WEBHOOK_TOKEN`. Portanto, não considerar a ponte ManyChat–ERP instalada. A lista 24 e os nomes de atributos possuem valores padrão no código; sua existência histórica não substitui homologação com contato da equipe.

A revisão do cadastro salva o contato no Brevo antes de tentar e-mail e webhook, usa limites de tempo e não registra conteúdo de erros do provedor. Falhas secundárias não apagam o lead nem pedem recadastro. A resposta distingue `emailDelivery: accepted|failed` e `integration: accepted|failed|not_configured`; aceite não comprova entrega ou automação concluída no destino. Monitorar falhas e conciliar antes da ativação. Ainda não existe fila persistente de reenvio na landing.

Perfil opcional exige `profileToken` recebido após o cadastro, válido por uma hora, mantido apenas no estado da página. Não enviar esse token a ferramentas de analytics. O servidor usa a identidade e o instante do consentimento originais. A interface só confirma perfil depois de salvo; em falha, permite tentar novamente sem bloquear o guia.

Testes locais com provedores simulados: `npm run test:capture`. Testes de interface: `npm run build -- --base=/solarsemlimitescadastro/` e `npm run test:capture:ui`. Nenhum deles comprova recebimento real de e-mail, conexão ao ManyChat ou registro no ERP.

## Projeto de produção

- Vercel de produção: `sitehotelsolar`
- Project ID: `prj_hJSGmnHPUolbbtyb5bU3fipjjwVH`
- Projeto-fonte da landing: `solar-sem-limites`
- Domínio principal: `https://hotelsolar.tur.br`
- Rota de captação: `https://hotelsolar.tur.br/solarsemlimitescadastro`
- Canal VIP: `https://whatsapp.com/channel/0029Vb8iEz73gvWjJea5rt3k`

## 1. Brevo

### Remetente e respostas aprovados

- Nome de envio: `Geraldo | Hotel Solar`.
- E-mail de envio: `geraldo@hotelsolar.tur.br`.
- Respostas (`replyTo`): `reserva@hotelsolar.tur.br`, no singular; nome `Reservas | Hotel Solar`.
- O e-mail do guia usa essa identidade como padrão; pode ser configurada por `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `BREVO_REPLY_TO_EMAIL` e `BREVO_REPLY_TO_NAME` no servidor.
- Não alterar os padrões globais de outras campanhas/listas. Ao montar cada campanha SSL26 no Brevo, verificar remetente, endereço de resposta e eventuais sobrescritas da lista antes de agendar.
- Um único teste do modelo do guia foi aceito pelo Brevo (HTTP 201) em 17/09/2026, às 20h31 de Belém, para o destinatário autorizado. Não houve criação de contato nem inscrição em lista. Geraldo confirmou recebimento e destino do campo “Responder” para `reserva@hotelsolar.tur.br`. Não comprova entrega de uma resposta à caixa de reservas nem o fluxo completo de cadastro.
- Recibo do teste em `ssl26-email-test-result.local`, ignorado pelo Git. O script `scripts/test_ssl26_email.mjs` faz apenas simulação por padrão; envio exige `--send-test` e possui trava local contra repetição. Não repetir um envio incerto nem remover a trava sem verificar os registros.

### Estrutura

- Pasta: `Solar Sem Limites 2026`
- Lista: `SSL26_LEADS` — ID `24`, criada em 16/09/2026
- Campos:
  - `SSL26_PROFILE`
  - `SSL26_SOURCE`
  - `SSL26_CAMPAIGN`
  - `SSL26_REFERRAL`
  - `SSL26_CONSENT_AT`

O instalador é idempotente: pode ser executado novamente sem duplicar pasta, lista ou campos.

```bash
npm run setup:brevo
```

O comando precisa receber `BREVO_API_KEY` no ambiente seguro. Ao terminar, ele imprime o ID da lista que deve ser cadastrado na Vercel como `BREVO_LEADS_LIST_ID`.

### Variáveis de produção

Use `.env.example` como checklist. Chaves e tokens nunca devem ser colocados no Git nem receber o prefixo `VITE_`.

Obrigatórias:

- `BREVO_API_KEY`
- `BREVO_LEADS_LIST_ID`
- `BREVO_SSL26_ATTRIBUTES_ENABLED=true`
- `BREVO_PROFILE_ATTRIBUTE=SSL26_PROFILE`
- `PUBLIC_SITE_URL=https://hotelsolar.tur.br/solarsemlimitescadastro`

## 2. Ponte ManyChat–ERP

O receptor `/api/ssl26/ingest` foi publicado/habilitado no ERP em 18/09, após Geraldo aplicar `202609181100_ssl26_lead_bridge.sql` no SQL Editor. Tabelas/funções e bloqueio do acesso público foram conferidos; não foi criado acesso administrativo genérico `exec_sql`. Ver o procedimento no projeto ERP: `docs/ssl26-ponte-captacao.md`.

Um único webhook HTTPS autenticado foi configurado em `LEAD_WEBHOOK_URL` após essa implantação. O segredo compartilhado `LEAD_WEBHOOK_TOKEN` corresponde ao `SSL26_INGEST_TOKEN` do ERP. O contrato publicado exige resposta JSON com `success: true` e `persisted: true`; HTTP 2xx sozinho não comprova persistência. Uma confirmação de fila não significa sincronização ManyChat ou mensagem enviada.

### Eventos enviados pela landing

- `ssl26_lead_captured`: primeira etapa concluída.
- `ssl26_lead_profiled`: relacionamento com o Hotel Solar informado.

Exemplo resumido:

```json
{
  "schemaVersion": 1,
  "event": "ssl26_lead_captured",
  "eventId": "ssl26-...:capture",
  "tag": "SSL26_LEAD",
  "tags": ["SSL26_LEAD", "SSL26_CAPTADO"],
  "capturedAt": "2026-10-19T12:00:00.000Z",
  "occurredAt": "2026-10-19T12:00:00.000Z",
  "consent": {
    "granted": true,
    "source": "landing_ssl26",
    "version": "ssl26_landing_2026_09_v1",
    "text": "Concordo em receber o guia e comunicações do Hotel Solar por e-mail e WhatsApp. Posso cancelar quando quiser."
  },
  "lead": {
    "firstName": "Maria",
    "email": "maria@example.com",
    "phone": "+5591999999999",
    "profile": "nao_conhece"
  },
  "tracking": {
    "utmSource": "meta",
    "utmMedium": "paid_social",
    "utmCampaign": "ssl26_captacao",
    "utmContent": "video_atalaia",
    "utmTerm": "familias_para",
    "referral": ""
  }
}
```

A migração preparada persiste `eventId` e hash do conteúdo validado, impede cruzamento de identidades e mantém fila por lead no ERP. Perfil preserva o `capturedAt` original, recebe identificador próprio e `occurredAt`; uma atualização mais antiga não sobrescreve a mais recente. O webhook exige HTTPS e token; não aceita redirecionamento. Não há reenvio automático de falhas anteriores à chegada no ERP, nem agendador de processamento instalado.

O primeiro processador é restrito a contatos ManyChat existentes, verificados pelo WhatsApp e opt-in. Contatos novos/não identificados exigem revisão e não são criados automaticamente. Somente o gate de ingestão foi ligado; sincronização/auditoria continuam desligadas. O endpoint de controle de saída/pausa, ainda sem token configurado, atua só na fila local até ser conectado aos provedores. Nenhuma supressão global, painel CRM, fluxo de boas-vindas ou envio real está concluído por essa implementação.

## 3. Configuração do ManyChat

### Acesso inicial seguro

Arquivo `.env.manychat.local` preenchido por Geraldo e validado em 18/09/2026, ignorado pelo Git e com permissões restritas ao proprietário (`600`), com a variável de servidor `MANYCHAT_API_KEY`. A chave de API da conta do Hotel Solar fica em **Configurações > API**, traduzido nesta interface como **Interface de Programação de Aplicativos**; não enviar no chat, expor no código do navegador ou usar prefixos públicos. Reutilizar a chave existente: regenerar/excluir pode interromper integrações em uso. Se a seção não estiver disponível no plano ou na permissão atual, verificar antes de contratar ou alterar a conta. Ver [orientações oficiais da ManyChat](https://help.manychat.com/hc/en-us/articles/14959510331420-How-to-generate-a-token-for-the-Manychat-API-and-where-to-get-parameters).

### Validação de acesso — 18/09/2026, 09h43 de Belém

- `GET /fb/page/getInfo`: HTTP 200 / `success`, conta **Hotel Solar**, ID `156918594386969`, correspondente à conta aberta no navegador.
- `GET /fb/page/getTags`: HTTP 200 / `success`, 77 tags retornadas. Entre elas, tags do Solar Sem Limites 2025 e do In-House de julho/2026; nenhum nome com `SSL26` na listagem.
- `GET /fb/page/getCustomFields`: HTTP 200 / `success`, 83 campos retornados; nenhum nome com `ssl26` na listagem.
- `GET /fb/page/getFlows`: HTTP 200 / `success`, 45 fluxos e 5 pastas retornados. Inclui `Solar Sem Limites 2026 In-House julho`; nenhum nome com `SSL26` na listagem.
- Nenhum contato consultado individualmente, criado ou modificado; nenhuma mensagem enviada; nenhuma tag, campo ou automação alterada. A chave não foi exibida nem publicada no site/servidor.

Esse inventário inicial não comprova os gatilhos/conteúdos dos fluxos nem o estado das conexões Instagram/WhatsApp. A montagem dos fluxos visuais pode exigir acesso adicional ao painel. Não reconectar o WhatsApp. A ponte da página, a sincronização com o ERP e o teste real de WhatsApp continuam pendentes.

### Estrutura instalada — 18/09/2026, 09h50 de Belém

Criadas **13 tags** (12 exclusivas `SSL26_` e o marcador compartilhado `ATENDIMENTO_HOTEL_ATIVO`) e **12 campos personalizados**, após simulação e conferência da conta. Todos estavam ausentes. As definições antigas foram preservadas; nenhuma tag foi aplicada a contatos e nenhum campo de contato foi preenchido. Nenhuma mensagem enviada ou automação ativada. O marcador de atendimento e o pedido de saída ainda precisam ser ligados aos fluxos: sua existência não implementa os bloqueios.

Conferência de leitura às 09h51: **25 itens existentes, nenhum a criar**, com IDs e tipos esperados. Totais da conta: 90 tags e 95 campos. Mapeamento real salvo em `ssl26-manychat-structure.local`, fora do Git e sem a chave de API. Datas usam `datetime`; a futura ponte deve enviar instante com fuso e validar a conversão. Não inicializar contadores, consentimento ou pedidos de saída em massa.

Ferramenta de manutenção: `scripts/setup_manychat_ssl26.mjs`, com conta fixada, endpoints permitidos restritos, conferência prévia de conflitos, consulta antes de cada criação e leitura final. `npm run setup:manychat` apenas consulta e mostra o plano; `npm run setup:manychat -- --apply` cria definições ausentes. Não executar em paralelo. Diante de falha/timeout, consultar primeiro; não repetir POST cegamente. `npm run test:manychat`: 13 testes aprovados, incluindo repetição sem duplicações, conflito de tipo, conta errada e resposta incerta. Parâmetros conferidos no [esquema oficial da ManyChat](https://api.manychat.com/swagger).

Próxima etapa: a parte página → banco ERP já foi conferida com cadastro/perfil reais; falta homologar ManyChat e preparar o fluxo inicial, incluindo descadastro e bloqueio de atendimento. As conexões de canais e o modelo de WhatsApp precisam de homologação antes de qualquer envio.

### Tags obrigatórias

- `SSL26_LEAD`
- `SSL26_CAPTADO`
- `SSL26_CANAL_VIP_CLICK`
- `SSL26_CANAL_VIP`
- `SSL26_ENGAJADO`
- `SSL26_LIVE`
- `SSL26_PAGINA_VENDAS`
- `SSL26_CHECKOUT_INICIADO`
- `SSL26_CHECKOUT_ABANDONADO`
- `SSL26_PAGAMENTO_PENDENTE`
- `SSL26_COMPRADOR`
- `SSL26_OPT_OUT`
- `ATENDIMENTO_HOTEL_ATIVO`

### Campos personalizados instalados

| Campo | Tipo | Finalidade |
|---|---|---|
| `ssl26_profile` | text | `ja_hospedou`, `conhece` ou `nao_conhece`; opcional |
| `ssl26_source` | text | Origem do cadastro |
| `ssl26_utm_campaign` | text | Campanha de aquisição |
| `ssl26_utm_content` | text | Criativo/conteúdo de origem |
| `ssl26_referral` | text | Código de indicação; não concede recompensa por lead |
| `ssl26_consent_at` | datetime | Instante do consentimento original, com fuso |
| `ssl26_consent_source` | text | Origem/referência da evidência de consentimento |
| `ssl26_order_id` | text | Identificador do pedido no ERP |
| `ssl26_individual_attempts` | number | Contagem de recuperação somada entre canais/equipe |
| `ssl26_last_attempt_at` | datetime | Instante da última tentativa de recuperação |
| `ssl26_opt_out_at` | datetime | Instante do pedido de saída |
| `ssl26_opt_out_source` | text | Canal/origem do pedido de saída |

### Fluxo inicial

1. Criar/atualizar o contato usando o WhatsApp em formato internacional.
2. Aplicar `SSL26_LEAD` e `SSL26_CAPTADO`.
3. Gravar os campos de origem, campanha, perfil e consentimento.
4. Se existir `SSL26_OPT_OUT` ou `ATENDIMENTO_HOTEL_ATIVO`, não iniciar mensagem comercial.
5. Para contatos novos, usar o gatilho “New contact” com as condições “Opted-in through API” e “Opted-in for WhatsApp”.
6. Enviar apenas modelo de mensagem aprovado quando o contato estiver fora da janela de 24 horas.
7. A mensagem inicial deve entregar o guia e oferecer o link do Canal VIP; não deve apresentar a oferta de venda antes da programação aprovada.

## 4. Mapeamento de perfil

| Valor técnico | Comunicação |
|---|---|
| `ja_hospedou` | Retorno, economia, lembranças e novidades |
| `conhece` | Confiança, estrutura e motivos para se hospedar |
| `nao_conhece` | Destino, história, localização e experiência familiar |

## 5. Teste antes da publicação

- Usar um e-mail e telefone autorizados da equipe.
- Confirmar entrada na lista `SSL26_LEADS`.
- Confirmar recebimento do e-mail com o guia.
- Confirmar tags e campos no ManyChat.
- Confirmar que o lead aparece no painel do ERP uma única vez.
- Testar pedido de descadastro e bloqueio por `ATENDIMENTO_HOTEL_ATIVO`.
- Verificar UTMs com campanhas de teste distintas.
- Só então liberar anúncios e tráfego orgânico.

## 6. Mensuração da captação

O GA4 do Hotel Solar (`G-0TN73829QP`) está instalado na landing. Os eventos abaixo não enviam nome, e-mail ou telefone:

| Evento | Momento |
|---|---|
| `ssl26_capture_view` | Abertura da landing |
| `ssl26_form_start` | Primeira interação com o formulário |
| `generate_lead` | Cadastro concluído com sucesso |
| `ssl26_profile_saved` | Perfil de relacionamento salvo |
| `ssl26_guide_download` | Clique para baixar o guia |
| `ssl26_whatsapp_channel_click` | Clique para entrar no Canal VIP |

Os eventos levam campanha e origem por UTM, quando presentes. No GA4, marcar `generate_lead` como evento principal e criar o funil `ssl26_capture_view` → `ssl26_form_start` → `generate_lead`.

O código já dispara o evento padrão `Lead` quando `window.fbq` estiver disponível. A instalação do Meta Pixel e da Conversions API depende do ID do Pixel e do ativo correto no Business Manager; nenhum token deve ser colocado no repositório.

## Referências técnicas

- Brevo — criação de listas: https://developers.brevo.com/reference/create-list
- Brevo — criação/atualização de contatos: https://developers.brevo.com/docs/synchronise-contact-lists
- ManyChat — contatos de WhatsApp via API: https://help.manychat.com/hc/pt-br/articles/14281353475228-Como-criar-contatos-do-WhatsApp-via-API-da-Manychat
- ManyChat — token e limites da API: https://help.manychat.com/hc/en-us/articles/14959510331420-How-to-generate-a-token-for-the-Manychat-API-and-where-to-get-parameters
