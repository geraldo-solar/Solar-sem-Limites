# SSL26 — teste real de saída de um contato autorizado

18/09/2026, saída registrada às **14h16min29s de Belém** (17:16:29 UTC). Geraldo respondeu **“autorizo”** à confirmação explícita de descadastro do WhatsApp final 1312 e do e-mail dele. Escopo: somente avisos Solar Sem Limites, sem reinscrição automática, alteração de reservas ou disparos para a base.

## Resultado

**Continuação posterior:** o callback foi habilitado e validado por HTTPS e pelo próprio ManyChat, preservando este descadastro. Prévia do botão preparada para Geraldo, ainda sem entrega/clique confirmado. [Estado atual e publicação](SSL26_Callback_HTTPS_2026-09-18.md). Os resultados a seguir descrevem o teste isolado das 14h16, quando os gates estavam desligados.

**Saída confirmada nos três sistemas.** Dois trabalhos de propagação concluídos, uma tentativa por provedor. Nenhuma mensagem enviada pelo teste e nenhum fluxo público ativado.

| Sistema | Antes | Depois | Preservado |
|---|---|---|---|
| ManyChat | Sem tag `SSL26_OPT_OUT` | Tag presente e relida; trabalho `synced` | Outras duas tags, todos os campos personalizados e opt-in global WhatsApp |
| ERP | Sem controle de saída; dois eventos de cadastro/perfil pendentes | Saída durável; dois eventos bloqueados por `opted_out`; trabalhos ManyChat e Brevo `synced` | Cadastro/perfil original, sem vínculo ManyChat fabricado, sem mutação de hóspedes/reservas |
| Brevo | Membro de `SSL26_LEADS` (24) e lista 21 | `SSL26_OPT_OUT=true`; removido somente da lista 24 | Lista 21, demais atributos e permissões globais de e-mail/SMS |

Contagem de alterações nos provedores: **uma adição de tag ManyChat e uma atualização Brevo**. O pedido foi registrado uma segunda vez para testar repetição: retornou duplicado, sem reabrir os trabalhos ou repetir alterações nos provedores. Os dois trabalhos permaneceram `synced`, `attempts=1`, `reason=suppression_verified`.

## Como o teste foi limitado

- Identidade conferida por WhatsApp real e conta ManyChat, e-mail/SMS no Brevo e cadastro correspondente no ERP. Nome sozinho não foi usado como prova.
- Código local comparado byte a byte com a versão publicada `7fd263b` para receptor, processador, repositório e contrato.
- Execução isolada das funções desse código, com **serviços e banco reais**. Lista fechada de operações e de um único destinatário; sem endpoints de envio, criação de contatos, mudança de opt-in, remoção de outras tags ou alteração de outras listas.
- A tag foi aplicada explicitamente ao contato autorizado. O receptor foi executado localmente com autenticação, releitura do contato e persistência real. O processador executou o mesmo código publicado e releu os resultados em cada provedor.
- Os indicadores `enabled`/`accountAutomationsReviewed` valeram apenas para essa execução isolada e para as alterações especificamente auditadas. **Não houve alteração dos indicadores de produção, nem declaração de auditoria completa da campanha.**
- As três rotas de produção foram conferidas antes e depois com credencial correta e corpo vazio: 503 `integration_disabled` / `activation_gate`. Permaneceram bloqueadas. Não houve deploy nesta rodada.
- Após a saída, tentativas de processar os dois eventos antigos ficaram bloqueadas sem chamar provedor. O registro de entrega de boas-vindas permaneceu vazio.
- Comparações antes/depois confirmaram os dados preservados na tabela acima. Credenciais e respostas brutas dos contatos não foram gravadas neste relatório.

## Revisão de gatilhos adicional

- As seis regras ManyChat da auditoria anterior continuam sendo as únicas listadas; nenhuma usa a tag SSL26 de saída.
- Aberto o inventário das cinco pastas restantes: Reserva Online (quatro fluxos parados), ChatGPT (vazia), Fotos e Videos (cinco fluxos chamados por outros fluxos), PACOTES (seis fluxos com chamadas internas/intenção de mensagem) e Rotinas (dois fluxos chamados por outros fluxos). Entradas “Mostrar Todos” relevantes expandidas. Não apareceu entrada por aplicação de `SSL26_OPT_OUT`.
- No Brevo, a conta Hotel Solar tem **uma automação**, ativa: `Boas vindas Círculo Solar`. Editor conferido sem mudanças: gatilho **contato adicionado à lista “Lista contatos site” #10**, seguido de um e-mail e saída. O teste não inscreveu ninguém na lista 10, não alterou essa automação e não acionou seu botão de teste.
- Os gatilhos antigos para julho e ofertas sazonais permanecem intactos. A revisão desta rodada certifica o escopo das alterações do teste, não todas as conversas, sequências, campanhas e integrações possíveis do hotel.

## Provas e limites

- **88 testes ERP passaram novamente**, incluindo duas suítes PostgreSQL, sem testes ignorados.
- Pré-conferência de leitura passou antes da execução com alterações.
- Saída registrada: `2026-09-18T17:16:29.665593+00:00`.
- ManyChat e Brevo: `synced`, uma tentativa cada; releitura confirmou o resultado.
- Repetição do pedido: tratada como duplicada; novas tentativas de processar os trabalhos concluídos não obtiveram claim.
- Script de execução pontual: `/private/tmp/ssl26-authorized-optout-20260918.mjs`, permissão 600, fora dos repositórios, leitura das credenciais privadas existentes. Seu modo de aplicação exige estado inicial sem descadastro; não serve para reativação nem para repetir automaticamente uma escrita incerta.

**Este teste não executou o botão “Parar avisos” no WhatsApp, não recebeu um callback HTTP habilitado em produção e não enviou um novo cadastro pela landing.** Não é homologação integral da jornada visual. Nenhum consentimento novo foi inventado e nenhum opt-out foi removido para facilitar testes.

## Próximo passo

1. Manter Geraldo descadastrado dos avisos SSL26. Reinscrição não é automática e não faz parte desta autorização.
2. Concluir auditoria da jornada de aquisição/envio e exclusões das audiências Brevo; preservar fluxos operacionais.
3. Homologar botão/saída por texto, callback HTTPS, pausa de atendimento e compra durante espera, com destinatário autorizado e sem remover o descadastro atual. Para percorrer novamente uma entrada de aquisição será necessário outro contato autorizado ou uma decisão explícita de reinscrição.
4. Conectar o registro único de boa-vinda ao disparador; conferir janela de WhatsApp/modelo, falhas e conciliação. Só depois avaliar ativação pública.

Preparação geral mantida em **67%** nesta rodada: houve avanço comprovado na saída entre serviços, mas ainda não na jornada completa de envio. Não liberar anúncios ou disparos com base apenas neste teste.
