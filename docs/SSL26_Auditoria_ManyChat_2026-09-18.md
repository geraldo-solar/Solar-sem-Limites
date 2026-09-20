# SSL26 — auditoria de entradas e preparação do teste de saída

18/09/2026. Conta Hotel Solar `156918594386969`. Inspeção do painel somente de leitura: nenhuma regra, mensagem, contato, publicação ou conexão foi alterada nesta rodada. **Auditoria parcial; não libera campanha.**

**Atualização posterior, autorizada:** Geraldo respondeu “autorizo”; teste isolado de saída concluído às 14h16 de Belém. Seu contato foi descadastrado somente do SSL26 nos três serviços, com dados operacionais preservados. Gates de produção continuam false. Inventários das cinco pastas e a única automação Brevo foram conferidos para o escopo das alterações desse teste. [Resultado e limites](SSL26_Teste_Saida_2026-09-18.md). A referência a “sem alteração” acima descreve a primeira rodada, não o teste autorizado posterior.

## Cobertura efetivamente conferida

- Lista principal de automações, incluindo a segunda página carregada.
- Dez regras globais de palavras-chave: nove ligadas, uma desligada.
- Seis regras globais: abertas individualmente, gatilhos e ações relidos.
- Lista de sete sequências; conteúdo e agenda interna não auditados.
- Automações básicas de Instagram e WhatsApp; entrada e duas etapas da resposta padrão WhatsApp abertas em modo de leitura.

## Regras globais preservadas

| Regra / ID | Gatilho | Ação observada |
|---|---|---|
| ChatGTP Assistente Geral / 1801854 | Aplicar `ChatGPT Assistente Geral` | Definir identificador do assistente |
| Aplicar Tag Reservado / 1710189 | Aplicar `Reservado` | Status Reservado; iniciar Conclusão Reserva |
| Ao Remover Hospedado Limpa / 1586522 | Remover `Hospedado` | Limpar Status |
| Ao Aplicar Hospedado / 1586519 | Aplicar `Hospedado` | Status Hospedado; iniciar Check-in |
| Regra de Checkout - Obrigado+Satisfação / 1556845 | Remover `Hospedado` | Iniciar Obrigado + Pesquisa de Satisfação |
| Tag applied / 1447904 | Aplicar `Carnaval 2023 QRCode` | Iniciar Check-in |

Todas ativas e configuradas para poder repetir. Nenhuma dessas seis referencia tags/campos SSL26. Isso não certifica chamadas externas, regras dentro de outros fluxos ou automações Brevo.

## Entradas que precisam ser consideradas no lançamento

| Entrada existente | Estado e consequência observada | Encaminhamento SSL26 |
|---|---|---|
| WhatsApp: mensagem exata “quero conhecer o programa Solar Sem Limites” | Ativa; abre `Solar Sem Limites 2026 In-House julho` | Não reutilizar esse texto nos anúncios de novembro sem decidir o destino. Preservado |
| WhatsApp: mensagem exata “Quero ver o convite” | Ativa; abre `Sem Título` | Conferir conteúdo antes de usar CTA semelhante |
| WhatsApp: mensagem exata “ESTOU NO SOLAR” | Ativa; check-in | Preservar atendimento de hóspedes |
| WhatsApp: “Como chegar”, “Qual a localização”, “Onde fica” | Ativa; roteamento de localização | Preservar serviço de localização |
| WhatsApp: duas palavras-chave de cardápio | Ativas | Preservar restaurante/hotel |
| Instagram: saudações, preço e valor | Ativa; `Instagram Fluxo Geral` | Usar entrada exclusiva de campanha e revisar sobreposição |
| Instagram: PET | Ativa | Preservar atendimento existente |
| Instagram: “quero”, “eu”, 🙋 | Desligada | Não ativada nesta rodada |
| Messenger: saudações/preço/diária | Ativa; FAQs | Fora dos fluxos SSL26 novos; preservar |
| Instagram: qualquer resposta a story | Ativa na automação geral | Falta conferir ramificações e interação com campanha |
| WhatsApp: `stop` / `unsubscribe` do sistema | Ativa na lista principal | Não confundir com saída exclusiva SSL26 nem alterar opt-out global |

Não foi encontrada palavra-chave SSL26 `GUIA`, `SALINAS`, `SAIR` ou `PARAR` na tela global auditada. Os dois rascunhos novos continuam sem gatilhos.

## Respostas padrão e atenção ao contato de teste

