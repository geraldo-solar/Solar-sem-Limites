# Solar Sem Limites — Hotel Solar

Página de vendas, checkout e captação do lançamento Solar Sem Limites.

## Rotas

- `https://hotelsolar.tur.br/solarsemlimitescadastro`: endereço oficial da captação de novembro de 2026.
- `/#/lista-vip`: landing de captação de novembro de 2026.
- `/#/checkout`: checkout.
- `/`: página de vendas atual.

## Desenvolvimento local

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env.local` apenas quando precisar testar as APIs.
3. Execute `npm run dev`.
4. Valide a produção com `npm run build` e `npx tsc --noEmit`.

Nunca coloque chaves Brevo, ManyChat ou de webhook em variáveis `VITE_*`, pois elas seriam incluídas no JavaScript público.

## Ativação SSL26

- Guia operacional: `docs/Ativacao_Captacao_SSL26.md`.
- Preparar pasta, lista e campos no Brevo: `npm run setup:brevo`.
- Variáveis necessárias: `.env.example`.
