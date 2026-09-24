# SSL26 — publicação das proteções e da rotina privada

**24/09/2026, conferência concluída aproximadamente às 10h08 de Belém. Código publicado nos três projetos; dois fluxos ManyChat publicados e parados. Campanha desligada; AUT-06 parcial; preparação mantida em 84%.**

## Autorização e escopo executado

Geraldo autorizou o commit e a publicação do código e dos rascunhos revisados, mantendo campanha, gatilhos e rotinas de envio desligados. A publicação incluiu somente as proteções e seus testes/documentação, preservando alterações locais de design, imagens e outras frentes.

Não houve nova migração, mudança de configuração, registro ou processamento de tarefa real, aplicação de marcador a contato, mensagem, inscrição, compra ou ativação de campanha. As verificações HTTP usaram somente corpo vazio, sem identificadores de clientes.

## Código publicado

| Destino | Commit de código | Implantação | Estado |
|---|---|---|---|
| [ERP](https://erp-hotel-solar.vercel.app) | `50e234f` | `dpl_CstdZZamhj2BFhNjD4JDbZfVQmFY` | Produção · READY |
| [API de origem](https://solar-sem-limites.vercel.app) | `ee608f7` | `dpl_94bFqKU56JmAtiBK2y11cbWC8E5h` | Produção · READY |
| [Site principal](https://www.hotelsolar.tur.br/solarsemlimitescadastro) | `4e041f1` | `dpl_GUWWWu2T7gA8msU1rYqchAXesA1L` | Produção · READY |

Os três commits foram enviados sem force push aos repositórios já conectados à Vercel. Os builds usaram os commits versionados, não o conteúdo sujo dos diretórios locais. Os aliases canônicos foram conferidos nas implantações.

- ERP: seis tags de retenção unificadas em sincronização/boa-vinda, incluindo `SSL26_PAUSA_REVISAO`; rota privada para **uma tarefa de exclusão já registrada**, desativada por padrão, sem agenda ou preenchimento retroativo.
- API e site: releitura do telefone antes de e-mail/Meta, retendo a entrega se a identidade mudar após salvar. As duas cópias são idênticas: SHA-256 `d51ef4fb202cdc5c846dbb8af698fdc6c4c96872cdd801624be6c0a29f320988`.
- Não foram modificados guia, imagens, textos, preços, calendário ou consentimentos.

## ManyChat publicado sem ativação de entradas

| Fluxo | Revisão conferida | Resultado após publicar e recarregar |
|---|---|---|
| [SSL26_01_IG_GUIA](https://app.manychat.com/fb156918594386969/cms/files/content20260918141216_689711/edit) | Duas condições com as seis exclusões por ausência de tag, todas obrigatórias | `STOPPED`, `Salvo`; botão de publicação substituído por `Salvo` desabilitado |
| [SSL26_02_WA_BOAS_VINDAS](https://app.manychat.com/fb156918594386969/cms/files/content20260918144151_090401/edit) | Três condições, cada uma com seis exclusões mais cinco exigências anteriores de cadastro/consentimento | `STOPPED`, `Salvo`; confirmação “A versão publicada foi atualizada” |

Os cinco pontos foram relidos após recarregar. Os blocos iniciais mostram apenas **Novo Gatilho**, sem entrada configurada. Nenhum gatilho foi criado ou ligado. Não foram usados prévia, execução, teste com contato ou envio pela API.

Na primeira publicação do Instagram, apareceu a notificação genérica “A automação está ativa”. O cabeçalho permaneceu `STOPPED`, o bloco de gatilho estava vazio e a reabertura confirmou `STOPPED`/`Salvo`. A notificação de publicação não foi tratada como prova de ativação da campanha.

Textos, links, ações de saída, consentimentos e conexões foram preservados. Publicação disponibiliza a revisão, mas **não é teste de entrega nem homologação da audiência inteira**.

## Controles preservados

Conferência direta do ambiente de produção, sem carregar configurações locais e sem imprimir segredos:

| Controle do ERP | Estado |
|---|---|
| `SSL26_SYNC_ENABLED` | `false` |
| `SSL26_AUTOMATIONS_REVIEWED` | `false` |
| `SSL26_SUPPRESSION_ENABLED` | `false` |
| `SSL26_WELCOME_ENABLED` | Ausente; desativado por padrão |
| `SSL26_EXCLUSION_PROCESS_ENABLED` | Ausente; desativado por padrão |
| `SSL26_EXCLUSION_METADATA_REVIEWED` | Ausente; revisão não concedida |
| `SSL26_CENTRAL_ELIGIBILITY_ENABLED` | `true`, preservado no ERP e no site principal |

Não foram alteradas variáveis, credenciais ou permissões. A proteção central permanece ligada; não foi usado desligamento da proteção como atalho. As rotinas operacionais existentes do hotel não foram reconfiguradas.

## Verificações e limites

- Preparação local anterior: **738 testes ERP + 99 da página aprovados**, sem falhas/ignorados. [Relatório local](SSL26_Processador_Exclusoes_Local_2026-09-24.md).
- Nesta publicação: **118 testes críticos do ERP + 99 da página repetidos**, todos aprovados; TypeScript completo do ERP aprovado. Não somar esses resultados novamente à preparação anterior.
- **12 verificações HTTP em produção aprovadas**:
  - Quatro rotas (`exclusions/process`, `process`, `suppression/process`, `welcome`): sem credencial → **401**; com credencial e corpo vazio → **503 / activation_gate**. Todas com `private, no-store`. O bloqueio acontece antes da seleção de tarefa ou envio.
  - Cadastro vazio na origem e no site principal → **400**, sem cadastro ou mensagem.
  - Captação e vendas no domínio principal → **200**.
- Os testes HTTP não transmitiram IDs, e-mails ou telefones de clientes. Não houve chamada de envio nem operação com destinatário real.
- Não foi feita auditoria global de contatos, filas ou todos os fluxos legados. Não há alegação de conciliação completa ou contagem de clientes preservada por nova consulta ao banco nesta rodada.

As orientações de publicação da Vercel foram usadas para conferir projeto, commit, build e aliases. A validação de navegador foi feita no Chrome conectado, pois o executável `agent-browser` não estava disponível. A leitura do ambiente foi limitada à exibição dos controles não secretos.

## Próximo passo

1. Conferir em modo somente leitura as tarefas existentes e as evidências de identidade, QA, pausa e comprador por canal. Ausência de tag não é autorização de envio; tarefa ausente não deve ser fabricada para testar.
2. Concluir a revisão de cobertura das automações antes de liberar os controles exigidos pelo processador. A revisão global permanece falsa; não deve ser ligada apenas para viabilizar o piloto.
3. Definir e autorizar um piloto restrito de sincronização de marcadores, sem mensagens, reinscrição ou campanha. Esta publicação não autoriza esse novo processamento com contatos.
4. Concluir conciliação e homologação, incluindo timeout real e conversa inicialmente fechada/com outro responsável (AUT-05), antes de liberar a captação.

Referências de recuperação anteriores preservadas: ERP `dpl_9aTfoeHdkNSKFgYo2DDvLmq3hc3o`; origem `dpl_5mdaaCogWnxKzTTL49UwEDdWwP3j`; site `dpl_37RV3N5eUzJ7ZJ2T4VUdqFS2kphf`. Não houve alteração de banco a desfazer. Em qualquer revisão futura, preservar saídas, consentimentos e evidências; não ligar envio para verificar disponibilidade.

[Checklist mestre](SSL26_Checklist_Mestre.md) · [Rascunhos anteriores](SSL26_Guardas_Rascunhos_2026-09-24.md) · [Filtros de exclusão](SSL26_Filtros_Exclusao_2026-09-24.md).