- Instagram `hotelsolar`: iniciadores de conversa e menção em story ativos; resposta padrão suspensa. Saudação a novo seguidor indisponível. Menção em story não teve conteúdo interno auditado.
- WhatsApp `Hotel Solar Salinópolis Chat`: resposta padrão ativa, ligada a `Whatsapp Fluxo Geral` (`content20230131133655_954716`).
- A entrada desse fluxo tem um ramo específico para o WhatsApp de Geraldo, final 1312. Na visualização, o destino aparece como “Selecione a automação para iniciar”. Isso exige conferência; a leitura da tela não prova o comportamento em execução.
- `Condition #1` considera `Em negociação` ou `Hospedado`, além de `Espera de 3 dias` e outro ramo para o contato de teste. O ramo de negociação/hospedagem passa por uma ação que notifica dois responsáveis por e-mail. Nada foi acionado.
- Portanto, o próprio número de Geraldo não representa sozinho o caminho normal de um novo lead. Um teste de botão/callback é diferente de testar a resposta padrão. Antes de enviar qualquer mensagem de teste, conferir os efeitos de notificação e os destinatários.

## Sequências existentes

Listagem observada: Example Sequence (0 contatos/4 mensagens), Guia Final do Ano (0/1), Sequência Páscoa (13/6), Teste (0/3), Rotina Diária Hóspedes 1 (131/7), Rotina Diária Hóspedes 2 (0/7), Envio abertura carrinho Amo o Solar 2024 instagram (12/1).

Nenhuma com nome SSL26. Esses números são os exibidos na listagem; não comprovam mensagens agendadas ou entrega atual. Não houve inscrição, retirada ou alteração de sequência.

## Correção técnica decorrente da auditoria

O contato autorizado é legado e não aparece na busca padrão pelo telefone, apesar de poder ser localizado pelo campo validado e confirmado pelo WhatsApp real. O ERP ainda não tem vínculo ManyChat salvo para esse lead, porque a sincronização está desligada. Assim, a fila de saída poderia ficar bloqueada por falta de vínculo.

Correção: localizar candidatos pelos dois campos legados já auditados, consolidar IDs repetidos e confirmar conta/WhatsApp real novamente. Campo personalizado sozinho nunca autoriza alteração. Identidades conflitantes, metadados inválidos e falhas de consulta impedem alteração. Sem reativar opt-in, reescrever campos, criar contatos ou enviar mensagens.

Regressão reproduzida antes da correção. Depois: **88 testes ERP passaram**, incluindo cinco novos casos e duas suítes PostgreSQL sem testes ignorados. TypeScript e `git diff --check` passaram. Publicação seletiva concluída no commit `7fd263b`, produção **READY**, build de 70 s, deployment `dpl_BTF3LJ8nfX55EQkq9fAuyxEACv5C`. Domínio `https://erp-hotel-solar.vercel.app` confirmado nesse deployment. Nenhuma mudança do site nesta rodada.

Provas HTTP após a publicação, sempre com corpo vazio: callback, processador de saída e sincronizador retornaram 401 sem chave e 503 com chave correta (`integration_disabled` / `activation_gate`), todos `no-store, private`. Nenhum ID/telefone de cliente enviado nesses testes. Logs nível error do deployment novo, janela 1 h e filtro `/api/ssl26`: zero registros na consulta. Amostra pontual, não monitoramento recorrente nem prova de descadastro real. Drains não verificados. Rollback disponível no deployment anterior `dpl_8txiwhAB3fQ54eAuSdFJpXWNGUb5` / `a7f3ace`.

## O que falta antes da homologação real

1. Concluir a revisão das cinco pastas (`automação RESERVA ONLINE`, `ChatGPT`, `Fotos e Videos`, `PACOTES`, `Rotinas`), ramificações de respostas padrão/stories, detalhes das sequências e entradas externas. Conferir audiências/automações Brevo.
2. Manter `SSL26_AUTOMATIONS_REVIEWED=false`; não ligar o indicador apenas para conseguir rodar um teste. Sincronização, callback e processador de saída seguem desligados.
3. **Concluído posteriormente:** autorização específica recebida de Geraldo e saída isolada real confirmada em ManyChat/ERP/Brevo; sem reinscrição automática. Não repetir a aplicação nem retirar o opt-out para facilitar outros testes. Execução do botão e callback HTTPS habilitado continuam pendentes.
4. Com pré-requisitos conferidos, testar apenas o contato escolhido: saída → registro durável → dois provedores confirmados → repetição sem novos efeitos → recadastro bloqueado. A aprovação do contato não autoriza disparos para a base nem mudança nas automações operacionais.
5. Depois, concluir saída por texto, pausa de atendimento, compra durante espera, origem Brevo, registro único de boa-vinda conectado ao disparador e teste de contato novo. Só então avaliar ativação.

Preparação gerencial mantida em **67%**. Auditoria e testes locais não equivalem a uma automação funcionando de ponta a ponta.
