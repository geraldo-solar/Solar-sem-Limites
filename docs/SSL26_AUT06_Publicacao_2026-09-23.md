# AUT-06 — publicação coordenada de 23/09/2026

**Concluído: código publicado nos três projetos, migrações instaladas e campanha desligada.** Autorização de Geraldo: commit, publicação coordenada e instalação das três migrações, mantendo a campanha desligada. Não autoriza novo teste com mensagens, compra, aprovação ou alteração de contatos.

## Versões e instalação

| Projeto / endereço | Commit de código | Alvo / estado | Framework | Build |
|---|---|---|---|---|
| [ERP](https://erp-hotel-solar.vercel.app) | `aab094a` | Produção · READY | Next.js | 67,3 s |
| [API/proxy](https://solar-sem-limites.vercel.app) | `f1982d1` | Produção · READY | Vite | 15,8 s |
| [Site principal](https://www.hotelsolar.tur.br/solarsemlimites2026) | `a1873a9` | Produção · READY | Estático + funções | 21,2 s |

Implantações verificadas: ERP `dpl_9aTfoeHdkNSKFgYo2DDvLmq3hc3o`; proxy `dpl_3HFc7sccnYzdw8Q5wzEegRr6Yshs`; site `dpl_37RV3N5eUzJ7ZJ2T4VUdqFS2kphf`. Os três commits de código foram enviados aos respectivos repositórios, sem force push.

O ERP passou primeiro por implantação isolada (`dpl_87fMPsRXES2R9VuftnyqFCBhzAuj`, build de 90,2 s), consulta sem credencial retornando 401 e promoção. A publicação via Git depois gerou outra implantação do mesmo commit. Proxy e site foram publicados pelo Git conectado, nessa ordem, após falhas de conexão/timeout dos uploads locais. O site principal só foi enviado após conferir a nova rota no proxy.

As cópias de publicação foram geradas dos commits, sem arquivos `.env`, credenciais, fotos não versionadas ou alterações locais de outras frentes. O site principal recebeu a API de captura conferida, o rewrite exato de `/api/ssl26-checkout` e o novo bundle `/solarsemlimites2026/assets/index-EvZryv5-.js`. Guia, privacidade, PDFs, fotos e bundles antigos foram preservados.

### Banco: instalado e verificado

Projeto Supabase `HotelSolarReservas` (`sxplhqjnalnckzijvkjm`). Migrações instaladas, na ordem, em **uma única transação**:

1. `202609211800_ssl26_audience_exclusions.sql`.
2. `202609211900_ssl26_purchase_attribution.sql`.
3. `202609231900_ssl26_checkout_eligibility.sql`.

O pacote incluiu precondições que impedem sobrescrever guardas diferentes dos conferidos; limites de bloqueio de 5 segundos e execução de 30 segundos. SHA-256 do pacote exato: `541187b43d8fc371202f64eb8ddef81d31378e81e7dd1908ffc4c302fd3edf45`. A mesma transação passou antes no PostgreSQL isolado. Supabase retornou `AUT06_INSTALLED`.

Conferência posterior, sem dados pessoais:

| Verificação | Resultado |
|---|---|
| Compras aprovadas | 51 antes e depois |
| Leads / eventos / controles / entregas | 2 / 7 / 2 / 1, sem alteração |
| Origem de pedidos / exclusões / tarefas novas | 0 / 0 / 0 |
| Três tabelas novas | RLS ligado; sem leitura/escrita para `anon` ou `authenticated` |
| Consulta de elegibilidade | Somente `service_role`, não pública |
| Dois leads existentes | Ambos continuam `blocked`; consulta somente leitura |
| Aprovação PCDA vigente | Preservada; hash da função antes/depois `fc26abbb01e64090f881e6aa67753265` |

A função de aprovação vigente foi lida e preservada: autenticação do funcionário, status ativo, troca de senha pendente e cargos autorizados continuam conferidos. Não foi reinstalada a migração antiga de aprovação. Não houve retroclassificação de compras ou contatos.

### Configuração técnica

Foram adicionados em produção somente os controles técnicos `SSL26_CHECKOUT_ATTRIBUTION_ENABLED` (ERP e proxy), `SSL26_CHECKOUT_SOURCE_REVIEWED`, `SSL26_APPROVAL_ACCESS_REVIEWED` (ERP) e `SSL26_CENTRAL_ELIGIBILITY_ENABLED` (ERP e site principal), com valor `true`. Não são permissão de disparo.

Preflight de campanha: `SSL26_SYNC_ENABLED=false`, `SSL26_AUTOMATIONS_REVIEWED=false`, `SSL26_SUPPRESSION_ENABLED=false`; boa-vinda sem habilitação. Os controles de atendimento e ingestão já existentes foram preservados. O webhook da captura continua apontando ao ERP canônico em `/api/ssl26/ingest`; nenhuma credencial foi alterada.

## Verificação e limites

- Preparação anterior: **716 testes ERP + 112 página/APIs + 26 cenários de navegador**, descritos no [relatório local](SSL26_AUT06_Integracao_Local_2026-09-23.md).
- Nesta publicação: pacote atômico SQL testado isoladamente; **21 testes críticos ERP e 12 testes das APIs repetidos, todos aprovados e sem ignorados**. Não somar novamente esses 33 aos 854 anteriores.
- API de captura do host e da origem idênticas: SHA-256 `46129dc5d2d03c090956f6e8ed23889d347592e2e98e17c21c1b942824d76022`.
- Build estático Vite aprovado. Bundle público idêntico ao arquivo do commit: SHA-256 `f8527d470eeb1c8e9d0083c4bc06d151fb4965a7c28c16b6c2e7edb6609005b9`.
- ERP público: consulta de elegibilidade sem autenticação → **401**.
- Nova rota de checkout: GET → **405**; requisição sintética de novembro, tanto no proxy quanto no domínio principal → **409 / carrinho fechado**. Não houve pedido, pagamento ou e-mail. Não foi alterado o calendário para testar.
- Domínio principal: vendas e captação → **200**; vendas mantém `noindex, nofollow`; bundle novo → **200**, contendo a rota exclusiva. Cadastro vazio → **400**, sem cadastro/mensagem.
- Testes válidos de cadastro, cobrança e envio **não** foram realizados nesta publicação. Essa homologação continua em escopo próprio, com autorização específica.
- Depois das verificações HTTP, o banco foi novamente conferido: 51 aprovadas; 2 leads, 7 eventos, 2 controles, 1 entrega; zero pedidos de campanha, exclusões ou tarefas novas. Ambos os leads continuam bloqueados. O papel de servidor possui a leitura de compras exigida pela checagem central. Os hashes dos quatro guardas substituídos também coincidem com a migração final.
- Consulta de logs das três implantações verificadas, filtro de erro na última hora: **zero registros de erro retornados**. É uma amostra da janela de publicação, não garantia de ausência futura de falhas.
- **Drains: nenhum configurado.** Nenhum destino novo de logs, alerta ou monitoramento recorrente foi criado. Alertas/rotina de acompanhamento continuam pendentes em AUT-09.

**AUT-06 continua parcial.** Metadados/filtros por canal, operação do espelhamento/reconciliação e homologação dos fluxos reais permanecem pendentes. Este trabalho não ativa campanha, não cancela requisições já iniciadas em provedores e não substitui o ensaio completo. Percentual registrado mantido em **84%**; a proposta anterior de 86% permanece para avaliação de Geraldo.

## Referências de recuperação

Implantações anteriores preservadas: ERP `dpl_AwQ4tcgAUuNEnNKgN77hahqhSuHY`; proxy `dpl_GJJoFH48MgSfaVuZj2Jg5pVLuTY2`; site `dpl_Ec5YYAXyyM4sDUtF8aLzrUiZmoWZ`.

Em falha, segurar a promoção ou voltar à implantação anterior conferida; não apagar os novos registros de evidência nem desfazer exclusões/consentimentos. Reversão do código não desfaz SQL. Não desligar a proteção central da captura como atalho, pois isso recoloca o comportamento legado; preferir conter o ponto afetado e corrigir com verificação.
