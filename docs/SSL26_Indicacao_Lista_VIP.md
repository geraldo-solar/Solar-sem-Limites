# Indicação a partir da Lista VIP

Proposta de 10/10/2026 para a nova versão do programa de indicação do Solar Sem Limites 2027. **Aguarda a aprovação de Geraldo antes de qualquer mudança no regulamento, na página, no ERP ou no ManyChat.**

## Decisões de Geraldo

Decididas entre 06 e 10/10/2026:

1. **Quem baixa o guia não recebe link.** O guia é o primeiro contato, antes do lançamento.
2. **O link pessoal nasce na entrada da Lista VIP**, que é a etapa do funil de venda.
3. **Entrada na Lista VIP pelos dois caminhos:** o "sim" no WhatsApp do hotel (ManyChat) ou o cadastro numa página da Lista VIP. Os dois caem no mesmo cadastro.
4. **Destino do link:** até 25/11/2026 às 8h, o amigo que abre o link cai na entrada da Lista VIP e vive a mesma jornada, ganhando o próprio link. A partir desse horário, o mesmo link leva direto à página de vendas, ainda marcando quem indicou.
5. **Prêmio:** só sai quando o amigo compra e não cancela em 30 dias, e quem indicou também compra.
6. **Comprador que nunca passou pela Lista VIP** também recebe o link quando o pagamento é aprovado, como hoje.
7. **Vale a primeira indicação registrada.** Ela fica gravada no cadastro do amigo e é reconhecida na compra pelo WhatsApp, e-mail ou CPF, mesmo que ele compre por outro link ou outro celular.

Continuam como estão: 1 diária de baixa temporada por indicado, limite de 5 por CPF, liberação depois de 30 dias e validade do pacote mais recente de quem indicou.

## Jornada

1. A pessoa entra na Lista VIP, respondendo "sim" no WhatsApp ou pela página, e recebe na mesma conversa o link pessoal, por exemplo `hotelsolar.tur.br/vip?ref=K7M2QX9A`. Também recebe o link por e-mail.
2. Ela compartilha com quem quiser. O hotel não pede nem recebe dados dos amigos de ninguém: cada amigo se cadastra por conta própria.
3. **Antes de 25/11 às 8h:** o amigo cai na entrada da Lista VIP, se cadastra, a indicação fica gravada no cadastro dele, e ele ganha o próprio link.
4. **A partir de 25/11 às 8h:** o link leva à página de vendas, e a indicação segue até o checkout.
5. Na compra, o ERP procura a indicação nesta ordem: a indicação já gravada no cadastro (pelo WhatsApp, e-mail ou CPF); se não houver, o link aberto naquela visita.
6. A diária só é creditada quando as duas compras estão aprovadas e passaram 30 dias da mais recente sem cancelamento.

## Proposta do novo item 10 do regulamento

> **10. Programa de Indicação**
>
> **10.1.** Recebe um link individual de indicação quem entrar na Lista VIP Solar Sem Limites 2027, pelo WhatsApp oficial do Hotel Solar ou pela página da Lista VIP, e o COMPRADOR com pagamento aprovado que ainda não tenha link.
>
> **10.2.** É indicado quem entrar na Lista VIP ou comprar o pacote a partir desse link. A indicação fica registrada no cadastro do indicado e é reconhecida na compra pelo WhatsApp, e-mail ou CPF informados. Vale a primeira indicação registrada; links abertos depois não a substituem.
>
> **10.3.** Por indicado que comprar o pacote até 01/12/2026 às 23h59, com pagamento aprovado, quem indicou recebe 1 diária adicional, válida em datas de baixa temporada (fora de férias e feriados), desde que também tenha comprado o pacote neste lançamento, com pagamento aprovado, até o mesmo prazo.
>
> **10.4.** A diária é liberada 30 dias após a mais recente das duas compras, a do indicado e a de quem indicou, e segue a validade do pacote mais recente de quem indicou. Se uma das duas compras for cancelada nesse prazo, a diária não é concedida.
>
> **10.5.** Limite de 5 diárias de indicação por CPF. Não conta como indicação a compra feita pela própria pessoa, com o próprio link ou com o mesmo CPF. A diária de indicação não é sorteio, não pode ser trocada por dinheiro e não pode ser transferida.

