# VEN-10 — Plano para fechar a chave pública do banco

Prazo: **antes de 26/10/2026**. Responsável: Andrey, com o agente. Aprovação: Geraldo.
Teste de aceite: `node scripts/auditar-chave-publica.mjs` (no ERP) precisa terminar com **0 problemas**. Em 22/09 terminou com **39 problemas em 65 tabelas**.

## O problema, medido em 22/09

O banco (Supabase) tem uma chave pública que vai dentro do código das páginas — qualquer pessoa pode copiá-la. Ela foi feita para o catálogo público (quartos, pacotes), mas hoje abre quase tudo:

| O quê | Situação com a chave pública |
|---|---|
| Hóspedes (1.207), com CPF, nascimento, endereço | lê e altera |
| Funcionários (97), com RG e documento | lê e altera |
| **Ponto eletrônico**: 79 funcionários com **PIN**, CPF, telefone; 13.616 batidas | lê e **altera** — dá para bater ponto por outra pessoa e mudar registros que vão para a folha |
| Reservas, fólios, caixa, notas fiscais, financeiro | lê e altera |
| Saldo de diárias do PCDA | altera (dá para se dar diárias) |
| Cupons de desconto do Motor | altera (dá para criar cupom) |
| Token da Nuvem Fiscal (emissão de nota) | lê |
| **Cadastro no login do Supabase** | **aberto ao público**: qualquer um cria conta e vira "usuário logado". Já existe uma conta de fora (domínio de universidade polonesa, 20/07/2026, nunca confirmada) |

Já resolvido em 22/09: cartões com CVV nas reservas (27 limpos, 5 aguardando a recepção; banco agora descarta cartão em qualquer gravação), Motor de Reservas sem cartão (Cielo), rotas abertas de e-mail do checkout, dados do comprador do PCDA e códigos de indicação fora da chave pública.

## Quem usa a chave pública hoje (não pode quebrar)

| Sistema | Onde | Usa para | Depois |
|---|---|---|---|
| ERP | erp-hotel-solar | todas as telas (96 arquivos, **uma conexão só**: `src/lib/supabase.ts`) | sessão do funcionário reconhecida pelo banco |
| ERP, 6 rotas do servidor | NFC-e (emitir, sincronizar), agente, solar-intelligence, contabilidade (portal por link) | leituras no servidor | chave do servidor |
| Motor de Reservas, site público | reservas.hotelsolar.tur.br | catálogo; **grava reserva e hóspede**; **baixa a lista de reservas** para achar a do cancelamento | catálogo segue público; gravação e busca por rotas do servidor |
| Motor, painel | idem, com login do Supabase | reservas, hóspedes | usuário logado (com cadastro fechado) |
| Ponto eletrônico | ponto-eletr-nico | funcionários e batidas, conferência do PIN **no navegador** | PIN conferido no banco; batida gravada por função protegida |
| Guia interativo | — | pontos e categorias | leitura pública só dessas |
| Pesquisa de satisfação | pesquisa-satisfacao-hotel-solar | grava avaliação | só inserir, sem ler |
| Site do hotel | sitehotelsolar | quartos e pacotes | leitura pública |

Scripts avulsos na pasta Documentos também usam o endereço do banco; rodam só no computador e não são sistemas publicados.

## Fases

### Fase 0 — Emergência (esta semana; poucas horas)

Sem risco de quebrar nada. Cada item é independente.

1. ~~**Fechar o cadastro público do login do Supabase**~~ — **feito por Geraldo em 23/09**; conferido de fora: configuração pública com cadastro desativado e tentativa de cadastro recusada ("Signups not allowed"). Contas existentes seguem entrando. Observação: o Guia interativo (não publicado) cria conta de visitante por esse cadastro; se for ao ar, refazer com outro método.
2. ~~**Apagar a conta de fora**~~ — **feito por Geraldo em 23/09** (ues.edu.pl e hotmail); restam 3 contas, todas @hotelsolar.tur.br.
3. **Cupons do Motor**: migração `202609231200_cupons_so_leitura_publica.sql` pronta (a chave pública só lê; o painel, com login, continua criando e apagando). Aguardando Geraldo rodar.
4. ~~**Motor: rota de envio de e-mail**~~ — **fechada em 23/09**: era retransmissor aberto (qualquer destinatário, conteúdo e remetente, pela conta do Brevo do hotel), com a chave do Brevo escrita no código e pedaços dela expostos num GET. Agora remetente fixo do hotel, envio só para o hóspede da reserva informada ou para o endereço interno, chave só da variável; conferido no ar (GET 405, sem reserva 400, destinatário de fora 403). Nenhum site publicado carrega chave do Brevo no navegador. **Falta: trocar a chave do Brevo** (está no histórico do Git) nos 5 projetos da Vercel que a usam — erp-hotel-solar, motor-de-reservas-on-line-hotel-solar, sitehotelsolar, solar-sem-limites, checkout-solar-sem-limites.
5. **5 cartões antigos** — limpar assim que a recepção confirmar a cobrança (dois check-ins em 25/09).

