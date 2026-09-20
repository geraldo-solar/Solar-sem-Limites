# SSL26 — publicação e preparação da pausa de atendimento

**Revisão mais recente:** ERP `a1a4884` e fluxo com destino Geraldo/retorno mapeado publicados e testados em 20/09 às 17h47, mediante nova autorização. [Resultado atual](SSL26_Atendimento_Destino_e_Confirmacao_2026-09-20.md). As publicações abaixo são históricas.

**Atualização posterior:** receptor de pausa habilitado e mesma revisão republicada; teste autorizado com Geraldo e repetição concluídos em 20/09 às 17h28. [Publicação e estado atuais](SSL26_Teste_Atendimento_Geraldo_2026-09-20.md). Este documento preserva a publicação inicial, quando a flag estava desligada.

20/09/2026. **Campanha desligada. Preparação mantida em 74%, meta de 80% ainda pendente.** Publicar a entrega já contada como preparada não justifica contar os mesmos pontos novamente.

## Concluído

- Publicado o controle de boa-vinda única e a correção de data do ManyChat, commit `6355e32282c5ba49af05d1f6a19252579dc8f775`. Produção **READY**, build Next.js em 96,4 segundos, deployment `dpl_CahenKGckA9cjQJMUazGdMKk2y3S`.
- Preservada a versão de Pessoal `3c245fa` já existente em produção. Publicação seletiva dos nove arquivos SSL26, sem credenciais ou documentos de outras frentes.
- Oito sondagens HTTP na versão publicada passaram. Sem chave: 401 nas quatro rotas. Com chave e corpo vazio: boas-vindas/sincronização/supressão recebem 503 `activation_gate`; receptor de saída recebe 400 `invalid_control`. Respostas privadas e sem cache. Nenhum identificador de cliente foi enviado.
- Teste anterior relido, sem executar novamente: QA continua descadastrado, uma boa-vinda, dois trabalhos de supressão concluídos uma vez e demais listas/tags/permissões preservadas.
- Implementado, testado e publicado o receptor de **pausa durante atendimento**, commit `fe57bbf0caa8e34c54e39e44155a0b9eeeef9dd4`, **READY**. A função já foi instalada no banco, com acesso restrito ao servidor e sem alterar contatos; flag de ativação ausente/desligada.
- **134 testes aprovados, zero falhas e zero ignorados**; quatro suítes PostgreSQL isoladas, TypeScript e checagem de alterações aprovados. Quinze testes cobrem especificamente a pausa, inclusive bloqueio de boa-vinda reservada e eventos pendentes/em andamento.

## Publicação mais recente

- **URL:** [ERP Hotel Solar](https://erp-hotel-solar.vercel.app/).
- **Alvo:** produção, branch `main`.
- **Status:** **READY**, aliases aplicados, sem erro de alias.
- **Commit:** `fe57bbf0caa8e34c54e39e44155a0b9eeeef9dd4`.
- **Framework:** Next.js, região `iad1`.
- **Build:** 60,8 segundos.
- **Deployment:** `dpl_8Eu26btV1M8CGJ39u6WBcEAyxPhH`.

Na versão final, repetidas **dez sondagens HTTP**: cinco rotas sem chave retornaram 401; com chave/corpo vazio, boas-vindas/sincronização/supressão continuam 503 `activation_gate`, saída retorna 400 `invalid_control` e pausa retorna 503 `integration_disabled`. Todas privadas e sem cache.

Mais duas sondagens na RPC de pausa, somente com identificadores **nulos**: público `anon` recebeu 401/`42501`; servidor recebeu 200 com `ok:false, reason:invalid_control`, antes de qualquer gravação. **Doze verificações aprovadas, zero identificadores reais submetidos, zero mensagens solicitadas.** Isso não comprova a execução de um encaminhamento humano real, ainda pendente.

Sem alteração de variáveis, criação de cron, disparos, nova inscrição ou mudança em automações ManyChat/Brevo nesta rodada. A função de pausa foi instalada, não executada sobre um cliente real.

## O que a pausa já protege e o que ainda falta

O servidor exige o ID nativo, conta correta, WhatsApp efetivo e as tags de cadastro/atendimento no ManyChat. O ERP confirma o vínculo exato antes de gravar. Não recebe telefone arbitrário, não reativa consentimento, não remove descadastro e não retoma mensagens automaticamente.

**Ainda falta conectá-la ao encaminhamento humano do ManyChat e homologar com autorização específica.** O bloco legado `Falar com atendente` continua apenas notificando responsáveis; não foi alterado. Esta função também não aplica sozinha exclusões nas campanhas Brevo.

Próxima ordem de trabalho:

1. Preparar o encaminhamento SSL26 em rascunho, mantendo atendimento habitual do hotel intacto.
2. Conferir a pausa/saída e as exclusões de audiência nos canais; testar o atendimento sem reinscrever QA.
3. Concluir o caminho de contato novo, gatilhos e tratamento de falhas antes do processamento automático.
4. Validar Meta Pixel/atribuição e concluir peças de captação para aprovação. Não liberar tráfego ou orçamento com base no percentual.

## Observabilidade e recuperação

Na publicação `6355e32`, consulta de logs `error/fatal`, rotas SSL26, entre **19:22:10 e 19:37:10 UTC** não encontrou registros. Trata-se de amostra curta, não garantia de entrega nem monitoramento contínuo. Consulta somente de leitura da API Vercel retornou **zero Drains na equipe**. Nenhum encaminhamento externo de logs foi criado.

Na publicação final `fe57bbf`, a mesma busca restrita não encontrou logs `error/fatal` na janela **19:35:38–19:45:38 UTC** (16:35–16:45 de Belém). Parte da janela antecede a conclusão do build; não tratar como dez minutos completos de tráfego real. Antes de liberar a campanha, definir acompanhamento de falhas e alertas; não foi criada cobrança, integração externa de logs ou automação recorrente nesta rodada.

Não há monitoramento recorrente novo. As respostas 503 dos gates são bloqueios deliberados, não tentativa de envio malsucedida. Em incidente, primeiro desligar somente a integração afetada e conferir estado dos provedores; nunca resetar o registro de boa-vinda para tentar reenviar.

A versão `6355e32` é referência para recuar somente o novo receptor de pausa; a versão `3c245fa` preserva Pessoal caso seja necessário recuar também a boa-vinda. Nenhum rollback foi executado. Não voltar automaticamente a `7fd263b`, que precede atualizações de Pessoal.

Detalhes: [pausa de atendimento no ERP](<../../ERP Hotel Solar/docs/ssl26-pausa-atendimento.md>) e [boa-vinda única](<../../ERP Hotel Solar/docs/ssl26-despachante-boas-vindas.md>). A revisão visual do guia continua adiada como combinado.
