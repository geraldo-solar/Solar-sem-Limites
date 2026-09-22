import { expect, test, type Page } from '@playwright/test';

// VEN-02: homologação do checkout de novembro, preenchido como um cliente.
//
// O teste de contas (precos-do-checkout.test.mjs) prova que e-mail e ERP
// calculam igual ao regulamento. Este prova a outra metade: que a TELA mostra
// esse valor, e que o pedido enviado leva exatamente o que o cliente escolheu
// — quantidade, forma, parcelas e entrada —, com o cartão indo só para o
// cofre do ERP. Nenhum pedido sai daqui: ERP e Brevo são interceptados.
//
// O e-mail de confirmação sai do ERP ao gravar o pedido (pedidoRecebido.ts,
// testado lá). O navegador não chama o Brevo em caso nenhum: a rota que ele
// chamava mandava e-mail do hotel para qualquer endereço, e foi removida.

const CARTAO = '4111 1111 1111 1111'; // número de teste, válido no Luhn
const CPF = '529.982.247-25'; // CPF de teste, dígitos verificadores válidos

type Capturado = { erp: any[]; brevo: any[]; planilha: number };

async function abrirCheckout(page: Page, erpResponde = { status: 200, body: { success: true, id: 'x' } }) {
  const capturado: Capturado = { erp: [], brevo: [], planilha: 0 };
  await page.route('**/api/solar-status', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, aberto: true, abreEm: '2026-11-25T08:00:00-03:00',
      fechaEm: '2026-12-01T23:59:59-03:00', pacotesVendidos: 0 }),
  }));
  await page.route('**/api/solar-erp-sync', async (r) => {
    capturado.erp.push(r.request().postDataJSON());
    await r.fulfill({ status: erpResponde.status, contentType: 'application/json', body: JSON.stringify(erpResponde.body) });
  });
  await page.route('**/api/brevo', async (r) => {
    capturado.brevo.push(r.request().postDataJSON());
    await r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  await page.route('https://script.google.com/**', (r) => { capturado.planilha += 1; return r.abort(); });
  await page.route('https://viacep.com.br/**', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ logradouro: 'Av. Teste', localidade: 'Belém', uf: 'PA' }),
  }));
  await page.goto('/solarsemlimitescadastro/#/checkout', { waitUntil: 'networkidle' });
  return capturado;
}

const campo = (page: Page, rotulo: string) => page.locator(`label:has-text("${rotulo}") + input`).first();

async function preencherDados(page: Page, quantidade: 1 | 2) {
  await campo(page, 'Nome completo').fill('Cliente Homologação');
  await campo(page, 'CPF').fill(CPF);
  await page.getByPlaceholder('00000-000', { exact: true }).fill('66000000');
  await campo(page, 'Endereço').fill('Av. Teste, 100');
  await campo(page, 'Cidade').fill('Belém');
  await page.locator('label:has-text("UF") + select').selectOption('PA');
  await campo(page, 'Email').fill('homologacao@example.test');
  await page.getByPlaceholder('(00) 00000-0000').fill('91999999999');
  if (quantidade === 2) await page.getByRole('button', { name: /^2/ }).first().click();
}

async function preencherCartao(page: Page) {
  await page.getByPlaceholder('0000 0000 0000 0000').locator('visible=true').fill(CARTAO);
  await campo(page, 'Titular do cartão').fill('CLIENTE HOMOLOGACAO');
  await page.getByPlaceholder('MM').locator('visible=true').fill('12');
  await page.getByPlaceholder('AAAA').locator('visible=true').fill('2030');
  await page.getByPlaceholder('123').locator('visible=true').fill('123');
}

async function aceitarEEnviar(page: Page) {
  await page.locator('#terms').check();
  const enviar = page.locator('button[type="submit"]');
  await expect(enviar).toBeEnabled();
  await enviar.click();
}

const texto = async (page: Page) => (await page.locator('body').innerText()).replace(/\s+/g, ' ');

