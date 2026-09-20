# SSL26 — destino humano e confirmação da pausa

**20/09/2026, conferência final às 17h49 de Belém. AUT-05 parcial; preparação geral mantida em 74%.**

Geraldo escolheu o próprio usuário como destino provisório porque Kaline e Andrey não aparecem entre os agentes disponíveis no ManyChat. Depois autorizou a publicação desta revisão e **uma única execução** no próprio contato final 1312, sem mensagem ao cliente, reinscrição, fechamento de conversa ou ativação da campanha. A possibilidade de notificação interna de atribuição foi informada. Não foram convidados agentes nem contratadas licenças.

## Entrega publicada

Fluxo [SSL26_03_ATENDIMENTO_HUMANO](https://app.manychat.com/fb156918594386969/cms/files/content20260920200855_623835/edit), ID `content20260920200855_623835`, publicado e reaberto com **Salvo / STOPPED**, **sem gatilho público**. Cinco etapas conectadas, sem blocos de mensagem:

| Ordem | Etapa | Configuração conferida |
|---|---|---|
| 1 | Abrir atendimento e pausar localmente | Aplicar `ATENDIMENTO_HOTEL_ATIVO`, abrir conversa, atribuir a **Geraldo Barros**, aplicar `SSL26_PAUSA_REVISAO` e definir `ssl26_support_pause_ok=false` |
| 2 | Lead para pausa central | Exigir simultaneamente `SSL26_LEAD` e `WhatsApp ID` preenchido; negativo encerra conservando atendimento e revisão |
| 3 | Solicitar pausa no ERP | POST autenticado existente com ID nativo dinâmico; mapear `$.centralPause` ao campo booleano `ssl26_support_pause_ok` |
| 4 | Pausa confirmada no ERP | Continuar somente se `ssl26_support_pause_ok` for verdadeiro |
| 5 | Limpar somente pendência de pausa | Remover **apenas** `SSL26_PAUSA_REVISAO`; não fechar conversa, retirar saída/atendimento ou retomar avisos |

A abertura e a atribuição acontecem antes da chamada externa. Descadastro, compra ou ausência de consentimento comercial não impedem atendimento. Sem vínculo seguro ou confirmação, o marcador deve permanecer para revisão. Não existe mensagem ao cliente afirmando sucesso nem repetição automática de solicitação no fluxo.

O marcador sinaliza pendência na ficha/filtro do ManyChat; **não é alerta de falha por e-mail/SMS nem monitoramento contínuo**. Não foi instalada ação `Notificar responsáveis`. Eventual notificação interna padrão de atribuição não teve recebimento comprovado.

## Estrutura e compatibilidade

Criadas somente a tag `SSL26_PAUSA_REVISAO` (ID `97012418`) e o campo booleano `ssl26_support_pause_ok` (ID `14985170`). Consulta somente leitura às 17h43 confirmou **14 tags e 13 campos SSL26**, nenhum item ausente ou conflito de tipo; totais da conta: 91 tags e 96 campos. Manifesto local e testes atualizados. O inventário privado de 18/09 é histórico; para conferir o atual, usar `node scripts/setup_manychat_ssl26.mjs --dry-run`.

No ERP, somente o sucesso da rota de atendimento mudou de HTTP 202 para **HTTP 200**, após confirmação durável do banco. Falhas continuam 400/401/409/503; não se convertem erros em sucesso. Contrato mínimo, autenticação, identidade, pausa, deduplicação e bloqueios foram preservados. A rota de descadastro não mudou.

O [manual oficial de Dev Tools do ManyChat](https://help.manychat.com/hc/en-us/articles/14281252007580-Dev-Tools-Basics) documenta limite fixo de 10 segundos, restrição de mapeamento para respostas diferentes de 200 e necessidade de executar o fluxo para validar a gravação dos campos. Por isso cada entrada começa pendente, zera a confirmação e só limpa o marcador após resposta positiva. Uma demora pode deixar revisão necessária mesmo que o ERP tenha concluído a gravação; conferir antes de repetir.

## Provas do teste autorizado

- **17h45min25s:** estado anterior comparado ao encerramento do teste anterior. Identidade e vínculo exatos, saída original de 18/09 e pausa já presentes. Sem marcador de revisão nem campo de confirmação aplicado. Brevo fora da lista comercial e demais dados preservados.
- **17h47min07s–10s:** uma chamada para executar o fluxo, aceita pelo ManyChat. Intenção gravada antes da chamada para impedir repetição após resposta incerta. Não houve segundo disparo, teste adicional pelo editor ou callback extra.
- **17h47min36s:** campo booleano retornou **true**; marcador de revisão ausente ao final. Histórico do Inbox mostrou inclusão da tag, alterações do campo e remoção da tag.
- **Destino:** versão publicada reaberta com `Atribuir Conversa → Geraldo Barros`. Conversa exibe `Eu` na sessão de Geraldo antes e depois; não se afirma transição de outro agente para Geraldo. Já estava aberta e continuou aberta; não é teste fechada→aberta.
- **Preservação:** saída original, pausa central, cadastro, vínculo, tags anteriores, campos não relacionados, opt-ins globais, atributos/listas Brevo, trabalhos de supressão e registros de entrega iguais ao estado anterior. Apenas o novo campo booleano permaneceu acrescentado. Nenhum evento extra de pausa, pois o contato já estava pausado.
- **Bloqueios:** `/api/ssl26/process`, `/api/ssl26/suppression/process` e `/api/ssl26/welcome` seguiram com 503 `activation_gate`. Atendimento com corpo vazio retornou 400 `invalid_control`. Nenhuma variável de ambiente foi modificada.

Recibo técnico privado protegido com permissão 600, fora do repositório. A consulta ao Inbox não enviou resposta, fechou conversa ou pausou globalmente as automações do hotel.

## Publicação e verificação técnica

### Deploy Result

- **URL:** [ERP Hotel Solar](https://erp-hotel-solar.vercel.app/)
- **Target:** production
- **Status:** READY
- **Commit:** `a1a488408140955dc897cb117ea0d401526723a9`
- **Framework:** Next.js
- **Build Duration:** 53,4 segundos
- **Deployment:** `dpl_9CRmGq4oSnWpMJyBfXbp8JUTKXZ7`

Publicação seletiva pelo Git: somente `src/lib/ssl26/support.ts` e os dois testes de atendimento. Demais alterações locais preservadas. **88 testes SSL26**, incluindo quatro suítes PostgreSQL isoladas, e **14 testes do manifesto ManyChat** aprovados; nenhum ignorado. TypeScript completo do ERP e checagem de espaços aprovados.

### Post-Deploy Observability

- **Error scan:** zero registros na consulta restrita ao novo deployment/últimos 15 minutos, antes e depois do teste. Conferência final às 17h49.
- **Drains:** zero configurados na consulta da equipe.
- **Monitoring:** sem monitoramento contínuo ou alertas instalados; consulta pontual não comprova ausência geral de falhas.

## Pendências para concluir AUT-05

1. Preparar entrada específica SSL26 por botão/menu ou frase exata, fora das condições comerciais. Não substituir respostas gerais do hotel nem os três botões do modelo de boas-vindas aprovado.
2. Homologar a entrada antes de ativá-la. Esta publicação continua sem gatilho público.
3. Validar no ManyChat erro/timeout e confirmação ausente em cenário controlado e autorizado. Os casos do servidor passaram localmente; **não foi provocada falha real em produção** nesta rodada.
4. Testar conversa inicialmente fechada e atribuição a partir de estado diferente em contato autorizado, sem fechar/reencaminhar a conversa corrente apenas para fabricar o cenário.
5. Definir rotina de conferência do marcador e exclusão no e-mail. Retirar pendência técnica não autoriza retomar avisos nem cancelar descadastro.

**Campanha desligada; AUT-05 parcial e 74% mantidos.** A revisão comprova destino configurado e retorno positivo, não operação pública completa.

[Checklist mestre](SSL26_Checklist_Mestre.md) · [Matriz de preparação](SSL26_Painel_Preparacao.md) · [Operação ManyChat](SSL26_Operacao_ManyChat.md) · [Teste anterior](SSL26_Teste_Atendimento_Geraldo_2026-09-20.md)
