# SSL26 — callback HTTPS e prévia restrita do botão

18/09/2026, rodada iniciada por volta de 14h25 de Belém. Geraldo autorizou **uma única mensagem de teste, sem oferta, para o WhatsApp final 1312**, mantendo o descadastro da campanha.

## Concluído

- Ativado **somente** `SSL26_CONTROLS_ENABLED=true` no ERP de produção. O receptor continua exigindo Bearer dedicado, conta Hotel Solar, ID nativo, releitura do WhatsApp real e tag de saída. Não envia mensagens nem altera os provedores.
- Mesma revisão `7fd263bb5de2e0cd5ace5b7d19fa772763e688de` republicada, sem upload dos diretórios locais e sem código novo: `dpl_5X9YZaVnSx6tX9jfH1i9eJiGyoU9`, **READY**, build 80 s. URL imutável: https://erp-hotel-solar-1lxly5w4n-geraldo-barros-projects-7276ca26.vercel.app. Alias conferido: https://erp-hotel-solar.vercel.app.
- `SSL26_SYNC_ENABLED`, `SSL26_SUPPRESSION_ENABLED` e `SSL26_AUTOMATIONS_REVIEWED` permanecem false. Nenhum agendador ou disparo de campanha foi ativado. Site/guia não republicados.
- Teste HTTPS sem chave: 401. Com chave e corpo vazio: 400. Processadores autenticados de sincronização e supressão: 503 `activation_gate`.
- Callback somente do contato autorizado, **já descadastrado**: 202, `persisted=true`, `duplicate=true`, `messagesSent=0`. Controle de saída preservado. Dois trabalhos continuam `synced`, uma tentativa cada, sem reinício nem mudança de conclusão.
- Teste adicional **pelo próprio editor ManyChat**, na ação externa já salva de `SSL26_02_WA_BOAS_VINDAS`: ID do contato nativo conferido na prévia, resposta **202 Accepted**, duplicado e sem mensagens. Não foi executado o restante do fluxo, nem reescrita a credencial.

O 202 prova recebimento/persistência. A conclusão nos provedores é demonstrada separadamente pelo [teste real anterior](SSL26_Teste_Saida_2026-09-18.md), não pela palavra `queued` da resposta.

Consulta de logs nível error, restrita ao novo deployment, rotas `/api/ssl26` e últimos 30 minutos: nenhum registro encontrado. É uma amostra pontual, não monitoramento recorrente. `git diff --check` passou nos dois diretórios de trabalho; nenhum código fonte foi alterado nesta rodada.

## Prévia do botão: clique confirmado em 18/09 às 14h58 de Belém

Geraldo respondeu **“concluido”** ao pedido de iniciar a prévia e tocar em Parar avisos. A conferência posterior foi somente de leitura, sem reenvio ou alteração de contato:

- **ManyChat:** a API direta não respondeu, mas a ficha do contato autorizado foi aberta no painel. ID nativo e WhatsApp coincidem com o destinatário; o campo `ssl26_opt_out_source` contém exatamente `manychat:ssl26_qa_20260918:parar_avisos`. Isso comprova a execução da ação ligada ao botão do rascunho QA, além da confirmação do usuário. Tag `SSL26_OPT_OUT` presente, tags anteriores `Passante Reserva`/`Cardápio` e opt-in global WhatsApp preservados.
- **Brevo**, consulta das 14h55min54s de Belém: identidade conferida, `SSL26_OPT_OUT=true`, fora da lista SSL26 24, lista anterior 21 preservada e blacklists globais de e-mail/SMS false.
- **ERP**, mesma consulta: data original de saída `2026-09-18T17:16:29.665593+00:00` preservada; dois trabalhos seguem `synced`, uma tentativa cada, motivo `suppression_verified`. O clique QA não chamou o ERP nem reiniciou esses trabalhos.

