# SSL26 — filtros de exclusão salvos por canal

**Conferência concluída em 24/09/2026, aproximadamente 09h38 de Belém. Preparação mantida em 84%; AUT-06 parcial.**

## Autorização e limite

Geraldo autorizou: **“Sim, salvar apenas os dois filtros”**, um no Brevo e outro no ManyChat, sem alterar contatos, enviar mensagens ou ativar campanhas. Após a interrupção, pediu nova tentativa. A retomada concluiu o filtro do ManyChat; o segmento Brevo já havia sido salvo na etapa anterior.

Foram salvas somente as definições dos filtros. Nenhuma etiqueta foi aplicada a contatos, nenhum consentimento foi alterado e nenhum fluxo, envio ou campanha foi ativado. Não houve exportação nem ação em lote. Segmento salvo **não equivale a exclusão aplicada automaticamente aos envios**.

## Configuração conferida

Nome nos dois serviços: **`SSL26 | Exclusões - não enviar`**.

| Serviço | Regra salva | Evidência na interface |
|---|---|---|
| [Brevo — segmento #16](https://app.brevo.com/contact/segment/id/16) | Quatro grupos ligados por **OU**: `SSL26_QA = true`, `SSL26_OPT_OUT = true`, `SSL26_ATENDIMENTO_PAUSA = true`, `SSL26_COMPRADOR = true`. Sem exigir pertencimento a uma lista | Salvo em 23/09 na pasta `SSL26 - Preparação e exclusões`; confirmação de sucesso e quatro critérios persistidos. Segmentos #14/#15 preservados |
| [ManyChat — contatos](https://app.manychat.com/fb156918594386969/subscribers) | **Qualquer uma** de seis tags presentes: `SSL26_QA`, `SSL26_OPT_OUT`, `SSL26_ATENDIMENTO_PAUSA`, `SSL26_COMPRADOR`, `ATENDIMENTO_HOTEL_ATIVO`, `SSL26_PAUSA_REVISAO`. Sem exigir `SSL26_LEAD` | Salvo em 24/09; nome exibido na barra de segmentos, reaberto e seis condições conferidas com modo OU. Nenhum identificador de segmento foi exposto pela interface |

Descrição salva no ManyChat: “Somente exclusão da aquisição SSL26. Qualquer uma das seis tags bloqueia. Não autoriza envio nem altera contatos; exige conferência central de identidade, consentimento e bloqueios.”

As prévias exibiram **dois contatos em cada serviço, nos respectivos momentos de conferência**. No ManyChat, zero contatos selecionados. Essas contagens não comprovam equivalência de identidade entre as bases, completude dos marcadores ou auditoria de toda a audiência.

## Verificação local

- [Especificação e verificador](../scripts/ssl26_exclusion_filters.mjs): somente código local, sem API, credenciais, alteração de contatos ou envio. Retorna sempre `sendAllowed: false`; ausência de bloqueio marcado não concede elegibilidade.
- [14 testes dos filtros](../tests/ssl26-exclusion-filters.test.mjs): combinações OU dos quatro/seis marcadores, dados incompletos/desatualizados, identidade não confirmada, booleanos estritos, entradas preservadas e saída sem dados pessoais.
- Regressão com os [29 testes da política de audiência](../tests/ssl26-audience-policy.test.mjs): **43 aprovados, zero falhas e zero ignorados**, em 24/09. Dados sintéticos; não é homologação de envio real.

Comando utilizado:

```sh
node --test tests/ssl26-exclusion-filters.test.mjs tests/ssl26-audience-policy.test.mjs
```

## O que falta antes de liberar a campanha

1. Integrar as condições completas aos pontos reais de aquisição e revalidá-las depois de esperas e imediatamente antes de cada envio, sem bloquear pedidos de saída ou atendimento humano.
2. Concluir a operação de espelhamento/conciliação dos marcadores entre núcleo, Brevo e ManyChat. Criar campos/filtros não preenche retroativamente QA, pausa ou comprador nos contatos.
3. Manter conferência central de identidade, consentimento e bloqueios. Campo ausente ou informação inconclusiva exige revisão; não significa consentimento ou elegibilidade.
4. Homologar os cenários autorizados de exclusão e as pendências de AUT-05 (timeout real e conversa inicialmente fechada/com outro responsável).

Esta rodada não alterou as flags globais de sincronização, revisão de automações, supressão ou boas-vindas. **Campanha continua desligada; nenhum novo teste com contato real foi autorizado ou executado aqui.**

Histórico relacionado: [metadados dos canais](SSL26_Metadados_Canais_2026-09-23.md), [correção individual de descadastro](SSL26_Conferencia_Descadastro_2026-09-23.md) e [checklist mestre](SSL26_Checklist_Mestre.md).
