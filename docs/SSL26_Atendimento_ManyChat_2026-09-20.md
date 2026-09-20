# SSL26 — configuração do atendimento e pausa

**Atualização mais recente, 20/09 às 17h49:** destino provisório **Geraldo Barros** aprovado e publicado; adicionados marcador de revisão, confirmação booleana e retirada exclusiva da pendência após resposta positiva do ERP. Uma execução da revisão autorizada e conferida, mantendo descadastro e pausa, sem envio ao cliente. Fluxo continua **STOPPED/Salvo, sem gatilho público**. Falhas reais/entrada pública e conversa fechada ainda pendentes; AUT-05 parcial, 74%. [Revisão publicada e teste](SSL26_Atendimento_Destino_e_Confirmacao_2026-09-20.md). As seções abaixo são históricas.

**Estado posterior, 20/09 às 17h28 de Belém:** Geraldo escolheu o próprio contato final 1312 e autorizou o vínculo técnico/tag de identificação, sem reinscrição. Fluxo publicado **sem gatilho público**, executado uma vez; pausa no ERP e repetição sem duplicidade confirmadas, saída preservada. Receptor de pausa habilitado; campanha e demais processadores continuam desligados. Ainda faltam destino/falhas e entrada real; AUT-05 parcial, 74%. [Teste e publicação atuais](SSL26_Teste_Atendimento_Geraldo_2026-09-20.md).

## Histórico da preparação, antes do teste

**20/09/2026 · conferência estática no painel ManyChat · AUT-05 parcial.**

Criado e salvo [SSL26_03_ATENDIMENTO_HUMANO](https://app.manychat.com/fb156918594386969/cms/files/content20260920200855_623835/edit), ID `content20260920200855_623835`, na conta Hotel Solar. **Não publicado, sem gatilho, sem execução e sem mensagens.** O atendimento habitual do hotel e o fluxo publicado de boas-vindas foram preservados.

## O que ficou preparado

| Ordem | Etapa salva | Comportamento configurado |
|---|---|---|
| 1 | Abrir atendimento e pausar localmente | Adicionar `ATENDIMENTO_HOTEL_ATIVO`, depois marcar conversa como aberta |
| 2 | Lead para pausa central | Exigir conjuntamente tag `SSL26_LEAD` e campo de sistema `WhatsApp ID` preenchido |
| 3, ramo positivo | Solicitar pausa no ERP | POST autenticado para `/api/ssl26/manychat-support`, com apenas o ID nativo do contato |
| Ramo negativo | Encerrar este fluxo | Não chamar o ERP; a conversa aberta e a tag local permanecem |

O campo nativo **ID do contato** foi escolhido pelo seletor do ManyChat, não digitado como um identificador fixo. O corpo contém somente `subscriberId`; não envia telefone, e-mail, dados completos do contato ou comando de retomada. `Content-Type: application/json` e autenticação privada existentes foram configurados e conferidos após salvar/reabrir, sem registrar a credencial neste documento.

A pré-visualização do JSON resolveu o campo dinâmico, mas **não foi usada a ação Solicitação de Teste**. O contato padrão que o editor apresenta não é autorização para execução. Antes de testar, selecionar e confirmar a identidade exata autorizada.

Não há condição de consentimento comercial, ausência de saída ou ausência de compra para abrir atendimento. A condição da etapa 2 decide apenas se deve tentar a pausa central; ela não impede o encaminhamento humano. `WhatsApp ID` preenchido não comprova vínculo com o ERP: essa validação continua no servidor, pelo ID nativo e WhatsApp efetivo.

## Limites importantes

- A tag local só bloqueia fluxos que a consultam. Não equivale a pausar automaticamente todas as automações do hotel.
- Abrir a conversa coloca-a na caixa de entrada; **não houve atribuição específica a Kaline nem configuração de notificação à equipe** neste rascunho.
- Não há resposta ao cliente anunciando pausa central, nem remoção de tag/descadastro ou retomada automática.
- Ainda não há mapeamento de resposta ou alerta de falha instalado no fluxo. Uma resposta de erro não pode ser tratada como confirmação; falta definir a revisão operacional antes de ativar.
- A flag `SSL26_SUPPORT_CONTROLS_ENABLED` permanece desligada conforme a última verificação de produção; não houve alteração de configuração ou deployment nesta rodada. Os demais processadores da campanha também não foram ativados.
- Nenhum contato foi marcado, aberto, pausado, reinscrito ou notificado nesta rodada. A configuração salva **não é teste fim a fim**.

## Ordem prevista na preparação — situação anterior ao teste

1. Obter autorização específica para testar com o contato final 0800 da homologação anterior. Pergunta enviada; **resposta pendente**. O teste proposto não envia mensagem, abre atendimento e mantém saída e pausa ao final.
2. Conferir identidade e estado anterior; habilitar somente o receptor de pausa, preservando os bloqueios de campanha. Revisar/publicar apenas o necessário para o teste controlado, sem gatilho público.
3. Exercitar o fluxo completo, verificar conversa/tag e confirmação durável no ERP; testar repetição e falha sem reinscrição ou envio. Registrar provas sem dados pessoais neste relatório.
4. Definir destino humano, tratamento de falhas e ponto de entrada SSL26. Não colocar atendimento atrás das condições de aquisição que excluem descadastrados/compradores; preservar os gatilhos gerais do hotel.
5. Só marcar AUT-05 como concluído após conexão real e homologação. **Preparação mantida em 74%**, sem pontos extras por um rascunho parcial.

[Checklist mestre](SSL26_Checklist_Mestre.md) · [Operação ManyChat](SSL26_Operacao_ManyChat.md) · [Publicação da API e testes anteriores](SSL26_Publicacao_e_Pausa_2026-09-20.md)
