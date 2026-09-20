# SSL26 — teste autorizado de pausa com Geraldo

**Estado posterior:** destino provisório Geraldo e confirmação da pausa publicados e testados com nova autorização às 17h47. [Revisão mais recente e pendências](SSL26_Atendimento_Destino_e_Confirmacao_2026-09-20.md). Este relatório preserva o teste original das 17h26; ele não foi reexecutado.

**20/09/2026 · teste controlado concluído · campanha desligada · AUT-05 ainda parcial.**

Geraldo escolheu o próprio WhatsApp final **1312** em lugar do final 0800. A pré-checagem encontrou descadastro preservado, mas ausência do vínculo ManyChat no lead e da tag `SSL26_LEAD`. Após explicação, autorizou expressamente vincular os dois cadastros conferidos e aplicar essa identificação, **mantendo descadastro, sem lista comercial e sem mensagens**. O contato final 0800 não foi usado nesta rodada.

## Resultado comprovado

| Verificação | Resultado |
|---|---|
| Identidade | Conta, ID nativo, WhatsApp real, e-mail e cadastro existente conferidos nos provedores e ERP |
| Preparação autorizada | Somente vínculo do ID nativo no lead e tag `SSL26_LEAD`; nenhum consentimento novo |
| Execução | Uma chamada ao fluxo `SSL26_03_ATENDIMENTO_HUMANO`, aceita às 17h26 de Belém |
| ManyChat | Tag `ATENDIMENTO_HOTEL_ATIVO` aplicada pelo fluxo; conversa aberta confirmada no painel |
| ERP | Pausa persistida às **17h26min27s**, um único evento novo `pause`, origem `manychat` |
| Repetição | Apenas o callback repetido: **202, `duplicate=true`, `centralPause=true`**, nenhum evento extra |
| Saída | `SSL26_OPT_OUT` e data original de saída de 18/09 preservados; contato continua fora da lista Brevo 24 |
| Dados preservados | Demais tags, campos, opt-ins, listas, atributos Brevo e dados do lead inalterados, exceto vínculo expressamente autorizado |
| Envios | Fluxo sem blocos de mensagem; zero entregas novas, nenhum e-mail, modelo ou mensagem solicitado pelo teste |
| Processadores | Boas-vindas, sincronização e supressão continuam respondendo **503 `activation_gate`** |

**A conversa já estava aberta antes do teste.** A ação de abertura fez parte do fluxo executado, e o painel confirmou que continua aberta, mas este teste não comprova a transição de uma conversa fechada para aberta. Não a fechamos artificialmente para testar. Não houve atribuição específica a Kaline, notificação adicional, mudança das automações gerais ou retomada automática.

Dois trabalhos antigos de supressão continuaram concluídos, uma tentativa cada, sem mudanças. A verificação final ocorreu às **17h28 de Belém**. O contato foi deixado **descadastrado e pausado**, como autorizado; não remover esses bloqueios ao terminar o QA.

## Fluxo e publicação

Fluxo [SSL26_03_ATENDIMENTO_HUMANO](https://app.manychat.com/fb156918594386969/cms/files/content20260920200855_623835/edit), ID `content20260920200855_623835`, publicado após releitura das três etapas, autenticação e ID dinâmico. Painel mostrou **Salvo / STOPPED**, sem gatilho público. A execução foi pontual pela API com identidade fixa; não foi ligado ao menu, palavra-chave, sequência ou atendimento geral.

### Resultado da publicação ERP

- **URL:** [ERP Hotel Solar](https://erp-hotel-solar.vercel.app/).
- **Alvo:** produção.
- **Status:** **READY**, aliases conferidos.
- **Commit:** `fe57bbf0caa8e34c54e39e44155a0b9eeeef9dd4`, o mesmo que já estava em produção e em `main`.
- **Framework:** Next.js.
- **Build:** aproximadamente **64,2 segundos**.
- **Deployment:** `dpl_4zMZSEYCuDKYChFcfjLTSSJoLLEM`.
- **Mudança de configuração:** somente `SSL26_SUPPORT_CONTROLS_ENABLED=true`, no ambiente de produção. Receptor de saída existente preservado; nenhuma outra flag de campanha liberada.

Republicação da revisão existente, sem upload do diretório local, commit novo ou inclusão das alterações de outras frentes. O receptor exige autenticação e vínculo real; não é endpoint público de reinscrição ou envio. A sondagem autenticada com corpo vazio retornou 400 antes do teste; o callback válido foi comprovado pela pausa criada após a execução do fluxo e pela resposta da repetição.

### Observabilidade após publicação

- Consulta de logs nível `error`, limitada ao novo deployment e últimos 15 minutos: **zero registros** na amostra.
- **Drains:** zero configurados na equipe na leitura desta rodada.
- **Monitoramento:** apenas verificações pontuais; alertas/rotina de revisão ainda pendentes. Nenhuma automação recorrente ou serviço externo foi criado.

## Método e limites

Script pontual em `/private/tmp/ssl26-support-geraldo-20260920.mjs`, com identidade/fluxo fixos, lista fechada de operações e comprovante privado de intenção antes das escritas. Credenciais lidas dos arquivos privados existentes, nunca impressas. Estado anterior/posterior guardado em comprovante local com permissão 600, fora dos repositórios. Não copiar dados pessoais desse comprovante para este relatório.

A primeira pré-checagem usou um endereço inexistente para a rota de boas-vindas e parou **antes de qualquer escrita em contato**. Corrigido para `/api/ssl26/welcome`, verificada ausência de intenção de escrita e executada a preparação autorizada. Nenhum fluxo foi reenviado: houve uma execução integral e uma repetição idempotente apenas do callback.

Não houve alteração de código de produção nesta rodada. Os 134 testes automatizados citados no relatório anterior são da implementação/publicação anterior, não uma nova execução nesta rodada. A homologação aqui usa serviços reais e confirma o caminho positivo da pausa; falhas de provedor, timeouts e contato sem vínculo continuam exigindo ensaio operacional e alerta antes da liberação geral.

## Próxima etapa

1. Definir e testar destino humano e revisão de falhas, sem prometer sucesso central quando a chamada falhar.
2. Conectar o fluxo a um pedido explícito de atendimento SSL26 sem bloquear descadastrados/compradores; preservar a operação geral do hotel.
3. Homologar conversa inicialmente fechada e casos negativos, sem reinscrever QA ou disparar a campanha.
4. Concluir exclusões de audiência, contato novo e processamento antes do aceite geral.

**AUT-05 permanece parcial e a preparação em 74%.** O teste de pausa passou, mas não é ativação do atendimento completo nem homologação de todas as exclusões de e-mail. Não contar a publicação novamente como pontos de preparação.

[Checklist mestre](SSL26_Checklist_Mestre.md) · [Configuração do fluxo](SSL26_Atendimento_ManyChat_2026-09-20.md) · [Matriz de preparação](SSL26_Painel_Preparacao.md)