test('1 pacote no Pix: R$ 3.100,00 na tela e no pedido, sem cartão em lugar nenhum', async ({ page }) => {
  const c = await abrirCheckout(page);
  await preencherDados(page, 1);
  expect(await texto(page)).toContain('valor total de R$ 3.100,00');
  await aceitarEEnviar(page);
  await expect(page.getByText('Pré-reserva Garantida!')).toBeVisible();

  expect(c.erp).toHaveLength(1);
  expect(c.erp[0]).toMatchObject({ quantity: 1, paymentMethod: 'pix' });
  expect(c.brevo, 'confirmação sai do ERP, não do navegador').toHaveLength(0);
  expect(c.planilha, 'nada vai para a planilha antiga').toBe(0);
});

test('2 pacotes no cartão em 12x: R$ 6.820,00, parcela de R$ 568,33', async ({ page }) => {
  const c = await abrirCheckout(page);
  await preencherDados(page, 2);
  await page.getByText('Cartão de crédito', { exact: true }).click();
  const t = await texto(page);
  expect(t).toContain('valor total de R$ 6.820,00');
  expect(t).toContain('12x de R$ 568,33');
  await page.getByRole('button', { name: /^12x/ }).click();
  await preencherCartao(page);
  await aceitarEEnviar(page);
  await expect(page.getByText('Pré-reserva Garantida!')).toBeVisible();

  expect(c.erp[0]).toMatchObject({ quantity: 2, paymentMethod: 'credit_card', installments: '12' });
  // O cartão vai para o ERP, que o guarda cifrado; nunca para o e-mail.
  expect(c.erp[0].cardCvv).toBe('123');
  expect(c.brevo).toHaveLength(0);
  expect(c.planilha).toBe(0);
});

test('2 pacotes, entrada de 50% no Pix + 6x: R$ 3.100,00 + R$ 3.410,00 = R$ 6.510,00', async ({ page }) => {
  const c = await abrirCheckout(page);
  await preencherDados(page, 2);
  await page.getByText('Dividir Pagamento (Entrada no Pix + Restante no Cartão)').click();
  await page.getByRole('button', { name: /^50%/ }).click();
  const t = await texto(page);
  expect(t).toContain('Entrada no Pix (agora) R$ 3.100,00');
  expect(t).toContain('Restante no cartão (+10% taxa da operadora) R$ 3.410,00');
  expect(t).toContain('Total R$ 6.510,00');
  await page.getByRole('button', { name: /^6x/ }).click();
  await preencherCartao(page);
  await aceitarEEnviar(page);
  await expect(page.getByText('Pré-reserva Garantida!')).toBeVisible();

  expect(c.erp[0]).toMatchObject({
    quantity: 2, paymentMethod: 'pix_credit_card', splitPercent: 50, installments: '6',
  });
  expect(c.brevo).toHaveLength(0);
});

test('ERP fora do ar: cliente é avisado e nenhum e-mail de confirmação sai', async ({ page }) => {
  // Confirmar por e-mail um pedido que não entrou no ERP é prometer algo que
  // ninguém no hotel vai ver.
  const c = await abrirCheckout(page, { status: 502, body: { success: false } });
  const alertas: string[] = [];
  page.on('dialog', (d) => { alertas.push(d.message()); void d.dismiss(); });
  await preencherDados(page, 1);
  await aceitarEEnviar(page);
  await expect.poll(() => alertas.length).toBe(1);
  expect(alertas[0]).toMatch(/problema de conexão/i);
  expect(c.brevo).toHaveLength(0);
  await expect(page.getByText('Pré-reserva Garantida!')).toHaveCount(0);
});

test('carrinho fechou com a aba aberta: mensagem de encerramento, sem "tente de novo"', async ({ page }) => {
  const c = await abrirCheckout(page, {
    status: 409,
    body: { success: false, error: { carrinhoFechado: true, error: 'As vendas foram encerradas em 01/12.' } },
  });
  await preencherDados(page, 1);
  await aceitarEEnviar(page);
  await expect(page.getByText('Vendas encerradas')).toBeVisible();
  await expect(page.getByText('As vendas foram encerradas em 01/12.')).toBeVisible();
  expect(c.brevo).toHaveLength(0);
});

test('sem aceitar o regulamento, o botão não envia', async ({ page }) => {
  const c = await abrirCheckout(page);
  await preencherDados(page, 1);
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
  expect(c.erp).toHaveLength(0);
});
