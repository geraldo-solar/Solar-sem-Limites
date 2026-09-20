# SSL26 — audiência e auditoria de automações

Conferência em 20/09/2026, por volta de 16h de Belém. **Campanha não ativada. Preparação mantida em 74%.**

**Etapa posterior:** boa-vinda/data e API de pausa publicadas seletivamente, READY (`fe57bbf`); função instalada, gates desligados e 12 verificações de produção aprovadas sem clientes. Conexão da pausa ao ManyChat ainda pendente. **134 testes aprovados.** [Estado mais recente](SSL26_Publicacao_e_Pausa_2026-09-20.md). As pendências de publicação mencionadas no histórico abaixo referem-se ao momento anterior.

## Entrega efetivamente instalada no Brevo

Criada a pasta **SSL26 - Preparação e exclusões** e dois segmentos, salvos e reabertos para conferir os critérios:

| Segmento | Critério salvo | Resultado observado |
|---|---|---|
| [SSL26 \| Cadastros - conferir, não disparar](https://app.brevo.com/contact/segment/id/14) | Membro de `SSL26_LEADS`, lista **24** | 0 contatos |
| [SSL26 \| Saídas - excluir da campanha](https://app.brevo.com/contact/segment/id/15) | `SSL26_OPT_OUT` **Verdadeiro**, independentemente de lista | 2 contatos, correspondentes aos dois testes já descadastrados |

São filtros dinâmicos de conferência. **Salvar um segmento não ativa uma exclusão em campanhas ou automações existentes.** O primeiro não é uma audiência pronta para disparo; o segundo deverá ser explicitamente associado como exclusão quando uma campanha SSL26 for preparada. Não restringir o filtro de saída à lista 24: os descadastrados já foram retirados dessa lista e desapareceriam do filtro.

Nenhum contato foi adicionado, removido, mesclado, reinscrito ou editado nesta rodada. As listas, segmentos e automações anteriores foram preservados. Na listagem do Brevo continua existindo uma única automação ativada, **Boas vindas Círculo Solar 1**; seu conteúdo/gatilho não foi alterado. A conferência de 18/09 havia identificado a lista 10 como entrada, não a lista 24.

## Conferência do teste já concluído

Reexecutada somente a etapa `verify` do procedimento privado do teste de reservas. Nenhum cadastro ou envio foi repetido.

- QA fora da lista comercial Brevo, com saída SSL26 no Brevo e controle central ERP.
- Origem do botão real `Parar avisos` confirmada; registro central anterior à limpeza controlada.
- Uma única boa-vinda com estado `accepted`; a entrega e os três botões foram confirmados pelo usuário em 18/09. Não houve nova confirmação de entrega nesta rodada.
- Dois trabalhos de supressão `synced`, uma tentativa por provedor.
- Outras listas, tags e permissões gerais iguais ao registro de referência do teste.
- Rotas de processamento de sincronização e supressão continuam bloqueadas por `activation_gate`.
- O segmento de saída também mostra o contato pessoal de Geraldo, sem reinscrição.

Não foram lidas chaves em tela, regeneradas credenciais ou alterados opt-ins globais.

## ManyChat — sete agendas internas conferidas

Conta Hotel Solar `156918594386969`. Leitura da agenda de cada sequência; nenhuma etapa foi ligada/desligada, nenhuma pessoa foi inscrita e nenhum envio foi solicitado.

| Sequência / ID | Assinantes exibidos | Etapas e estado na agenda |
|---|---:|---|
| Example Sequence / `739415` | 0 | 4, todas desligadas: imediatamente; após 2 dias; após 1 hora; após 1 dia |
| Guia Final do Ano / `6425548` | 0 | 1 desligada, após 1 dia; conteúdo aparece como **Selecionar Existente** |
| Sequência Páscoa / `6549964` | 13 | 6 habilitadas, títulos de abril/2023; janelas de quinta a domingo, manhã/noite |
| Teste / `6563028` | 0 | 3 habilitadas, cada uma após 1 dia; títulos `Dia 08/06`, `dia 09/06 noite`, `dia 09/06 manhã` |
| Rotina Diária Hóspedes 1 / `6624924` | 132 | 7 desligadas, janelas diárias 15h–16h; última referência a Seq 2 |
| Rotina Diária Hóspedes 2 / `6625193` | 0 | 7 desligadas, janelas diárias 15h–16h; última referência a Seq 1 |
| Envio abertura carrinho Amo o Solar 2024 instagram / `6957287` | 12 | 1 habilitada, imediatamente; ao abrir a mensagem, o painel informa **Esta automação está na lixeira** |

Os números acima são os contadores da interface, não quantidade de mensagens futuras nem prova de entrega atual. Etapa habilitada não comprova que exista entrada ativa ou envio pendente. A inconsistência da sequência de 2024 foi apenas registrada: não restaurar, excluir ou reutilizar esse material no lançamento de novembro sem uma decisão específica.

O conteúdo completo das mensagens de Páscoa/Teste e as origens de inscrição nas sete sequências continuam fora da cobertura desta rodada.

## Instagram geral — leitura dos 17 blocos conectados

Fluxo publicado `Instagram Fluxo Geral`, ID `content20221010225409_682230`. Foi usado o modo de visualização; nenhum rascunho foi editado/publicado, mensagem enviada ou notificação acionada.

O inventário de gatilhos mostrou novamente **qualquer resposta a story** e palavras comuns de saudação/preço/valor ativos. Os 17 blocos (condição inicial e 16 etapas anexadas) foram abertos individualmente:

- Entrada depende apenas de `[default_reply]`, não da identificação SSL26.
- Sem a tag: boas-vindas gerais → aplica `[default_reply]` → menu de reservas/localização/serviços/eventos.
- Com a tag: pergunta se o contato precisa de ajuda, aguarda resposta e encaminha ao bloco de atendimento.
- `Smart Delay`: 3 dias; depois `Actions #2` remove somente `[default_reply]`. Essa tag não é um registro de consentimento nem a pausa SSL26.
- `Falar com atendente`: notifica duas pessoas por e-mail e depois apresenta a confirmação de atendimento. **Esse bloco não aplica `ATENDIMENTO_HOTEL_ATIVO` nem chama o controle de pausa SSL26.**
- `Actions #1`, ligado a grupos/eventos, também notifica duas pessoas. Os dois blocos `Encerra` e `Ações #4` apenas marcam a conversa como fechada.
- Reservas e serviços apresentam opções operacionais; grupos/eventos encaminha ao atendimento específico. Não foram alterados preços, links, destinatários de notificações ou materiais antigos.

Não foi observada referência SSL26 nos blocos conectados lidos. Não foram abertos todos os destinos de botões/URLs, os itens não anexados, a automação separada de menção em story ou todas as automações chamadas em outras pastas. **Esta é uma auditoria parcial da conta, não autorização para marcar `SSL26_AUTOMATIONS_REVIEWED=true`.**

### Consequências para a implantação

1. Uma resposta `GUIA` a um story pode sobrepor-se ao gatilho geral já existente. Antes de instalar a campanha, definir entrada específica e testar precedência/duplicidade; não presumir que um gatilho novo impeça o antigo.
2. A mera existência da tag `ATENDIMENTO_HOTEL_ATIVO` não garante pausa. Conectar o início/encerramento de atendimento à fonte central de controle e aos canais do mesmo lead, sem confundir identidade Instagram com WhatsApp por nome.
3. Fechar a conversa não deve apagar opt-out, consentir novamente ou disparar mensagens comerciais que ficaram retidas.
4. Preservar os fluxos correntes do hotel. Alterações necessárias devem ser isoladas ao contexto SSL26 e testadas antes de publicar; mudanças globais merecem avaliação separada.

## Critérios que ainda faltam para uma audiência liberada

| Verificação | Fonte necessária / situação |
|---|---|
| Cadastro SSL26 e consentimento vigente para o canal | Evidência versionada no ERP; presença na lista 24, sozinha, não basta |
| Não pediu saída | Controle central, marca no provedor e segmento 15; respeitar também descadastro/bloqueio global do canal |
| Não é teste interno | Os dois QA atuais continuam descadastrados; não reativar para preencher a audiência |
| Não está em atendimento ativo | Tag e controle central precisam acompanhar entradas reais do atendimento, incluindo o caminho legado identificado |
| Não é comprador para mensagens de aquisição | Pagamento aprovado no ERP e propagação confiável; não inferir compra de cadastro/clique |
| Não recebeu a mesma boa-vinda | Registro durável de envio; código preparado, publicação seletiva pendente |
| Identidade resolvida sem conflito | WhatsApp real e vínculo comprovado; contato novo ainda precisa de caminho homologado |

Não criar segmento chamado “elegíveis” baseado apenas em ausência de saída: consentimento, atendimento e compra não estão todos comprovados no Brevo.

## Testes e próximo bloco

Em 20/09 foram repetidos **119 testes**, com **119 aprovados, zero falhas e zero ignorados**, incluindo as três suítes PostgreSQL/PGlite isoladas. TypeScript do ERP (`--noEmit --incremental false`) também aprovado. Provedores simulados nesses testes; nenhum novo envio real.

O antigo conflito Git do ERP não aparece mais no estado de trabalho. Ainda há alterações locais de boas-vindas/formato de data; não foram publicadas nesta rodada. O novo HEAD de Pessoal não foi revertido nem misturado a um deploy do lançamento.

Próxima entrega executável: publicar seletivamente a correção de data e o controle de boa-vinda, mantendo todas as travas de ativação desligadas; depois concluir pausa de atendimento, saída por texto e contato novo. Só então homologar processamento automático e audiência final. Meta Pixel/atribuição, peças finais e jornada de compra continuam pendentes. Guia visual segue adiado.

**74% mantidos:** segmentos de auditoria e leitura de configurações não equivalem à homologação dos pontos ainda abertos. Nenhum anúncio, verba, cron, agendamento ou disparo foi ativado.