### Fase 1 — ERP com sessão reconhecida pelo banco (2–3 dias)

A base do resto. O login do ERP já emite um cookie assinado que o servidor confere (22/09). Falta o **banco** reconhecer o funcionário.

1. No login, o servidor do ERP emite também um **token do Supabase** (papel "usuário logado", validade de 12 horas, igual à sessão da tela), assinado com o segredo JWT do projeto. **Geraldo cadastra `SUPABASE_JWT_SECRET` na Vercel do ERP** (Supabase → Project Settings → API → JWT Secret); o valor não passa pelo agente.
2. A conexão única do navegador (`src/lib/supabase.ts`) passa a enviar esse token. As 96 telas continuam iguais.
3. As 6 rotas do servidor que usam a chave pública passam para a chave do servidor.
4. Sessões abertas antes da mudança pedem novo login (como no cookie de 22/09).

Ainda não fecha nada — só prepara. Conferência: navegar pelas telas principais (recepção, PDV, financeiro, CRM/PCDA, almoxarifado, pessoal, contabilidade) logado, com o registro de erros aberto.

### Fase 2 — Sistemas públicos gravando pelo servidor (3–4 dias)

1. **Motor, site público**: gravar reserva e hóspede por uma rota do servidor (já existe `api/create-reservation.ts`, usada pelo chatbot — passa a usar a chave do servidor e a servir também o site); **cancelamento e pré-check-in buscam só a reserva do código informado**, pelo servidor, em vez de baixar todas as reservas no navegador.
2. **Ponto eletrônico**: PIN conferido no banco por função protegida, que grava a batida; o aplicativo deixa de ler a tabela de funcionários. O painel administrativo do ponto passa a exigir login.
3. **Pesquisa de satisfação**: só inserir avaliação.

### Fase 3 — Fechar (1 dia + observação)

1. Uma migração tira da chave pública **tudo**, exceto leitura de `room_types`, `packages`, `extras`, `room_categories`, `pois`, `categories` (catálogo sem dado pessoal) e a inserção de avaliação.
2. "Usuário logado" mantém o acesso de hoje — agora só funcionários do ERP e contas do painel do Motor, com o cadastro fechado.
3. `node scripts/auditar-chave-publica.mjs` → **0 problemas**.
4. Observar 48 horas: registro de erros do ERP, Motor e Ponto; reservas do site e batidas de ponto chegando.
5. **Volta atrás**: a migração vem com a reversa pronta (devolve as permissões de hoje), para usar se algo essencial quebrar.

### Fase 4 — Depois do lançamento (fora do VEN-10)

Permissão por setor no banco (recepção não lê folha, por exemplo). Hoje isso é controlado só nas telas. Registrar como item próprio.

## Decisões que precisam de Geraldo

1. **Fase 0 já** (cadastro, conta de fora, chave do Brevo)?
2. **Token da Nuvem Fiscal**: segue para depois, mas a Fase 3 deixa de expô-lo — trocar o token continua recomendado porque ele já esteve público.
3. **Janela da Fase 3**: um dia útil de manhã, com alguém da recepção e do financeiro testando logo depois.
4. **LGPD**: dados pessoais estiveram expostos; avaliar com quem cuida do jurídico se há comunicação a fazer. O Supabase guarda registros de acesso recentes, que ajudam a avaliar se houve leitura por terceiros.

## Riscos

- **Tela do ERP que lê o banco sem passar pela conexão única** — procurar antes da Fase 3 (hoje: nenhuma encontrada fora das 6 rotas do servidor).
- **Versão antiga em cache** do Motor e do Ponto (são aplicativos instaláveis) continuaria usando o caminho antigo depois do fechamento: a Fase 2 precisa estar no ar alguns dias antes da Fase 3.
- **Realtime** (atualização ao vivo do painel do Motor) passa a exigir usuário logado — já é o caso do painel.
- **Contas do Supabase** viram a porta de entrada do painel do Motor: senhas fortes e só quem precisa.