**Quem já comprou na versão de 23/09 não perde nada.** Nessa versão, só comprador tinha link, então a exigência de quem indicou também ter comprado já estava cumprida. Para essas pessoas, a liberação continua sendo 30 dias após a compra do indicado, porque a compra delas é sempre anterior. A nova versão acrescenta quem está na Lista VIP e passa a guardar a indicação de uma visita para outra.

Ao aprovar, a versão do regulamento muda, por exemplo para `2026-10-xx`, em quatro lugares: `versaoDoRegulamento.ts`, `Regulamento_SSL.html`, a política do checkout e o PDF.

## Texto proposto para a página de vendas

Bloco "Programa de indicação":

> Venha com quem você gosta. Quem compra o pacote recebe um link individual e ganha 1 diária adicional de baixa temporada a cada pessoa que comprar por ele até 01/12, limitado a 5 diárias por CPF. A diária é liberada 30 dias após a compra, com a validade do seu pacote mais recente. Condições no regulamento.

A página de vendas fala com quem já pode comprar. A explicação completa, com a Lista VIP, fica na página da Lista VIP, nas mensagens do WhatsApp e no primeiro vídeo da lista.

## Plano técnico

| Parte | O que muda | Quem faz |
| --- | --- | --- |
| ERP, banco | Link de indicação também para quem está na Lista VIP, ligado ao WhatsApp e ao e-mail; quando a pessoa compra, o link passa a ficar ligado ao CPF. Nova tabela de indicações registradas, com uma única indicação por pessoa: vale a primeira. | Claude escreve a migração; **Geraldo roda no SQL Editor** |
| ERP, regras | O crédito exige as duas compras aprovadas até 01/12 às 23h59 e libera 30 dias após a mais recente; cancelamento de qualquer uma das duas anula a diária. Na compra, procura primeiro a indicação gravada no cadastro. | Claude, com testes |
| ERP, API | Rota que cria ou devolve o link de um contato da Lista VIP, chamada pelo ManyChat e pela página, protegida por chave do servidor. | Claude |
| Página da Lista VIP | Página nova com nome, WhatsApp, e-mail e consentimento. Guarda quem indicou, mostra o link pessoal no fim e oferece "Receber no WhatsApp", que abre a conversa com o hotel. Como é a pessoa que puxa a conversa, a mensagem não paga modelo. | Claude |
| Endereço `/vip` | Antes de 25/11 às 8h, abre a página da Lista VIP; depois, redireciona para `/solarsemlimites2027` mantendo o `?ref=`. A hora vem do servidor, não do relógio do celular. | Claude |
| ManyChat | No fluxo da Lista VIP, o "sim" aplica a etiqueta da Lista VIP, pede o link ao ERP e responde na mesma conversa, dentro da janela de 24 horas. Quem chega pelo link de um amigo manda uma mensagem pronta com o código. | Claude monta; **Geraldo aprova os textos** |
| Brevo | E-mail de boas-vindas da Lista VIP com o link pessoal. | Claude monta; **Geraldo aprova** |
| Regulamento e página de vendas | Novo item 10, nova versão, PDF e bloco de indicação da página, como acima. | Claude, depois da aprovação do texto |

## Cuidados

- **Não é sorteio:** cada compra indicada gera a diária, sem nenhum elemento de sorte, como um benefício comercial. Por isso não se trata de promoção com sorteio, vale-brinde ou concurso, que exige autorização da SPA do Ministério da Fazenda. Se quiser segurança extra, vale uma leitura do jurídico. O texto não pode falar em sorteio nem em "concorrer".
- **Dados de terceiros:** o programa nunca pede o nome ou o telefone de amigos. Cada pessoa entra com os próprios dados e o próprio consentimento.
- **O link não mostra quem é o dono:** o código é aleatório, sem CPF nem nome, como hoje.
- **Atendimento:** a Kaline precisa saber responder "minha indicação não apareceu". O ERP já mostra quem indicou cada compra, e passará a mostrar também a indicação gravada no cadastro.
