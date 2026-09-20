# Solar Sem Limites 2026 — fluxos e atendimento

[Checklist mestre e próxima entrega](SSL26_Checklist_Mestre.md) · [Placar diário e meta](SSL26_Placar_Diario.md). O status executivo é centralizado no checklist; este arquivo preserva a operação detalhada e seu histórico.

Versão de preparação: atualizada em 20/09/2026. **14 tags e 13 campos instalados. Instagram continua em rascunho; boas-vindas WhatsApp convertido para modelo aprovado e publicado sem gatilho público. Fluxo de atendimento publicado sem gatilho, destinado provisoriamente a Geraldo e testado pontualmente; demais fluxos ainda não instalados.** Testes autorizados são específicos e não liberam campanha ou reinscrição. Preserva preço, datas e regras já aprovados.

### Estado atual — atendimento em 20/09/2026

**17h49 — revisão publicada e testada:** usuário aprovou **Geraldo Barros** como destino provisório e autorizou uma única execução da revisão. Atribuição, tag de revisão e confirmação inicial falsa antecedem o callback; `$.centralPause` alimenta campo booleano, cujo verdadeiro permite remover somente `SSL26_PAUSA_REVISAO`. Teste mostrou inclusão/remoção da pendência e confirmação verdadeira, mantendo saída, pausa, dados e listas. Nenhuma mensagem ao cliente. Fluxo reaberto **Salvo/STOPPED**, sem gatilho; ERP `a1a4884` READY, retorno de sucesso 200 após persistência. 102 testes locais e TypeScript aprovados. **Faltam entrada específica, falha/timeout real e conversa inicialmente fechada. AUT-05 parcial, 74%.** [Configuração e provas](SSL26_Atendimento_Destino_e_Confirmacao_2026-09-20.md). As notas seguintes são históricas; Kaline ainda não é agente disponível.

**17h28 de Belém — teste concluído:** Geraldo substituiu o final 0800 pelo próprio contato final 1312 e autorizou o vínculo técnico dos cadastros/identificação `SSL26_LEAD`, preservando saída. `SSL26_03_ATENDIMENTO_HUMANO` publicado sem gatilho, **STOPPED/Salvo**, executado uma vez: tag de atendimento aplicada, conversa aberta (já estava aberta antes), um evento de pausa no ERP. Repetição do callback 202/duplicado/zero mensagens; demais dados e bloqueios preservados. Receptor de pausa habilitado na mesma revisão ERP; processadores globais desligados. Faltam destino/alertas e ligação ao pedido real. **AUT-05 parcial; 74% mantidos.** [Provas e limites](SSL26_Teste_Atendimento_Geraldo_2026-09-20.md). A nota seguinte registra o rascunho anterior à autorização.

Criado/salvo/reaberto **`SSL26_03_ATENDIMENTO_HUMANO`**, ID `content20260920200855_623835`: aplica `ATENDIMENTO_HOTEL_ATIVO`, abre a conversa, depois verifica tag `SSL26_LEAD` + `WhatsApp ID` preenchido. Ramo positivo envia o **ID nativo do contato** em POST autenticado à API de pausa; negativo encerra sem fechar o atendimento. Nenhum filtro comercial impede a abertura. Cabeçalhos e corpo dinâmico conferidos após salvar. **Sem mensagens, publicação, gatilho ou execução; nenhum contato alterado.** Flag de pausa e campanha não foram ativadas. Faltam autorização do teste final 0800, homologação, destino/alertas de falha e conexão ao pedido real. **AUT-05 parcial; 74% mantidos.** [Registro completo e limites](SSL26_Atendimento_ManyChat_2026-09-20.md).

Abrir conversa não equivale a atribuí-la a Kaline; a tag só protege os fluxos que a verificam. O número `03` neste rascunho não instala o fluxo de perfil proposto na seção 5. As notas datadas abaixo preservam os estados anteriores.

### Avanço no painel — 18/09/2026

**Histórico — publicação de 20/09, antes do rascunho acima:** boa-vinda/data e receptor de pausa publicados, READY (`fe57bbf`); função instalada, 12 verificações de produção aprovadas sem clientes. Flag de pausa desligada e, naquele momento, ainda sem configuração no ManyChat. Não confundir instalação técnica com atendimento homologado ou exclusão de e-mail. **134 testes/TypeScript aprovados, campanha desligada e 74% mantidos.** [Publicação e sequência de conclusão](SSL26_Publicacao_e_Pausa_2026-09-20.md).

**Retomada em 20/09:** segmentos de conferência/exclusão Brevo #14/#15 instalados e relidos; sete agendas de sequências e 17 blocos conectados do Instagram geral inspecionados sem alteração. O bloco legado `Falar com atendente` notifica a equipe, mas não aplica a pausa SSL26. Resolver essa integração e a sobreposição de qualquer resposta a story antes de ativar os gatilhos novos. QA continua fora da campanha e gates desligados; 119 testes/TypeScript aprovados. **74% mantidos.** [Auditoria atual e limitações](SSL26_Audiencia_e_Auditoria_2026-09-20.md). As notas seguintes são o histórico de 18/09.

