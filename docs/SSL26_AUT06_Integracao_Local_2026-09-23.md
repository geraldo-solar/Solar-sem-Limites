# AUT-06 — checkout e exclusões centrais

**23/09/2026 · preparação local; não publicada nem instalada. Campanha desligada.**

O checkout de novembro foi conectado, no código, ao registro de origem da compra e à exclusão de compradores aprovada no ERP. A captura ganhou consulta central antes da inclusão na lista e imediatamente antes do e-mail. AUT-06 permanece **Parcial**, pois metadados, filtros, instalação e homologação reais ainda faltam. A pontuação registrada continua em 84%; a proposta anterior de 86% depende do aval de Geraldo e não é pontuada novamente por esta entrega.

## O que mudou

- **Origem verificável da compra:** novembro chama uma rota exclusiva, cujo servidor fixa a campanha. O ERP valida a credencial existente e confirma o registro de origem antes de gravar pedido, abrir pagamento ou enviar confirmação operacional. Campo/UTM enviado pelo visitante não autoriza a atribuição. A janela comercial é conferida no servidor.
- **Repetição e alteração:** repetir o mesmo pedido após falha conserva o ID. Mudar comprador, quantidade ou forma/entrada cria outro ID. Um gatilho preparado para o banco impede substituir a identidade ou o valor de um pedido que já tem comprovante de origem. Não há marcação retroativa de compras antigas.
- **Compra aprovada:** após a decisão autenticada já existente, o ERP tenta registrar a retenção de comprador. Uma falha nessa etapa não desfaz a compra, não repete a aprovação e não impede seu e-mail operacional; devolve aviso para conferência. Mesmo antes da atualização das tags, a consulta central reconhece uma compra aprovada da campanha e segura novas comunicações de aquisição.
- **E-mail:** com a nova verificação habilitada, a captura confirma primeiro a gravação no ERP. Depois consulta a identidade exata e os bloqueios centrais antes da lista e novamente antes da entrega. Sem confirmação de gravação, retorna erro e preserva o formulário para tentativa manual; não anuncia um cadastro salvo. Estado incerto, telefone divergente, QA, saída, atendimento ou comprador seguram a inclusão/envio. O perfil também respeita o bloqueio.
- **WhatsApp:** as funções de reserva/início da boa-vinda e de sincronização consultam a mesma decisão central. Uma aprovação ocorrida depois da reserva impede o envio ainda não iniciado, mesmo se a fila de espelhamento falhar.
- **Cartão em novembro:** sempre na Cielo. Se a consulta de status falhar ou informar Cielo desligada, não reaparecem campos de cartão/CVV. A nova rota recusa esses dados antes de encaminhar ao ERP. O caminho padrão do checkout de julho foi preservado; não houve publicação nele.

QA, pausa de atendimento, descadastro e comprador continuam sendo motivos distintos. Não houve liberação de contatos, alteração de consentimento, mesclagem, blacklist global ou reinscrição.

## Provas locais

- **716 testes do ERP:** incluindo permissões, falha de fila, repetição, identidade/valor imutáveis, bloqueio central de e-mail e WhatsApp e execução do handler real de ingestão com dependências simuladas.
- **112 testes da página/APIs:** incluindo os casos centrais de captura, rota exclusiva, falhas e preservação das regras anteriores quando o novo controle não está habilitado.
- **26 cenários de checkout no navegador:** 13 no computador e 13 no celular; Pix, cartão, combinação, falhas, janela, aceite, reenvio e mudança de quantidade. Todos com pedidos fictícios, ERP/Cielo/e-mail interceptados e rastreamento bloqueado. Só CSS/fontes públicos foram carregados externamente.
- Banco PostgreSQL efêmero via PGlite, com as migrações aplicadas duas vezes; nenhum SQL executado no Supabase real. Isso não substitui teste de concorrência com várias conexões no ambiente hospedado.
- Build da página, TypeScript do ERP e das APIs alteradas, ESLint dos módulos ERP alterados e conferência de diferenças. Prévia local sem proxy para produção; formulário renderizado e sem erro de aplicação após permitir o CSS público.

Os testes são camadas complementares: navegador → API simulada; handler → dependências simuladas; contrato → banco isolado → decisão de elegibilidade. **Não são uma nova compra ponta a ponta em produção.**

## Publicação coordenada — próxima etapa, ainda não executada

Não publicar somente o novo frontend: ele usa `/api/ssl26-checkout`, que não existe no roteamento atual do domínio principal, e o backend novo permanece fechado sem seus controles explícitos.

