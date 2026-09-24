# SSL26 — exclusões nos rascunhos de envio

**Atualização posterior, 24/09 às 10h08:** as duas revisões foram publicadas com nova autorização, relidas e mantidas `STOPPED`, sem gatilho. ERP e captura também publicados com os processadores desligados. [Estado atual](SSL26_Guardas_Publicacao_2026-09-24.md). Abaixo, o histórico da preparação em rascunho.

**24/09/2026, conferência concluída aproximadamente às 09h47 de Belém. Preparação: 84%; AUT-06 parcial; campanha desligada.**

**Etapa posterior em 24/09:** o alinhamento às seis tags e a rota privada de processamento foram preparados e testados no ERP local, sem publicação ou ativação. Os rascunhos remotos não foram modificados novamente. [Estado mais recente e próxima sequência](SSL26_Processador_Exclusoes_Local_2026-09-24.md). O relato abaixo preserva esta entrega das 09h47.

## Autorização executada

Geraldo autorizou: **“Sim, ajustar e salvar apenas os rascunhos”**, após a proposta de acrescentar três proteções aos cinco pontos dos fluxos SSL26 de Instagram e WhatsApp, sem publicação, gatilhos, testes com contatos ou mensagens.

Foram acrescentadas **15 condições ao todo**: ausência das tags `SSL26_QA`, `SSL26_ATENDIMENTO_PAUSA` e `SSL26_PAUSA_REVISAO` em cada um dos cinco pontos abaixo. Não houve aplicação de etiquetas a contatos. Não foram editados textos, links, consentimentos, mensagens, ações de saída ou conexões entre etapas.

## Pontos salvos e relidos após recarregar

| Fluxo | Ponto | Condições finais |
|---|---|---|
| [Instagram — SSL26_01_IG_GUIA](https://app.manychat.com/fb156918594386969/cms/files/content20260918141216_689711/edit) | `SSL26 \| Entrada permitida` | Seis exclusões por ausência de tag, ligadas por **todas as condições** |
| Instagram — mesmo fluxo | `SSL26 \| Revalidar antes do guia` | Mesmas seis exclusões, ligadas por **todas as condições** |
| [WhatsApp — SSL26_02_WA_BOAS_VINDAS](https://app.manychat.com/fb156918594386969/cms/files/content20260918144151_090401/edit) | `SSL26 \| Elegível para boas-vindas` | Oito condições anteriores preservadas + três novas; **11 condições conjuntas** |
| WhatsApp — mesmo fluxo | `SSL26 \| Revalidar guia WA` | Mesmas 11 condições conjuntas |
| WhatsApp — mesmo fluxo | `SSL26 \| Revalidar canal WA` | Mesmas 11 condições conjuntas |

As seis exclusões comuns são `SSL26_OPT_OUT`, `ATENDIMENTO_HOTEL_ATIVO`, `SSL26_COMPRADOR`, `SSL26_QA`, `SSL26_ATENDIMENTO_PAUSA` e `SSL26_PAUSA_REVISAO`. Basta **uma presente** para não seguir ao envio. Por isso, a audiência de exclusão usa **OU entre presenças**, enquanto a passagem ao envio exige **E entre ausências**.

No WhatsApp, continuam obrigatórios `SSL26_LEAD`, `SSL26_CAPTADO`, data de consentimento preenchida, origem exata `landing_ssl26:ssl26_landing_2026_09_v1` e opt-in WhatsApp verdadeiro. O convite inicial do Instagram não ganhou exigência de lead pré-cadastrado. Todos os ramos negativos conferidos continuam sem próximo passo de envio.

### Prova de que não houve publicação

- Instagram: **DRAFT / Salvo**, com botão **Publicar** ainda disponível e não acionado.
- WhatsApp: **STOPPED / Salvo**, com botão **Atualização** ainda disponível e não acionado. A versão publicada anterior não foi substituída.
- As duas páginas foram recarregadas; os cinco pontos foram relidos com as condições persistidas. Não foi usada prévia ou execução com destinatário.
- Nenhuma alteração em outros fluxos, no Brevo, no ERP, em gatilhos ou em flags de campanha nesta rodada.

## Correção local adicional na captura

A inspeção de [capture-lead.ts](../api/capture-lead.ts) encontrou uma lacuna na última conferência do Brevo: ela relia os bloqueios, mas ignorava uma divergência de telefone surgida **depois de salvar o contato e antes do e-mail**.

Um novo teste reproduziu a falha: mesmo com essa mudança simulada, a API tentava entregar a mensagem. O código local agora retém o e-mail e o evento Meta quando a releitura detecta telefone divergente com a proteção central habilitada. O cadastro já confirmado permanece registrado; não há tentativa de sobrescrever o telefone modificado nem repetição automática. O comportamento legado com a proteção central desligada foi preservado.

**Correção somente local, sem commit ou implantação.** O domínio principal serve uma cópia da API: eventual publicação precisa atualizar essa cópia coordenadamente, não somente o repositório de origem.

Verificação: **99 testes aprovados, zero falhas e zero ignorados** — 46 de captura, 10 de elegibilidade central (um novo nesta rodada), 14 dos filtros e 29 da política de audiência. Todas as chamadas externas foram simuladas; nenhum contato real foi consultado pelos testes, criado, atualizado ou recebeu mensagem. TypeScript do arquivo alterado e conferência de espaços do diff aprovados.

```sh
node --experimental-strip-types --test tests/capture-lead.test.mjs tests/ssl26-central-email.test.mjs tests/ssl26-exclusion-filters.test.mjs tests/ssl26-audience-policy.test.mjs
```

## Próxima entrega e limites

1. Alinhar a conferência do servidor às seis tags do ManyChat e preparar a operação controlada de conciliação dos marcadores. Na leitura local, `welcome.ts` do ERP contempla cinco tags, mas não `SSL26_PAUSA_REVISAO`; o adaptador de exclusões existe sem rota/agendador que o coloque em operação. **ERP não foi editado nesta rodada.**
2. Concluir evidências de identidade, QA, pausa e comprador e ensaio sem envio. Tags ausentes não provam ausência de bloqueio central; filtros não preenchem marcadores retroativamente.
3. Publicar revisões e correção da captura apenas com escopo aprovado, mantendo gatilhos/campanha desligados. O aceite desta rodada não autoriza publicação ou testes com contatos.
4. Homologar cenários reais restritos com autorização própria; ainda faltam timeout e conversa inicialmente fechada/com outro responsável (AUT-05), além da cobertura global de fluxos/campanhas (AUT-06 a AUT-10).

Os segmentos salvos não foram associados a campanhas Brevo nesta etapa. Comunicação de saída e atendimento humano não devem ser impedidos por filtros de aquisição. Mensagens operacionais de compra continuam fora deste ajuste.

[Filtros salvos por canal](SSL26_Filtros_Exclusao_2026-09-24.md) · [Checklist mestre](SSL26_Checklist_Mestre.md).
