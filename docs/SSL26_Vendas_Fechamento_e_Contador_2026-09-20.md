# SSL26 — fechamento do carrinho por data e contador real de pacotes

**Revisão de 20/09/2026 · horários de Belém.** Entregas da frente de vendas: prazo que vale no servidor e número de vendas que não é digitado à mão. Referência no [checklist mestre](SSL26_Checklist_Mestre.md), itens VEN-02 a VEN-05 e FIM-01.

## Decisão que mudou o escopo

O lote de **200 unidades deixa de ser limite** e passa a ser referência de comunicação: se ultrapassar 200, melhor. Decisão de Geraldo em 20/09.

Isso remove do escopo a trava de estoque que VEN-05, CAR-03/CAR-06 e FIM-01 descreviam, e mantém em pé a outra metade, que continua necessária: **o carrinho precisa fechar de verdade em 01/12**, inclusive para quem tem link antigo.

Junto com a decisão ficou registrado o critério para a urgência: usar prazo verdadeiro e contagem verdadeira, em vez de contador fixo no código. O `VAGAS_RESTANTES = 5` da landing de julho é um número digitado à mão e **não** deve ser reaproveitado na página de novembro.

## O que foi publicado

| Onde | Commit | Deploy |
|---|---|---|
| ERP (janela de venda, gate na ingestão, rota `/status`) | `7e1c879` | `erp-hotel-solar-2adu4jwlt`, READY em 59 s |
| Site de venda (proxy de status, checkout) | `b10ee43` | `solar-sem-limites-ax2t9av99`, READY em 19 s |

**Datas no código, com override por variável de ambiente:** abre 25/11 às 8h, fecha **01/12 às 23h59** (UTC-3).

A checagem mora na rota de ingestão do ERP, não na tela. É o que faz o prazo valer para link antigo, aba aberta há horas, página em cache ou POST direto na API.

## Provas

**Fechamento recusa o pedido — handler real, prazo simulado no passado:**

```
HTTP: 409
{"success":false,"carrinhoFechado":true,"motivo":"APOS_O_FECHAMENTO",
 "error":"As vendas deste lote foram encerradas em 01/12..."}
```

A recusa acontece **antes de qualquer escrita no banco**: nenhum pedido é criado.

**Janela avaliada em sete datas:** hoje (20/09), véspera (24/11), abertura (25/11 8h), durante (28/11), 1 segundo antes de fechar e 1 segundo depois, e o dia seguinte. Aberto até 01/12 23h59:58; fechado a partir de 01/12 24h. Comportamento correto nos sete casos.

**Venda de hoje não quebrou:** pedido real enviado à produção dentro da janela foi aceito (`success: true`) e removido em seguida.

**Rota de status:** `401` sem o segredo; com o segredo devolve `aberto`, `abreEm`, `fechaEm`, `pacotesVendidos` e `pacotesNoLancamento`. Só agregado — nenhum nome, CPF, e-mail ou valor individual sai por ali.

**Proxy do site:** o navegador nunca vê o segredo; cache de borda confirmado (`x-vercel-cache: HIT`, `age: 15`), para aguentar a largada.

**Checkout em produção:** mostra "64 pacotes já garantidos por outras famílias", número vindo das compras aprovadas. Sem erros no console.

## Auditoria da base de vendas (mesma revisão)

Levantamento direto na produção, não estimativa:

| Medida | Valor |
|---|---:|
| Compras aprovadas | 51 |
| Pacotes somados | 64 |
| Diárias vendidas | 384 |
| Lançamentos automáticos no ledger | 33 (30 reserva + 3 ajuste) |
| Diárias já consumidas | 79 |
| Compras com saldo negativo | **0** |

Base vai de 28/11/2025 a 01/09/2026. Sustenta VEN-04 com dado real: uma aprovação gera um saldo, e reserva/ajuste descontam e devolvem sem estourar para negativo.

**Pendência encontrada e resolvida no mesmo dia:** 8 das 51 compras aprovadas estavam **sem vínculo de cadastro** (`guest_id` nulo) — compras reais, não testes, marcadas como aprovadas direto no banco na importação do histórico, sem passar pelo botão de aprovar (que é quem preenche o vínculo). A baixa automática funcionava pelo CPF, mas o crédito não aparecia na conta corrente do hóspede.

Resolvido: 2 compras reaproveitaram cadastro já existente por CPF (mesmo comprador, nome grafado de dois jeitos) e 6 ganharam cadastro novo criado com nome, CPF, e-mail e telefone da própria compra. Todos receberam a etiqueta `[SOLAR_SEM_LIMITES]` e conta corrente aberta, como a aprovação faz. Conferido depois: **51 de 51 aprovadas vinculadas, nenhum CPF com cadastro duplicado**. Nenhuma compra foi apagada, e nenhum valor ou validade foi alterado.

**Correção de e-mail, autorizada em seguida:** o e-mail de uma compradora estava gravado terminando em `.con`, erro de digitação no checkout. Levantado primeiro e corrigido **somente após autorização de Geraldo** — trocar endereço de cliente por conta própria pode mandar mensagem para a pessoa errada. Ajustado nos dois lugares em que aparecia (a compra e o cadastro criado a partir dela), com valor anterior, data e autorização registrados na observação da própria compra. Foi um caso pontual já identificado, não uma varredura de qualidade da base.

**Passivo a vencer:** 23 pacotes (138 diárias) vencem entre 28/11 e 22/12/2026, 22 deles concentrados de 17 a 22/12 — logo depois do fechamento do carrinho. São compras de dezembro/2025 que não foram usadas.

## O que isto não significa

- **Não existe trava de 200** — por decisão, não por pendência. Vender acima de 200 é permitido.
- **O bloqueio antes da abertura está desligado** por padrão (`PCDA_BLOQUEAR_ANTES_DA_ABERTURA`). O checkout vende hoje fora de campanha; ligar agora derrubaria venda real.
- **A página de vendas de novembro (VEN-01) não existe.** O `#/checkout` ainda usa o formulário da campanha de julho.
- **Conciliação e estorno (VEN-03) e indicação (VEN-07) seguem pendentes.**
- **O contador soma aprovados de todas as campanhas**, não só do lançamento. O recorte da campanha existe na mesma rota (`pacotesNoLancamento`) e hoje é zero.
- **O banner do formulário ainda diz "últimas vagas remanescentes"** — texto antigo, da campanha de julho, que agora convive com um contador verdadeiro. Precisa ser trocado antes de novembro.
- Executar o fechamento em 01/12 continua sendo uma ação futura: o mecanismo está pronto e testado, o evento ainda não aconteceu.
