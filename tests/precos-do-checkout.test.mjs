import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { existsSync } from 'node:fs';

// VEN-02: o mesmo pedido tem que custar o mesmo em todo lugar.
//
// O preço é calculado em mais de um ponto: a tela do checkout, o e-mail de
// confirmação ao cliente e o ERP, que grava o valor para a contabilidade.
// Cada um tem a própria conta. Se divergirem, o cliente recebe um e-mail com
// um valor e a conciliação espera outro. Este teste roda o código real do
// e-mail e do ERP contra a regra do regulamento (cláusula 3), para todas as
// combinações que a tela oferece.

const previousEnv = { ...process.env };
const previousFetch = globalThis.fetch;
process.env.BREVO_API_KEY = 'test-only-not-a-real-key';
const { default: brevo } = await import('../api/brevo.ts');

const ERP_PRICING = new URL('../../ERP Hotel Solar/src/lib/advancePackages/pricing.ts', import.meta.url);
const erp = existsSync(ERP_PRICING) ? await import(ERP_PRICING.href) : null;

after(() => {
  process.env = previousEnv;
  globalThis.fetch = previousFetch;
});

// Regra do regulamento, em centavos, escrita à parte das implementações.
const PACOTE = 310_000;
function esperado(quantidade, metodo, entradaPct) {
  const base = quantidade * PACOTE;
  if (metodo === 'pix') return { total: base, cartao: 0, entrada: 0 };
  if (metodo === 'credit_card') return { total: base * 1.1, cartao: base * 1.1, entrada: 0 };
  const entrada = base * entradaPct / 100;
  const cartao = (base - entrada) * 1.1;
  return { total: entrada + cartao, cartao, entrada };
}

const reais = (centavos) =>
  `R$ ${(centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function emailDoPedido(pedido) {
  const enviados = [];
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    if (String(url).endsWith('/smtp/email')) enviados.push(body);
    return new Response(JSON.stringify({}), { status: 201 });
  };
  let status = 0;
  const res = { status(s) { status = s; return this; }, json() { return this; } };
  await brevo({ method: 'POST', body: pedido }, res);
  assert.equal(status, 200);
  return {
    cliente: enviados.find((e) => e.to[0].email === pedido.email),
    hotel: enviados.find((e) => e.to[0].email !== pedido.email),
  };
}

const combinacoes = [];
for (const quantidade of [1, 2]) {
  combinacoes.push({ quantidade, metodo: 'pix' });
  for (const parcelas of [1, 6, 12]) {
    combinacoes.push({ quantidade, metodo: 'credit_card', parcelas });
    for (const entradaPct of [30, 50, 70]) {
      combinacoes.push({ quantidade, metodo: 'pix_credit_card', parcelas, entradaPct });
    }
  }
}

for (const c of combinacoes) {
  const nome = `${c.quantidade} pacote(s), ${c.metodo}` +
    (c.parcelas ? ` em ${c.parcelas}x` : '') + (c.entradaPct ? `, entrada ${c.entradaPct}%` : '');

  test(`mesmo valor no e-mail, no ERP e no regulamento — ${nome}`, async () => {
    const e = esperado(c.quantidade, c.metodo, c.entradaPct);
    const pedido = {
      email: 'cliente@example.test', firstName: 'Cliente', lastName: 'Teste', phone: '91999999999',
      cpf: '52998224725', quantity: c.quantidade, paymentMethod: c.metodo,
      // A tela manda as parcelas como texto ("12"), não número.
      installments: c.parcelas ? String(c.parcelas) : '1',
      splitPercent: c.entradaPct,
    };
    const { cliente, hotel } = await emailDoPedido(pedido);

    assert.equal(cliente.params.TOTAL_VALUE, reais(e.total), 'total no e-mail do cliente');
    assert.equal(hotel.params.TOTAL_AMOUNT, reais(e.total), 'total no aviso ao hotel');
    assert.equal(cliente.params.TOTAL_NIGHTS, String(c.quantidade * 6));

    if (c.metodo === 'credit_card') {
      assert.equal(cliente.params.INSTALLMENTS, `${c.parcelas}x de ${reais(e.cartao / c.parcelas)}`);
    }
    if (c.metodo === 'pix_credit_card') {
      assert.equal(cliente.params.INSTALLMENTS,
        `entrada ${reais(e.entrada)} no Pix + ${c.parcelas}x de ${reais(e.cartao / c.parcelas)} no cartão`);
    }

    // Critério do VEN-02: cartão nunca em e-mail.
    for (const email of [cliente, hotel]) {
      assert.doesNotMatch(JSON.stringify(email), /4111|123\b|cvv":\s*"\d/i);
    }

    if (erp) {
      assert.equal(erp.computeTotalAmountCents(c.quantidade, c.metodo, c.entradaPct), Math.round(e.total),
        'total gravado pelo ERP');
    }
  });
}

test('e-mail aponta para o regulamento que o cliente aceitou, não o de julho', async () => {
  const { cliente } = await emailDoPedido({
    email: 'cliente@example.test', firstName: 'C', lastName: 'T', quantity: 1, paymentMethod: 'pix',
  });
  assert.equal(cliente.params.REGULAMENTO_URL,
    'https://www.hotelsolar.tur.br/solarsemlimites2026/Regulamento_SSL.pdf');
  assert.doesNotMatch(JSON.stringify(cliente.params), /solar-sem-limites\.vercel\.app/);
});

test('ERP disponível para a comparação', { skip: erp ? false : 'repositório do ERP ausente' }, () => {
  assert.ok(erp);
});