**Aceite final do teste autorizado:** Geraldo confirmou recebimento e os três botões. Origem do botão Parar avisos conferida no contato; saída central antecede a limpeza controlada. Supressão ManyChat/Brevo concluída uma vez por provedor, fora da lista comercial, outras listas/tags/permissões preservadas. Nenhum reenvio. Preparação geral **74%**; produção continua com processadores globais desligados. As notas seguintes sobre pendências do QA são históricas.

**Estado mais recente:** `SSL26_02_WA_BOAS_VINDAS` usa o modelo `ssl26_guia_boas_vindas_v1` na mensagem inicial, fora da janela de 24h; publicado/reaberto, `STOPPED`/`Salvo`, nenhum gatilho. As três respostas mantêm destinos, condições e saída autenticada. Uma boa-vinda foi aceita para o QA final 0800 após cadastro real e sincronização; repetição bloqueada. Aceite de entrega/botões e retirada final do QA pendentes. Fluxos globais continuam desligados; **não reenviar a mensagem**. [Evidências e limites](SSL26_Teste_Cadastro_Reservas_2026-09-18.md). As descrições abaixo de rascunho dentro da janela são históricas, anteriores à conversão.

**Aceite mais recente, 14h58 de Belém:** Geraldo concluiu a prévia; ficha do contato conferida no painel com `ssl26_opt_out_source=manychat:ssl26_qa_20260918:parar_avisos`, tag de saída presente, tags anteriores e opt-in global preservados. ERP/Brevo também confirmam saída mantida. Nenhum reenvio ou escrita nesta conferência. Prévia/botão local concluídos, **não** jornada original completa com callback. Rascunhos sem publicação/gatilhos; campanha desligada. Preparação geral: **70%**. [Aceite detalhado](SSL26_Callback_HTTPS_2026-09-18.md). A nota seguinte descreve a situação anterior ao clique.

**Estado posterior atual:** receptor HTTPS de saída habilitado, autenticado e testado pelo ManyChat com 202/duplicado/zero mensagens; sincronização e processadores continuam desligados. Criado rascunho `SSL26_QA_SAIDA_GERALDO_NAO_PUBLICAR`, sem gatilhos, limitado ao WhatsApp autorizado e à tag de saída já presente. Uma mensagem sem oferta, botão local sem confirmação adicional; não inclui cópia da credencial. Prévia exige iniciação pelo WhatsApp do usuário; link e instruções entregues, execução/clique ainda pendentes. Os parágrafos abaixo sobre callback desligado descrevem o histórico. [Estado completo e limites](SSL26_Callback_HTTPS_2026-09-18.md).

**Teste real autorizado posteriormente:** Geraldo aprovou o descadastro do próprio contato; tag de saída, controle no ERP e retirada somente da lista SSL26 no Brevo confirmados. Repetição sem efeitos adicionais, demais dados e permissões preservados. A execução foi isolada com o código publicado e serviços reais; não publicou/executou estes rascunhos nem habilitou as rotas públicas. [Relatório](SSL26_Teste_Saida_2026-09-18.md). O contato continua descadastrado; não reativá-lo automaticamente.

