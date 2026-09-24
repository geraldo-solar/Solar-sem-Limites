# SSL26 — proteções do servidor e processador privado de exclusões

**Atualização posterior, 24/09 às 10h08:** publicação autorizada concluída no ERP, origem e site principal; duas revisões ManyChat publicadas, ambas `STOPPED` e sem gatilho. Doze verificações HTTP aprovadas; processadores continuam desativados. [Estado atual, versões e próxima sequência](SSL26_Guardas_Publicacao_2026-09-24.md). O relato abaixo preserva a preparação local anterior à autorização.

**24/09/2026 — entrega local, sem commit ou publicação. AUT-06 parcial; preparação mantida em 84%; campanha desligada.**

## Entrega desta etapa

O servidor do ERP agora verifica as mesmas seis tags dos cinco pontos já preparados nos rascunhos do ManyChat: `SSL26_OPT_OUT`, `ATENDIMENTO_HOTEL_ATIVO`, `SSL26_COMPRADOR`, `SSL26_QA`, `SSL26_ATENDIMENTO_PAUSA` e `SSL26_PAUSA_REVISAO`.

O ajuste cobre a sincronização do cadastro e o despachante de boas-vindas, inclusive suas releituras. Uma tag presente interrompe a aquisição; estado incompleto exige revisão. A ausência dessas tags **não substitui consentimento, identidade, elegibilidade central ou autorização de envio**. Pedidos de saída e encaminhamento humano não receberam bloqueios de aquisição.

A lacuna da tag `SSL26_PAUSA_REVISAO` foi reproduzida nos testes antes da correção. A regra ficou centralizada em [acquisitionHolds.ts](<../../ERP Hotel Solar/src/lib/ssl26/acquisitionHolds.ts>), usada por [sync.ts](<../../ERP Hotel Solar/src/lib/ssl26/sync.ts>) e [welcome.ts](<../../ERP Hotel Solar/src/lib/ssl26/welcome.ts>).

## Operação controlada preparada, não ativada

Foi criada a rota privada `POST /api/ssl26/exclusions/process` no ERP, reutilizando o processador e a fila persistente já existentes. Processa **uma tarefa previamente registrada**, identificada por lead, motivo (`qa`, `support` ou `buyer`) e provedor (`manychat` ou `brevo`). Não cria a exclusão nem escolhe uma audiência automaticamente.

- Autenticação pelo segredo de servidor existente antes da leitura do corpo e da construção de clientes; segredo não exposto nesta documentação.
- Corpo limitado a 1.024 bytes e somente aos três campos esperados. Não aceita telefone, e-mail, lote, consentimento ou opção de forçar/repetir.
- Desligada por padrão. Exige conjuntamente `SSL26_EXCLUSION_PROCESS_ENABLED=true`, `SSL26_AUTOMATIONS_REVIEWED=true` e `SSL26_EXCLUSION_METADATA_REVIEWED=true`. Nenhuma dessas configurações foi alterada nesta etapa.
- Ligar sincronização, supressão ou boas-vindas não liga essa rota. Revisões globais ainda pendentes não podem ser marcadas como concluídas para contornar a proteção.
- Reserva durável da tarefa, releitura de identidade e do bloqueio, alteração restrita ao marcador correspondente e confirmação do resultado. No Brevo, retirada somente da lista SSL26 #24, conferida também pelo nome; outras listas e bloqueios globais preservados.
- Falha incerta após tentativa de escrita fica `unknown`, sem repetição automática. Reinvocar não reinicia tarefas concluídas, em processamento ou incertas.
- Respostas sem cache. A orientação de Next.js foi aplicada à rota no servidor, com runtime Node e execução dinâmica.

Não há agenda, processamento em lote, preenchimento retroativo de QA, liberação de bloqueio, criação/mesclagem de contato, alteração de consentimento ou envio de mensagem. **Rota preparada não significa conciliação global concluída.**

Código: [rota](<../../ERP Hotel Solar/src/app/api/ssl26/exclusions/process/route.ts>), [receptor/processador](<../../ERP Hotel Solar/src/lib/ssl26/exclusions.ts>) e [repositório existente](<../../ERP Hotel Solar/src/lib/ssl26/exclusionRepository.ts>).

## Verificação local

| Conferência | Resultado |
|---|---|
| Suíte completa do ERP, incluindo banco efêmero PGlite | **738 aprovados, zero falhas e zero ignorados** |
| Recorte de proteções, exclusões, rota, sincronização e boas-vindas | 118 aprovados; já incluídos nos 738, não somar novamente |
| Página: captura, elegibilidade central, filtros e política de audiência | **99 aprovados, zero falhas e zero ignorados** |
| TypeScript completo do ERP | Aprovado |
| ESLint dos cinco módulos de produção alterados/criados | Aprovado |
| Conferência de espaços do diff | Aprovada |

Os testes cobrem as 64 combinações das seis tags, bloqueio surgido na última leitura, autenticação, três controles de liberação, corpo inválido, uma tarefa por chamada, repetição, falha incerta e persistência no PostgreSQL local. A rota real foi carregada com dependências simuladas. A integração receptor → repositório → banco efêmero também foi exercitada, com provedor simulado.

Foram acrescentados 22 casos de teste no ERP, além de ampliar verificações existentes. Nenhum teste desta etapa consultou ou alterou contatos reais. As respostas dos provedores foram simuladas; o banco de teste não é o Supabase de produção.

```sh
# ERP; SSL26_PGLITE_MODULE aponta para a instalação local de PGlite.
node --test --test-concurrency=4 tests/*.test.mjs
./node_modules/.bin/tsc --noEmit --incremental false
./node_modules/.bin/eslint src/lib/ssl26/acquisitionHolds.ts src/lib/ssl26/exclusions.ts src/lib/ssl26/sync.ts src/lib/ssl26/welcome.ts src/app/api/ssl26/exclusions/process/route.ts

# Repositório da página
node --experimental-strip-types --test tests/capture-lead.test.mjs tests/ssl26-central-email.test.mjs tests/ssl26-exclusion-filters.test.mjs tests/ssl26-audience-policy.test.mjs
```

## Estado real e próxima sequência

1. **Ainda local:** alinhamento do ERP, nova rota e correção de identidade antes do e-mail preparada na etapa anterior. Os cinco pontos do ManyChat continuam somente em rascunho. Não houve nova leitura ou edição remota nesta rodada.
2. **Próximo:** revisar e publicar coordenadamente o código e as proteções dos fluxos, com autorização própria e controles/gatilhos/campanha desligados. A correção da captura precisa alcançar também a cópia servida pelo domínio principal; publicar somente o repositório de origem não basta.
3. Conferir tarefas e evidências existentes, identidade exata por canal e cobertura de automações. Separar ausência de marcador, ausência de tarefa e falha incerta; não fabricar QA ou comprador.
4. Após revisão e aceite de um escopo limitado, homologar a sincronização de marcadores em um piloto autorizado, sem mensagens ou reinscrição. Não reutilizar autorizações antigas de testes.
5. Concluir operação de conciliação e cobertura de audiência. AUT-05 ainda depende de timeout real e conversa inicialmente fechada/com outro responsável. Só depois avaliar liberação da captação.

**Sem commit, deploy, migração remota, nova configuração, edição de fluxo, alteração de contato, mensagem, compra ou ativação nesta etapa.** Fotos, textos e guia continuam para a revisão final.

[Checklist mestre](SSL26_Checklist_Mestre.md) · [Rascunhos e correção da captura](SSL26_Guardas_Rascunhos_2026-09-24.md) · [Filtros salvos](SSL26_Filtros_Exclusao_2026-09-24.md).
