# Ativação da captação — Solar Sem Limites 2026

## Objetivo

Colocar a landing `/#/lista-vip` em produção sem misturar os leads de novembro de 2026 com compradores antigos, reservas ou atendimentos correntes do Hotel Solar.

## Projeto de produção

- Vercel: `solar-sem-limites`
- Project ID: `prj_qasIdkmJPxWYZjaWeyx2Mz2q3yYB`
- Domínio principal recomendado: `https://solarsemlimites.hotelsolar.tur.br`
- Rota de captação: `https://solarsemlimites.hotelsolar.tur.br/#/lista-vip`

## 1. Brevo

### Estrutura

- Pasta: `Solar Sem Limites 2026`
- Lista: `SSL26_LEADS` — ID `24`, criada em 16/09/2026
- Campos:
  - `SSL26_PROFILE`
  - `SSL26_SOURCE`
  - `SSL26_CAMPAIGN`
  - `SSL26_REFERRAL`
  - `SSL26_CONSENT_AT`

O instalador é idempotente: pode ser executado novamente sem duplicar pasta, lista ou campos.

```bash
npm run setup:brevo
```

O comando precisa receber `BREVO_API_KEY` no ambiente seguro. Ao terminar, ele imprime o ID da lista que deve ser cadastrado na Vercel como `BREVO_LEADS_LIST_ID`.

### Variáveis de produção

Use `.env.example` como checklist. Chaves e tokens nunca devem ser colocados no Git nem receber o prefixo `VITE_`.

Obrigatórias:

- `BREVO_API_KEY`
- `BREVO_LEADS_LIST_ID`
- `BREVO_SSL26_ATTRIBUTES_ENABLED=true`
- `BREVO_PROFILE_ATTRIBUTE=SSL26_PROFILE`
- `PUBLIC_SITE_URL=https://solarsemlimites.hotelsolar.tur.br`

## 2. Ponte ManyChat–ERP

Configurar um único webhook HTTPS autenticado em `LEAD_WEBHOOK_URL`. Pode ser um fluxo no Make/n8n ou um endpoint do ERP. O token compartilhado deve ficar em `LEAD_WEBHOOK_TOKEN`.

### Eventos enviados pela landing

- `ssl26_lead_captured`: primeira etapa concluída.
- `ssl26_lead_profiled`: relacionamento com o Hotel Solar informado.

Exemplo resumido:

```json
{
  "event": "ssl26_lead_captured",
  "eventId": "ssl26-...:capture",
  "tag": "SSL26_LEAD",
  "tags": ["SSL26_LEAD", "SSL26_CAPTADO"],
  "capturedAt": "2026-10-19T12:00:00.000Z",
  "consent": {
    "granted": true,
    "source": "landing_ssl26"
  },
  "lead": {
    "firstName": "Maria",
    "email": "maria@example.com",
    "phone": "+5591999999999",
    "profile": "nao_conhece"
  },
  "tracking": {
    "utmSource": "meta",
    "utmMedium": "paid_social",
    "utmCampaign": "ssl26_captacao",
    "utmContent": "video_atalaia",
    "utmTerm": "familias_para",
    "referral": ""
  }
}
```

Use `eventId` como chave de idempotência para impedir duplicações quando houver repetição de entrega.

## 3. Configuração do ManyChat

### Tags obrigatórias

- `SSL26_LEAD`
- `SSL26_CAPTADO`
- `SSL26_CANAL_VIP`
- `SSL26_ENGAJADO`
- `SSL26_LIVE`
- `SSL26_PAGINA_VENDAS`
- `SSL26_CHECKOUT_INICIADO`
- `SSL26_CHECKOUT_ABANDONADO`
- `SSL26_PAGAMENTO_PENDENTE`
- `SSL26_COMPRADOR`
- `SSL26_OPT_OUT`
- `ATENDIMENTO_HOTEL_ATIVO`

### Campos personalizados

- `ssl26_profile`
- `ssl26_source`
- `ssl26_utm_campaign`
- `ssl26_utm_content`
- `ssl26_referral`
- `ssl26_consent_at`

### Fluxo inicial

1. Criar/atualizar o contato usando o WhatsApp em formato internacional.
2. Aplicar `SSL26_LEAD` e `SSL26_CAPTADO`.
3. Gravar os campos de origem, campanha, perfil e consentimento.
4. Se existir `SSL26_OPT_OUT` ou `ATENDIMENTO_HOTEL_ATIVO`, não iniciar mensagem comercial.
5. Para contatos novos, usar o gatilho “New contact” com as condições “Opted-in through API” e “Opted-in for WhatsApp”.
6. Enviar apenas modelo de mensagem aprovado quando o contato estiver fora da janela de 24 horas.
7. A mensagem inicial deve entregar o guia e oferecer o link do Canal VIP; não deve apresentar a oferta de venda antes da programação aprovada.

## 4. Mapeamento de perfil

| Valor técnico | Comunicação |
|---|---|
| `ja_hospedou` | Retorno, economia, lembranças e novidades |
| `conhece` | Confiança, estrutura e motivos para se hospedar |
| `nao_conhece` | Destino, história, localização e experiência familiar |

## 5. Teste antes da publicação

- Usar um e-mail e telefone autorizados da equipe.
- Confirmar entrada na lista `SSL26_LEADS`.
- Confirmar recebimento do e-mail com o guia.
- Confirmar tags e campos no ManyChat.
- Confirmar que o lead aparece no painel do ERP uma única vez.
- Testar pedido de descadastro e bloqueio por `ATENDIMENTO_HOTEL_ATIVO`.
- Verificar UTMs com campanhas de teste distintas.
- Só então liberar anúncios e tráfego orgânico.

## Referências técnicas

- Brevo — criação de listas: https://developers.brevo.com/reference/create-list
- Brevo — criação/atualização de contatos: https://developers.brevo.com/docs/synchronise-contact-lists
- ManyChat — contatos de WhatsApp via API: https://help.manychat.com/hc/pt-br/articles/14281353475228-Como-criar-contatos-do-WhatsApp-via-API-da-Manychat
- ManyChat — token e limites da API: https://help.manychat.com/hc/en-us/articles/14959510331420-How-to-generate-a-token-for-the-Manychat-API-and-where-to-get-parameters