Rascunho [SSL26_01_IG_GUIA](https://app.manychat.com/fb156918594386969/cms/files/content20260918141216_689711/edit), ID `content20260918141216_689711`: três mensagens e duas condições conectadas. O passo inicial **SSL26 | Entrada permitida** exige conjuntamente ausência de `SSL26_OPT_OUT`, `ATENDIMENTO_HOTEL_ATIVO` e `SSL26_COMPRADOR`, antes da apresentação. **Quero o guia** leva a **SSL26 | Revalidar antes do guia**, com as mesmas três exigências, antes do botão **Abrir cadastro**, com URL oficial e UTMs. Os ramos negativos encerram; **Agora não** agradece e encerra. Condições/conexões salvas e conferidas após reabrir o editor. **Não publicado; nenhum gatilho escolhido, mensagem enviada, tag aplicada a contatos ou consentimento atribuído.** Ainda faltam encaminhamento humano, tratamento de saída explícita, gatilhos específicos e teste real antes de ativar.

Rascunho [SSL26_02_WA_BOAS_VINDAS](https://app.manychat.com/fb156918594386969/cms/files/content20260918144151_090401/edit), ID `content20260918144151_090401`: criado e salvo no painel, sem publicação/gatilho. Quatro mensagens, três condições e um bloco de ações. Entrada e cliques de guia/canal exigem **todas** as oito condições: duas tags de cadastro, ausência das três tags de bloqueio, data do consentimento preenchida, origem exata `landing_ssl26:ssl26_landing_2026_09_v1` e **Opted-in for WhatsApp = true**. Mensagens configuradas **dentro da janela de 24 horas**; não há alternativa externa à janela instalada.

- **Baixar guia** → revalidação → mensagem com **Abrir guia** para o PDF oficial.
- **Canal VIP** → revalidação → convite opcional com **Abrir Canal VIP**, usando o canal novo `0029Vb8iEz73gvWjJea5rt3k`.
- **Parar avisos** → **SSL26 | Registrar saída WA**: adicionar `SSL26_OPT_OUT`, definir `ssl26_opt_out_at` para data/hora da ação e `ssl26_opt_out_source` para `manychat:ssl26_02_wa_boas_vindas:parar_avisos`; depois confirmar o pedido de saída apenas neste WhatsApp. Não passa pelo bloqueio de aquisição e não altera opt-out global do hotel.

Reabertura do WhatsApp confirmou as condições, destinos dos três botões, duas URLs e ações de saída; prévia visual inspecionada. **É conferência estática da configuração, não teste de execução/entrega.** Nenhum contato alterado ou mensagem enviada. Modelo externo à janela, comprovante durável de boas-vindas, propagação de saída ERP/Brevo, tratamento de saída por texto e encaminhamento humano ainda pendentes. O painel também exibiu aviso de mudança de cobrança a partir de 01/10/2026: reconferir custos vigentes antes da campanha de novembro, sem usar orçamento por mensagem antigo como confirmado.

Auditoria parcial, somente leitura, das seis regras ativas encontradas:

| Regra | Gatilho | Efeito observado |
|---|---|---|
| ChatGTP Assistente Geral | Tag `ChatGPT Assistente Geral` aplicada | Define o identificador do assistente |
| Aplicar Tag Reservado | Tag `Reservado` aplicada | Define Status e inicia Conclusão Reserva |
| Ao Remover Hospedado Limpa | Tag `Hospedado` removida | Limpa Status |
| Ao Aplicar Hospedado | Tag `Hospedado` aplicada | Define Status e inicia Check-in |
| Regra de Checkout - Obrigado+Satisfação | Tag `Hospedado` removida | Inicia Obrigado + Pesquisa de Satisfação |
| Tag applied | Tag `Carnaval 2023 QRCode` aplicada | Inicia Check-in |

Nenhuma dessas seis regras usa tags/campos SSL26; todas foram preservadas. A lista de automações também mostrou **Solar Sem Limites 2026 In-House julho** ativo para a mensagem exata “quero conhecer o programa Solar Sem Limites”, além de gatilhos gerais de Instagram para stories/saudações e opt-out de sistema WhatsApp `stop`/`unsubscribe`. Não foram desativados. A inspeção não é auditoria completa de todas as pastas, gatilhos, palavras-chave ou chamadas externas: manter `SSL26_AUTOMATIONS_REVIEWED=false`.

Na consulta autorizada do contato de teste, a busca por telefone de sistema não encontrou resultado; o campo legado **Telefone validado** encontrou o WhatsApp exato, com opt-in ativo. Ajuste em `ERP/src/lib/ssl26/sync.ts` consulta os dois campos de telefone validados auditados, deduplica pelo ID e relê identidade/opt-in/supressões antes de qualquer escrita. Não usa nome/e-mail como identidade, não cria contato nem envia mensagens. **Publicado em 18/09 no ERP `a7f3ace`; sincronização continua desligada.**

Atualização da saída, 18/09: requisição externa adicionada após tag/data/origem no rascunho WhatsApp, com POST para ERP e ID nativo do contato. Geraldo salvou a chave; reabertura confirmou formato correto e ausência do marcador. Teste pelo editor, com identidade do destinatário autorizado conferida pela API, recebeu 503 `integration_disabled`: autenticação comprovada, execução bloqueada como planejado. Não houve execução/publicação do fluxo, alteração de contato, descadastro ou envio. Banco/atributo Brevo e rotas instalados; processamento e disparos desligados. [Detalhes e próximos passos](SSL26_Publicacao_2026-09-18.md).

## 1. Entrada e proteção do número único

Número conectado informado por Geraldo: **+55 91 98122-9825** (`+5591981229825`). Manter como número oficial do hotel. Geraldo também informou seu e-mail e outro WhatsApp para receber os testes, registrados somente em `ssl26-test-contacts.local`, ignorado pelo Git. Não confundir o número conectado com o destinatário de teste. Geraldo confirmou recebimento do teste de e-mail e destino do botão Responder; nenhum envio de WhatsApp foi realizado. Ver o registro em `Ativacao_Captacao_SSL26.md`.

Geraldo confirmou que o WhatsApp oficial e o Instagram já estão conectados ao ManyChat. Em 18/09/2026, às 09h43, acesso de leitura à API validado na conta **Hotel Solar**: 77 tags, 83 campos e 45 fluxos/5 pastas retornados. Há materiais de 2025 e julho/2026; nenhum nome com `SSL26` foi encontrado nessa listagem inicial. Às 09h50 foram criadas 13 tags e 12 campos, conferidos por nova leitura às 09h51; totais passaram a 90 tags e 95 campos. Não houve alteração de contatos, gatilhos ou fluxos existentes. Isso não comprova a situação dos canais, os gatilhos ou o conteúdo completo dos fluxos. Manter o número e as conexões atuais. Conferir plano, permissões, situação dos canais e automações existentes antes de instalar os fluxos SSL26. Não migrar, desconectar o aplicativo nem substituir atendimento corrente sem confirmação de Geraldo. Kaline recebe as conversas; Andrey valida a integração.

**Atualização do destino em 20/09:** a previsão de encaminhar à Kaline acima foi substituída provisoriamente por **Geraldo Barros**, conforme autorização. Kaline continua no planejamento de equipe, mas não está cadastrada como agente disponível no ManyChat.

Para cada ação comercial pós-cadastro, reavaliar: pertence a `SSL26_LEAD`, tem consentimento para o canal, não tem `SSL26_OPT_OUT`, não está em `ATENDIMENTO_HOTEL_ATIVO` e não é comprador quando a mensagem for de aquisição. Reavaliar também depois de esperas e imediatamente antes do envio. Não basta validar na entrada do fluxo. **Exceções de escopo:** a resposta solicitada do Instagram que convida ao cadastro acontece antes de existir `SSL26_LEAD`; não exigir essa tag nessa entrada nem atribuí-la por clique. A confirmação de saída e o atendimento humano não podem depender da ausência de opt-out, pois são respostas operacionais, não aquisição.

Não usar uma resposta genérica a todas as mensagens do WhatsApp: hóspedes, reservas e fornecedores continuam na operação normal. Gatilhos do lançamento: palavra-chave específica, publicação selecionada, cadastro consentido ou ação explícita no menu do lançamento.

Não disparar todos os fluxos abaixo automaticamente ao cadastrar o contato. São rotas alternativas, com trava contra duplicidade e respeito à janela permitida de cada canal.

## 2. Dados e estados

| Registro | Uso e evidência necessária |
|---|---|
| `SSL26_LEAD`, `SSL26_CAPTADO` | Cadastro consentido persistido, não simples clique |
| `SSL26_CANAL_VIP_CLICK` | Interesse: clique no convite, não prova de que seguiu |
| `SSL26_CANAL_VIP` | Somente confirmação declarada pelo contato; não contar como adesão verificada |
| `SSL26_ENGAJADO` | Resposta, botão ou outra interação registrada |
| `SSL26_LIVE` | Presença/interação identificada; convite enviado não é presença |
| `SSL26_PAGINA_VENDAS` | Visita identificada com base técnica apropriada |
| `SSL26_CHECKOUT_INICIADO` / `SSL26_CHECKOUT_ABANDONADO` | Evento real e ausência de compra após espera |
| `SSL26_PAGAMENTO_PENDENTE` | Pedido real aguardando aprovação |
| `SSL26_COMPRADOR` | Pagamento aprovado no ERP; formulário preenchido não basta |
| `SSL26_OPT_OUT` | Pedido de parada, sem reativação automática ao importar contatos |
| `ATENDIMENTO_HOTEL_ATIVO` | Atendimento operacional; bloqueia os fluxos SSL26 que verificam a tag, não todas as automações legadas |
| `SSL26_PAUSA_REVISAO` | Revisão da pausa central pendente/sem confirmação; aplicada antes do callback e retirada somente após confirmação positiva |

Campos instalados: `ssl26_profile`, `ssl26_source`, `ssl26_utm_campaign`, `ssl26_utm_content`, `ssl26_referral`, `ssl26_consent_at`, `ssl26_consent_source`, `ssl26_order_id`, `ssl26_individual_attempts`, `ssl26_last_attempt_at`, `ssl26_opt_out_at`, `ssl26_opt_out_source` e `ssl26_support_pause_ok`. Os três campos de instante são `datetime`; tentativas usa `number`; confirmação da pausa usa `boolean`, reiniciada em falso a cada pedido e sem efeito sobre consentimento; demais campos usam `text`. Inventário original privado de 18/09 preservado como histórico; nova consulta de 20/09 confirmou os 27 itens, incluindo a tag e o campo de revisão, sem ausentes. O teste autorizado de atendimento atribuiu somente o novo campo de confirmação.

Deduplicação: email normalizado no Brevo, telefone internacional no ManyChat, identidade canônica e `eventId` persistidos na ponte. Contato já existente não deve ser excluído/recriado nem perder tags da operação regular. Repetir webhook não pode reenviar boas-vindas ou gerar nova indicação.

## 3. Fluxo A — Instagram para o guia

Nome: `SSL26_01_IG_GUIA`. Gatilho proposto: comentário com GUIA em posts selecionados ou mensagem direta com GUIA/SALINAS. Ativar somente depois de testar em publicação de teste. Não usar gatilho global em comentários antigos.

Resposta pública sugerida, quando aplicável:

> Temos um guia gratuito para planejar dias em Salinas em família. Veja nossa mensagem no Direct ☀️

Mensagem inicial:

> Que bom ter você por aqui! Sou o assistente do Hotel Solar, em Salinópolis. Preparamos um roteiro gratuito de 3 dias para aproveitar a região em família. Quer receber o link para baixar?

Botões: **Quero o guia** / **Agora não**. A resposta/interação deve ocorrer antes da sequência; não tratar comentário isolado como consentimento para e-mail ou WhatsApp.

Após “Quero o guia”:

> Aqui está a página do Guia Salinas em Família. É só preencher seus dados para liberar o material e escolher receber as novidades do Solar. Se preferir tirar uma dúvida com a equipe, me avise.

Link: `https://www.hotelsolar.tur.br/solarsemlimitescadastro?utm_source=instagram&utm_medium=organic_social&utm_campaign=ssl26_novembro_2026&utm_content=direct_guia`

“Agora não”: agradecer e encerrar. “Reserva”, “hospedagem atual” ou pedido humano: encaminhar, sem insistir no cadastro.

### Bloqueios instalados no rascunho do Instagram

Configuração instalada e salva em 18/09; **ainda não publicada nem homologada em execução**. Um bloco com **todas** as condições antes da primeira mensagem e outro antes da mensagem com link: sem `SSL26_OPT_OUT`, sem `ATENDIMENTO_HOTEL_ATIVO`, sem `SSL26_COMPRADOR`. Ramo negativo encerra a aquisição, sem oferta alternativa. A checagem é repetida ao clicar em “Quero o guia”, pois o estado pode mudar entre as mensagens. Essas condições não dispensam gatilho específico e janela válida do Instagram.

Não exigir cadastro/consentimento WhatsApp para responder ao pedido do guia no próprio Instagram. Não atribuir consentimento de outro canal, tag de lead ou perfil por comentário/clique. “Agora não” apenas encerra esta solicitação; não significa opt-out global. Pedido explícito de saída deve seguir o tratamento de supressão. Pedido humano deve encaminhar ao atendimento sem promessa de resposta imediata; esse encaminhamento ainda precisa ser instalado e testado.

## 4. Fluxo B — boas-vindas após cadastro

Nome: `SSL26_02_WA_BOAS_VINDAS`. Iniciar após contato salvo + consentimento + bloqueios conferidos. Contatos novos via API e contatos já existentes precisam de caminhos testados; o gatilho “New contact” sozinho não cobre recadastros.

Dentro da janela permitida, mensagem salva no painel (sem variável de nome não vinculada):

> Olá! ☀️ Aqui é o Hotel Solar, em Salinópolis. Seu Guia Salinas em Família está disponível. Ele começa pelo hotel e pelo entorno, para ajudar a aproveitar a viagem com menos deslocamentos. Quer baixar agora? Você também pode conhecer o Canal VIP ou parar os avisos individuais deste lançamento pelos botões abaixo.

Botões de resposta: **Baixar guia** / **Canal VIP** / **Parar avisos**. Os dois primeiros abrem uma nova mensagem com o link correspondente; o terceiro executa a supressão antes da confirmação. Não misturar botão de URL com respostas no modelo inicial.

Guia: `https://www.hotelsolar.tur.br/solarsemlimitescadastro/guia-salinas-em-familia.pdf`

Convite ao canal:

> No Canal VIP publicaremos os conteúdos e os avisos da visita guiada de 24/11, às 19h. Para acompanhar, abra o link e toque em “Seguir”. Entrar no canal é opcional; seu guia já está liberado.

Canal: `https://whatsapp.com/channel/0029Vb8iEz73gvWjJea5rt3k`

Não mandar nova cobrança caso o contato não clique. Não cadastrar como seguidor apenas por abrir o link.

### Modelo para aprovação no WhatsApp

**Atualização 18/09, 15h20 de Belém:** criado e submetido após autorização explícita de Geraldo. Nome `ssl26_guia_boas_vindas_v1`, Marketing, Portuguese (BR). Ao reabrir, status **Aprovado**, com texto e três botões corretos. O texto efetivamente submetido começa com “Olá! ☀️ Aqui é o Hotel Solar, em Salinópolis.”, sem variável de nome; o restante e os três botões seguem abaixo. Não foi vinculado a fluxo publicado nem enviado a contatos. O texto com variável abaixo é o rascunho histórico, não a versão submetida. Despachante preparado/testado localmente, sem publicação; detalhes em `SSL26_Avanco_80_2026-09-18.md`.

Nome proposto: `ssl26_guia_boas_vindas_v1`. Idioma: pt_BR. Submeter à categoria de marketing, sujeita à classificação e aprovação da plataforma. Não foi submetido. **Texto e botões revisados em 18/09 antes da instalação:** a documentação vigente do ManyChat permite um botão URL OU até três respostas rápidas nesse modelo, não a combinação de ambos. [Modelos de WhatsApp no ManyChat](https://help.manychat.com/hc/en-us/articles/14281326740124-How-to-use-WhatsApp-Messages-Templates-in-Manychat).

> Olá, {{1}}! Aqui é o Hotel Solar, em Salinópolis. Você pediu o Guia Salinas em Família. Toque em Baixar guia para receber o link do roteiro gratuito. No Canal VIP teremos conteúdos e avisos do encontro online de 24/11, às 19h. Para parar os avisos individuais deste lançamento, toque em Parar avisos.

Exemplo fictício da variável: Maria. Três respostas rápidas: **Baixar guia**, **Canal VIP**, **Parar avisos**. Não adicionar botão URL nesse modelo. Após a resposta “Baixar guia”, revalidar elegibilidade/janela e enviar “Seu Guia Salinas em Família está aqui. Boa leitura! ☀️” com botão URL **Abrir guia** para o PDF. “Canal VIP” segue para o convite já definido, com link atual; clique não comprova que a pessoa seguiu. Qualquer envio fora da janela exige modelo aprovado e elegibilidade do contato; aprovar modelo não equivale a autorização para toda a base.

### Condições para boas-vindas e teste

Antes de cada mensagem de aquisição, exigir conjuntamente: `SSL26_LEAD`, `SSL26_CAPTADO`, `ssl26_consent_at` preenchido, `ssl26_consent_source` igual a `landing_ssl26:ssl26_landing_2026_09_v1`, opt-in WhatsApp vigente e ausência de `SSL26_OPT_OUT`, `ATENDIMENTO_HOTEL_ATIVO`, `SSL26_COMPRADOR`. A identidade e a evidência persistida devem ser verificadas pela ponte; apenas campos preenchidos no editor não bastam. Se houver espera ou nova resposta, reavaliar o estado. Se a janela fechou, não substituir por mensagem comum. [Condições](https://help.manychat.com/hc/en-us/articles/14281142518556-Condition-Block) e [janelas de mensagens](https://help.manychat.com/hc/en-us/articles/23358636027932-Understanding-messaging-windows).

Não instalar gatilho global de novo contato. Antes de publicar, implementar comprovante durável de boas-vindas por identidade/campanha e tratamento de resultado incerto; repetir cadastro, perfil ou tag não pode reenviar. O processador atual sincroniza dados, mas ainda não é um despachante de mensagens.

“Parar avisos” não passa pelo bloqueio de aquisição. **Instalado no rascunho:** tag de supressão SSL26, instante dinâmico e origem da saída antes da confirmação. **Pendente:** propagação ao ERP/Brevo e tratamento de falhas, que deve conservar a supressão e gerar pendência, nunca retomar aquisição. Não afirmar saída em todos os canais antes da confirmação dos provedores. Opt-out global existente preservado. Texto salvo:

> Certo! Seu pedido de parar os avisos individuais do Solar Sem Limites neste WhatsApp foi registrado. O atendimento do Hotel Solar continua disponível quando você precisar. Se você também segue o Canal VIP, pode deixar de seguir diretamente no WhatsApp.

Aceite de teste: apenas destinatário autorizado; cenário elegível, sem consentimento, saída, atendimento ativo, comprador, repetição e janela vencida. Verificar saldo/plano e aprovação do modelo antes de um envio real; não recarregar carteira nem alterar plano automaticamente. **Nada desta subseção está homologado ou ativado.**

## 5. Fluxo C — qualificação opcional

Nome: `SSL26_03_PERFIL`. Perguntar uma vez se o campo ainda estiver vazio. Não bloquear guia ou atendimento.

> Para adaptar os próximos conteúdos: você já se hospedou no Hotel Solar?

Opções: **Já me hospedei** (`ja_hospedou`), **Só conheço** (`conhece`), **Ainda não conheço** (`nao_conhece`).

Respostas:

- Já se hospedou: “Que bom ter você por perto novamente! Vamos mostrar como planejar os próximos dias no Solar.”
- Conhece: “Vamos apresentar a experiência com mais detalhes para você decidir com tranquilidade.”
- Não conhece: “Vamos começar por Salinas, pela localização e por um passeio pelo hotel. Assim você conhece antes de decidir.”

Sincronizar o perfil no Brevo sem recriar contato ou alterar consentimento anterior. Sem resposta: manter conteúdo neutro, não adivinhar o perfil.

## 6. Fluxo D — perguntas e atendimento

Nome: `SSL26_04_DUVIDAS`. Menu do lançamento: **Como funciona** / **Datas e pagamento** / **Falar com equipe**.

**Como funciona**

> O Solar Sem Limites é um pacote de diárias antecipadas do Hotel Solar. A opção de 1 pacote reúne 5 diárias regulares e 1 bônus, com validade de 1 ano. As reservas dependem de disponibilidade e seguem o regulamento. O nome do programa não significa uso ilimitado nem garantia de vaga em qualquer data.

**Preço e quantidade** — para esclarecimento solicitado; a régua pública revela a oferta na etapa prevista:

> Um pacote tem preço-base de R$ 3.100. Dois pacotes custam R$ 6.200, totalizam 12 diárias e têm validade de 2 anos. Não há desconto extra por escolher dois. No cartão há acréscimo de 10% sobre o valor processado, com parcelamento em até 12 vezes. As condições completas estarão na página de vendas e no regulamento.

**Disponibilidade**

> A compra gera crédito de diárias; ela não confirma uma reserva de datas específicas. Antes de organizar sua viagem, fale com a equipe para consultar disponibilidade e as regras aplicáveis às diárias regulares e ao bônus.

**Horários**

> A visita guiada será em 24/11/2026, às 19h. As vendas abrem em 25/11, às 8h, e encerram em 01/12, às 23h59, ou antes se o lote de 200 pacotes se esgotar. Horários de Belém. Por enquanto, você pode acompanhar o Canal VIP.

**Falar com equipe**

> Vou encaminhar sua dúvida à equipe do Hotel Solar. Pode contar por aqui o que precisa? Não envie dados de cartão ou senha.

Ações de atendimento: marcar atendimento ativo, bloquear avisos SSL26 e encaminhar com contexto mínimo (nome, perfil, dúvida, etapa; sem cartão). **Destino provisório publicado: Geraldo Barros**, até disponibilizar Kaline. O fluxo de ações e sua confirmação foram testados; ligação a este pedido real ainda pendente. Não prometer atendimento instantâneo/24h sem escala confirmada. Retomada exige decisão explícita após encerramento e nova checagem de consentimento; nunca apaga descadastro nem reenvia mensagens perdidas em lote.

Perguntas sobre feriados, divisão de diárias, cancelamento, prazo exato de validade, início da contagem ou exceções: consultar texto integral vigente. Se não houver resposta conferida, encaminhar ao responsável humano — provisoriamente Geraldo no ManyChat — sem completar por suposição.

## 7. Fluxo E — recuperação

Nome: `SSL26_05_RECUPERACAO`. Somente com pedido/evento real, consentimento e link seguro individualizado. Nunca usar CPF, e-mail ou telefone na URL de campanha. Contador compartilhado para o limite de **3 contatos individuais de recuperação por lead**, somando canais e equipe.

| Situação e espera aprovada | Texto pronto | Ação |
|---|---|---|
| Checkout abandonado, e-mail após 30 min | “Você começou a conhecer as opções do Solar Sem Limites, mas a compra não foi concluída. Se ainda fizer sentido para sua família, retome pelo botão seguro. Se tiver dúvida sobre o uso das diárias, nossa equipe pode ajudar.” Assunto: “Ficou alguma dúvida sobre seu pacote?” | CTA: retomar checkout; suprimir se comprado/recusou/expirou |
| Checkout abandonado, WhatsApp após 4 h | “Olá, {{nome}}! Ficou alguma dúvida sobre o Solar Sem Limites? Posso ajudar com as regras ou com a retomada da compra pelo link seguro. Se não quiser continuar, é só me avisar.” | Modelo aprovado quando necessário; incrementar tentativa |
| Sem conclusão no dia seguinte | “Aqui é a Kaline, do Hotel Solar. Quer que eu esclareça alguma dúvida sobre o pacote? Se não for o momento, sem problema.” | Humano; só se restar tentativa e nenhuma recusa |
| Pagamento pendente, após 2 h | “Recebemos seu pedido {{referencia}} e o pagamento ainda está aguardando confirmação. Se já pagou, aguarde a conferência da equipe antes de fazer outro pagamento. Consulte a situação pelo link seguro.” | Não afirmar inadimplência nem duplicar cobrança |
| Pendente até 24 h | Conferir status e comprovante pelo processo do hotel antes do contato | Kaline; não gerar outra transação sem necessidade |
| Cartão recusado | “A tentativa de pagamento não foi aprovada. Você pode consultar as opções pelo checkout seguro ou falar com nossa equipe. Não envie número do cartão, CVV ou senha por aqui.” | Não atribuir causa da recusa sem evidência |

Mudou para comprador: cancelar recuperação em todos os canais. Pedido expirado: não prometer manter preço/estoque fora da janela. Ausência de integração de compra confiável bloqueia recuperação automática.

## 8. Fluxo F — saída e pós-venda

“Sair”, “parar”, “não quero”, botão de saída ou pedido equivalente no contexto da campanha:

> Certo, vamos interromper os avisos individuais do Solar Sem Limites. O atendimento do Hotel Solar continua disponível quando você precisar. Se você também segue o Canal VIP, pode deixar de seguir diretamente no WhatsApp.

Aplicar `SSL26_OPT_OUT`, cancelar filas, registrar data/origem e sincronizar a supressão no Brevo. Não apagar histórico necessário de pedidos e não bloquear comunicações operacionais solicitadas pelo hóspede. Pedido de parar todas as comunicações deve ser tratado no escopo solicitado, não apenas no lançamento. Falha na sincronização = manter bloqueio local e abrir pendência; não prosseguir enviando.

Após pagamento aprovado e saldo conciliado:

> {{nome}}, seu pagamento foi aprovado! A equipe enviará a confirmação do pacote, seu saldo de diárias e as orientações de reserva. A utilização depende de disponibilidade e do regulamento. Vamos ajudar você a planejar sua próxima visita ao Solar.

Só informar saldo/validade vindos do pedido aprovado, nunca valores fixos da automação. Programa de indicação: 1 diária adicional de baixa temporada por novo comprador indicado com pagamento aprovado, até 2 por CPF. Não gerar recompensa por cadastro, clique ou pagamento pendente. Não publicar promessa de crédito automático antes do teste no ERP.

## 9. Aceite técnico antes de ativar

Estado de 18/09: receptor autenticado `/api/ssl26/manychat-control` e processadores de saída publicados no ERP, com fila separada por provedor e confirmação relida. Migração instalada e atributo booleano `SSL26_OPT_OUT` criado no Brevo. Rota ligada ao rascunho; Geraldo salvou a chave, e o teste do editor confirmou autenticação com 503 `integration_disabled`, sem executar a saída. Aceita apenas o ID nativo ManyChat, relê o WhatsApp real e exige `SSL26_OPT_OUT` já aplicado. Callback/processadores seguem desligados. Boas-vindas têm registro único preventivo no banco, mas nenhum disparador usa esse registro ainda. Não marcar saída/deduplicação/ponte completas com base apenas nos testes locais. [Auditoria e limites atuais](SSL26_Auditoria_ManyChat_2026-09-18.md); instalação no ERP em `docs/ssl26-saida-e-boas-vindas.md`.

- [x] WhatsApp e Instagram conectados, conforme confirmação de Geraldo; manter o número atual.
- [x] Validar acesso seguro de leitura à API da conta Hotel Solar e consultar inventário de tags, campos e fluxos (18/09/2026).
- [ ] Conferir tecnicamente conexões dos canais, gatilhos e conteúdo das automações existentes; acesso à API não substitui essa homologação.
- [x] Receber e-mail e WhatsApp autorizados da equipe para teste; informados por Geraldo.
- [x] Validar recebimento do e-mail isolado e destino do botão Responder, confirmados por Geraldo. Não é validação da integração ManyChat.
- [x] Validar recebimento e três botões no destinatário autorizado: confirmação de 18/09; saída conferida, sem reinscrição/reenvio.
- [x] Criar e conferir 13 tags e 12 campos; registrar IDs reais em arquivo local fora do Git (18/09/2026).
- [x] Criar os rascunhos `SSL26_01_IG_GUIA` e `SSL26_02_WA_BOAS_VINDAS`, conectar as condições e conferir salvamento/URLs/destinos no painel. Não homologados em execução.
- [ ] Instalar os demais fluxos, saída por texto e encaminhamento humano; definições sozinhas não bloqueiam ou enviam mensagens.
- [x] Criar segmentos de conferência de cadastros e pedidos de saída no Brevo (#14/#15, 20/09), sem ligar campanhas. Não substituem a audiência final por canal.
- [x] Instalar receptor HTTPS autenticado, fila privada e deduplicação persistida; autenticação do callback conferida sem execução.
- [ ] Homologar a ponte nos provedores e definir processamento/conciliação; não há agendador automático nesta versão.
- [ ] Testar contato novo e existente sem retirar tags de reservas.
- [ ] Testar SAIR em cada ponto, bloqueio durante atendimento e compra enquanto há espera.
- [x] Conferir modelo aprovado e um envio somente ao QA autorizado (18/09); usuário confirmou entrega/botões.
- [ ] Reconferir custos, limites e condições vigentes antes da campanha de novembro; aviso de alteração de cobrança a partir de outubro observado no painel.
- [ ] Confirmar perfil e origem no Brevo; entrada no painel do ERP ainda precisa ser implementada/verificada.
- [ ] Simular falha da ponte, repetição de evento, opt-out atrasado e reprocessamento.
- [ ] Evidência fim a fim com equipe antes de publicar gatilhos/disparos.

## Referências verificadas em 17/09/2026

A criação de contato via API depende dos recursos disponíveis no plano; contatos existentes exigem tratamento próprio. Ver [ManyChat: contatos de WhatsApp via API](https://help.manychat.com/hc/en-us/articles/14281353475228-How-to-create-WhatsApp-contacts-via-Manychat-API).

A conexão do número existente exige verificação da conta e do método de coexistência disponível. Ver [ManyChat: conectar número existente](https://help.manychat.com/hc/en-us/articles/14959925356572-How-to-transfer-your-own-WhatsApp-number-to-Manychat). Nenhuma migração foi executada nesta preparação.