1. Conferir o estado real, os diffs e as dependências da implantação; manter todos os disparos/gatilhos comerciais desligados. Não repetir migrações antigas por cima de funções mais novas.
2. Revisar/aplicar, se ainda ausentes, as migrações do ERP `202609211800_ssl26_audience_exclusions.sql`, `202609211900_ssl26_purchase_attribution.sql` e `202609231900_ssl26_checkout_eligibility.sql`, nessa ordem. A aprovação autenticada do PCDA já foi publicada em 21/09, conforme o checklist; não é esta entrega.
3. Publicar o ERP e a rota exclusiva no projeto `solar-sem-limites`, inicialmente fechados. Reutilizar as credenciais existentes pelo servidor, sem copiar chaves para o navegador.
4. No projeto do domínio principal, preparar o rewrite exato: `/api/ssl26-checkout` → `https://solar-sem-limites.vercel.app/api/ssl26-checkout`. O arquivo local conferido foi `../Site Hotel Solar/vercel.json`; **não foi modificado nesta rodada**. Levar também a versão da captura/API para o projeto que efetivamente a serve; publicar apenas o repositório de origem não atualiza automaticamente essas cópias.
5. Somente após conferir instalação, rota, autorização do PCDA e evidência de origem, habilitar os controles técnicos abaixo, sem habilitar campanha. Publicar o frontend junto do roteamento funcional. Fora de 25/11 8h–01/12 23h59, o servidor continua recusando compra atribuída a este lançamento; não alterar o calendário para testar.
6. Criar/conferir metadados QA/atendimento/comprador e instalar filtros de exclusão em cada audiência/fluxo, incluindo entrada e momento do envio. Homologar o processador de espelhamento e a recuperação de pendências sem reativar contatos.
7. Planejar testes controlados novos, com destinatários/efeitos explicitamente autorizados. As autorizações antigas de WhatsApp não são autorização para reenvio. Não aprovar compra de teste em produção apenas para exercitar a exclusão: a decisão é imutável e alimenta o placar.

### Controles técnicos (nomes, sem valores secretos)

| Ambiente | Controles novos necessários |
|---|---|
| ERP | `SSL26_CHECKOUT_ATTRIBUTION_ENABLED`, `SSL26_CHECKOUT_SOURCE_REVIEWED`, `SSL26_APPROVAL_ACCESS_REVIEWED`, `SSL26_CENTRAL_ELIGIBILITY_ENABLED` |
| Proxy exclusivo | `SSL26_CHECKOUT_ATTRIBUTION_ENABLED`; usa o `SOLAR_INGEST_SECRET` e o endereço do ERP já existentes |
| API de captura efetivamente publicada | `SSL26_CENTRAL_ELIGIBILITY_ENABLED`; usa `LEAD_WEBHOOK_URL` canônico terminando em `/api/ssl26/ingest` e `LEAD_WEBHOOK_TOKEN` existentes |

Os valores novos só habilitam o código quando são explicitamente `true`. Nenhuma variável de ambiente foi alterada nesta etapa. Com o controle central ausente, o comportamento legado da captura é preservado; portanto, código publicado sozinho não comprova proteção central em produção. As funções SQL de WhatsApp passam a usar o bloqueio central ao instalar a migração, independentemente do controle HTTP.

## Limites e condições de aceite

- A atualização central não cancela uma requisição já iniciada no provedor. Existe intervalo entre a última checagem e o início do envio; filtros dos canais e rechecagem continuam necessários. Não afirmar atomicidade entre ERP e provedores.
- A compra e seu registro de origem são duas etapas: o registro vem antes, e a falha interrompe o pedido. Um registro sem compra fica pendente, nunca vira comprador por conta própria.
- Reconciliação após aprovação está ligada no código; a varredura/reexecução controlada de pendências e o processador de espelhamento ainda precisam de instalação/operação. A consulta central continua bloqueando o comprador aprovado se essa etapa falhar.
- `eligible` é somente um candidato à entrega solicitada naquela verificação, não autorização para campanha, compra, opt-in ou contato individual.
- Proteção central de captura e boa-vinda não prova exclusão em todo fluxo visual/manual do ManyChat ou em todo disparo Brevo. Os filtros por canal continuam pendentes.
- QA exige identificação explícita e evidência; não inferir pelo nome, endereço de e-mail ou descadastro. Compras e contatos históricos não foram reclassificados.
- Sem alterações financeiras, saldo de diárias, preços, regulamento, datas, peças, fotos ou textos de campanha. Sem commit, publicação, migração remota, criação de metadados ou mensagens nesta rodada.

[Checklist mestre](SSL26_Checklist_Mestre.md) · [Origem de comprador](<../../ERP Hotel Solar/docs/ssl26-comprador-campanha.md>) · [Exclusões por canal](<../../ERP Hotel Solar/docs/ssl26-exclusoes-audiencia.md>).