**Aceite:** mensagem de prévia e botão local confirmados. Não houve nova autorização de marketing, publicação de fluxo, disparo adicional pelo agente ou mudança de configuração nesta conferência. Não equivale à homologação integral do botão original com callback: esse callback foi testado separadamente na rodada anterior.

Rascunho [SSL26_QA_SAIDA_GERALDO_NAO_PUBLICAR](https://app.manychat.com/fb156918594386969/cms/files/content20260918172530_374399/edit), ID `content20260918172530_374399`. **Não publicado, sem gatilhos públicos.** A tentativa de duplicação do fluxo original criou uma cópia vazia; o teste foi montado nessa cópia, sem alterar o fluxo principal.

- Entrada exige **todas**: WhatsApp ID igual ao número autorizado, no formato nativo sem `+`, e tag `SSL26_OPT_OUT` presente. Ramo negativo encerra. O número foi relido no rascunho após salvar.
- Uma única mensagem, sem oferta, informa que é teste autorizado e que não reativa avisos. Botão **Parar avisos**.
- Clique mantém `SSL26_OPT_OUT` e define `ssl26_opt_out_source=manychat:ssl26_qa_20260918:parar_avisos`. Sem segundo envio, próximo passo, webhook ou mudança de opt-in global.
- A cópia do bloco autenticado foi bloqueada pela revisão de segurança pelo risco de colocar credencial no clipboard. Não houve tentativa de contornar o bloqueio. Por isso **o teste do botão local e o teste HTTP são separados**; não declarar homologação ponta a ponta do botão original.
- A prévia do ManyChat exigiu iniciar conversa por um link gerado pelo próprio painel. O link foi entregue a Geraldo, com instrução de abrir no celular do número final 1312, enviar o texto preenchido e tocar em Parar avisos na resposta. O agente não enviou essa mensagem pelo WhatsApp pessoal do usuário.
- Na preparação inicial, entrega/clique ainda não estavam confirmados e as consultas à API haviam expirado. Essa pendência foi resolvida pela confirmação de Geraldo e pela leitura posterior do marcador no painel, descritas acima. A indisponibilidade da API não foi tratada como ausência de clique nem motivou reenvio.
- Consulta pontual desta conferência: `/private/tmp/ssl26-verify-qa-click-20260918.mjs`, somente GET, escopo de um contato, sem segredos ou respostas brutas na saída. Brevo/ERP confirmados pela API; ManyChat confirmado pela interface. A política de credenciais evitou exposição/regravação de chaves; a verificação pelo navegador permitiu concluir a prova sem repetir o envio.

## Estado e próximos passos

Preparação geral reavaliada em **70%**: os 69% da rodada anterior passam a incluir +1 ponto pela prévia WhatsApp com clique local comprovado e preservação do descadastro nos três serviços. São pontos gerenciais de evidência, não percentual automático nem prontidão para anúncios. A frente Brevo/ManyChat/sincronização soma 11 de 15 pontos; as outras frentes permanecem iguais.

1. Teste de prévia e clique local concluído. Não reenviar nem reativar Geraldo automaticamente. Manter o rascunho QA sem gatilhos/publicação.
2. Homologar a jornada original completa, saída por texto, pausa/compra durante espera, audiência Brevo e disparador com registro único de boas-vindas antes de ativar campanha. Outro teste de aquisição exige destinatário e consentimento adequados; este descadastro continua bloqueante.
3. O receptor está habilitado, mas o processamento automático das novas pendências continua desligado. Não tratar isso como supressão automática completa para a base.

Verificação pontual sem mensagens: `/private/tmp/ssl26-https-check-20260918.mjs`. Lê credenciais privadas existentes sem imprimi-las; não contém segredos. A publicação anterior `dpl_BTF3LJ8nfX55EQkq9fAuyxEACv5C` conserva a mesma revisão com o receptor desligado. Para reversão de configuração, desligar `SSL26_CONTROLS_ENABLED` e aplicar a configuração à publicação, sem apagar registros de saída.
