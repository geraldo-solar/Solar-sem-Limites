import { expect, test, type Page } from '@playwright/test';

// VEN-02: homologação do checkout de novembro, preenchido como um cliente.
//
// O teste de contas (precos-do-checkout.test.mjs) prova que e-mail e ERP
// calculam igual ao regulamento. Este prova a outra metade: que a TELA mostra
// esse valor, e que o pedido enviado leva exatamente o que o cliente escolheu
// — quantidade, forma e entrada —, com o cartão digitado só na Cielo.
// Nenhum pedido sai daqui: ERP, Cielo e Brevo são interceptados.
//
// O e-mail de confirmação sai do ERP ao gravar o pedido (pedidoRecebido.ts,
// testado lá). O navegador não chama o Brevo em caso nenhum: a rota que ele
// chamava mandava e-mail do hotel para qualquer endereço, e foi removida.

const CPF = '529.982.247-25'; // CPF de teste, dígitos verificadores válidos

type Capturado = { erp: any[]; brevo: any[]; planilha: number };

// Only public CSS/fonts may load externally. All business/analytics services
// are blocked or mocked: no real payment, message or analytics event.
test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    const publicStyle = route.request().method() === 'GET' && url.protocol === 'https:'
      && ['cdn.tailwindcss.com', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname);
    return url.hostname === '127.0.0.1' || publicStyle ? route.continue() : route.abort();
  });
});

async function abrirCheckout(
  page: Page,
  erpResponde: { status: number; body: Record<string, unknown> } = { status: 200, body: { success: true, id: 'x' } },
  cartaoPelaCielo = false,
) {
  const capturado: Capturado = { erp: [], brevo: [], planilha: 0 };
  await page.route('**/api/solar-status', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, aberto: true, abreEm: '2026-11-25T08:00:00-03:00',
      fechaEm: '2026-12-01T23:59:59-03:00', pacotesVendidos: 0, cartaoPelaCielo }),
  }));
  await page.route('**/api/ssl26-checkout', async (r) => {
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

test('2 pacotes no cartão: R$ 6.820,00 e referência de 12x, sem coletar o cartão no hotel', async ({ page }) => {
  const c = await abrirCheckout(page);
  await preencherDados(page, 2);
  await page.getByText('Cartão de crédito', { exact: true }).click();
  const t = await texto(page);
  expect(t).toContain('valor total de R$ 6.820,00');
  expect(t).toContain('12x de R$ 568,33');
  await aceitarEEnviar(page);
  await expect(page.getByText('Não conseguimos abrir a página de pagamento')).toBeVisible();

  expect(c.erp[0]).toMatchObject({ quantity: 2, paymentMethod: 'credit_card', cartaoNaCielo: true });
  expect(JSON.stringify(c.erp[0])).not.toMatch(/cardNumber|cardCvv|cardHolder|installments/);
  expect(c.brevo).toHaveLength(0);
  expect(c.planilha).toBe(0);
});

test('2 pacotes, entrada de 50% no Pix + cartão: R$ 3.100,00 + R$ 3.410,00 = R$ 6.510,00', async ({ page }) => {
  const c = await abrirCheckout(page);
  await preencherDados(page, 2);
  await page.getByText('Dividir Pagamento (Entrada no Pix + Restante no Cartão)').click();
  await page.getByRole('button', { name: /^50%/ }).click();
  const t = await texto(page);
  expect(t).toContain('Entrada no Pix (agora) R$ 3.100,00');
  expect(t).toContain('Restante no cartão (+10% taxa da operadora) R$ 3.410,00');
  expect(t).toContain('Total R$ 6.510,00');
  await aceitarEEnviar(page);
  await expect(page.getByText('Pré-reserva Garantida!')).toBeVisible();

  expect(c.erp[0]).toMatchObject({
    quantity: 2, paymentMethod: 'pix_credit_card', splitPercent: 50, cartaoNaCielo: true,
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

// ---- Cartão pela página da Cielo (quando o ERP diz que a Cielo está ativa) ----

const CIELO = 'https://cieloecommerce.cielo.com.br/transacional/order/index?id=teste123';

test('Cielo: cartão não é pedido no site e o cliente vai para a página da Cielo', async ({ page }) => {
  const c = await abrirCheckout(page, { status: 200, body: { success: true, id: 'x', checkoutUrl: CIELO } }, true);
  let chegouNaCielo = '';
  await page.route('https://cieloecommerce.cielo.com.br/**', (r) => {
    chegouNaCielo = r.request().url();
    return r.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Cielo (simulada)</h1>' });
  });
  await preencherDados(page, 2);
  await page.getByText('Cartão de crédito', { exact: true }).click();
  await expect(page.getByPlaceholder('0000 0000 0000 0000')).toHaveCount(0);
  const t = await texto(page);
  expect(t).toContain('Pagamento na página segura da Cielo');
  expect(t).toContain('R$ 6.820,00');
  expect(t).toContain('12x de R$ 568,33');
  await aceitarEEnviar(page);
  await expect(page.getByText('Cielo (simulada)')).toBeVisible();
  expect(chegouNaCielo).toBe(CIELO);

  expect(c.erp[0]).toMatchObject({ quantity: 2, paymentMethod: 'credit_card', cartaoNaCielo: true });
  expect(JSON.stringify(c.erp[0])).not.toMatch(/cardNumber|cardCvv|cardHolder/);
});

test('Cielo: Pix + cartão mostra o Pix da entrada e o botão da Cielo', async ({ page }) => {
  const c = await abrirCheckout(page, { status: 200, body: { success: true, id: 'x', checkoutUrl: CIELO } }, true);
  await preencherDados(page, 2);
  await page.getByText('Dividir Pagamento (Entrada no Pix + Restante no Cartão)').click();
  await page.getByRole('button', { name: /^50%/ }).click();
  await expect(page.getByPlaceholder('0000 0000 0000 0000')).toHaveCount(0);
  await aceitarEEnviar(page);
  await expect(page.getByText('Pré-reserva Garantida!')).toBeVisible();
  const t = await texto(page);
  expect(t).toContain('Pague a entrada de R$ 3.100,00 no Pix');
  expect(t).toContain('Pague o restante de R$ 3.410,00 no cartão');
  await expect(page.getByRole('link', { name: 'Pagar no cartão pela Cielo' })).toHaveAttribute('href', CIELO);
  expect(c.erp[0]).toMatchObject({ paymentMethod: 'pix_credit_card', splitPercent: 50, cartaoNaCielo: true });
});

test('Cielo fora do ar: pedido guardado, e tentar de novo manda o MESMO pedido', async ({ page }) => {
  const c = await abrirCheckout(page, { status: 200, body: { success: true, id: 'x', pagamentoIndisponivel: true } }, true);
  await preencherDados(page, 1);
  await page.getByText('Cartão de crédito', { exact: true }).click();
  await aceitarEEnviar(page);
  await expect(page.getByText('Não conseguimos abrir a página de pagamento')).toBeVisible();
  await page.getByRole('button', { name: 'Tentar abrir o pagamento' }).click();
  await expect.poll(() => c.erp.length).toBe(2);
  expect(c.erp[1].id).toBe(c.erp[0].id);
});

test('endereço de pagamento fora da Cielo é ignorado: o cliente não é levado para lá', async ({ page }) => {
  await abrirCheckout(page, { status: 200, body: { success: true, id: 'x', checkoutUrl: 'https://golpe.example/pagar' } }, true);
  await preencherDados(page, 1);
  await page.getByText('Cartão de crédito', { exact: true }).click();
  await aceitarEEnviar(page);
  await expect(page.getByText('Não conseguimos abrir a página de pagamento')).toBeVisible();
  expect(page.url()).not.toContain('golpe.example');
});

test('erro de conexão e nova tentativa não criam um segundo pedido', async ({ page }) => {
  // Antes, cada clique em concluir gerava um número novo: quem tentava de
  // novo depois de um erro virava dois pedidos no ERP.
  let chamadas = 0;
  const c = await abrirCheckout(page);
  await page.unroute('**/api/ssl26-checkout');
  await page.route('**/api/ssl26-checkout', async (r) => {
    chamadas += 1;
    c.erp.push(r.request().postDataJSON());
    await r.fulfill(chamadas === 1
      ? { status: 502, contentType: 'application/json', body: '{"success":false}' }
      : { status: 200, contentType: 'application/json', body: '{"success":true,"id":"x"}' });
  });
  page.on('dialog', (d) => void d.dismiss());
  await preencherDados(page, 1);
  await aceitarEEnviar(page);
  await expect.poll(() => chamadas).toBe(1);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText('Pré-reserva Garantida!')).toBeVisible();
  expect(c.erp[1].id).toBe(c.erp[0].id);
});

test('Cielo desligada no ERP: novembro nunca volta a coletar cartão ou CVV no hotel', async ({ page }) => {
  const c = await abrirCheckout(page, {status:503, body:{success:false}}, false);
  page.on('dialog', d => void d.dismiss());
  await preencherDados(page, 1);
  await page.getByText('Cartão de crédito', { exact: true }).click();
  await expect(page.getByPlaceholder('0000 0000 0000 0000')).toHaveCount(0);
  expect(await texto(page)).toContain('página segura da Cielo');
  await aceitarEEnviar(page);
  await expect.poll(() => c.erp.length).toBe(1);
  expect(c.erp[0].cartaoNaCielo).toBe(true);
  expect(JSON.stringify(c.erp[0])).not.toMatch(/cardNumber|cardCvv|cardHolder/);
  await expect(page.getByText('Pré-reserva Garantida!')).toHaveCount(0);
});

test('mudar a quantidade após uma falha cria outro ID sem reescrever a origem do primeiro pedido', async ({ page }) => {
  const c = await abrirCheckout(page, {status:503, body:{success:false}});
  page.on('dialog', d => void d.dismiss());
  await preencherDados(page, 1);
  await aceitarEEnviar(page);
  await expect.poll(() => c.erp.length).toBe(1);
  await page.getByRole('button', { name: /^2/ }).first().click();
  await page.locator('button[type="submit"]').click();
  await expect.poll(() => c.erp.length).toBe(2);
  expect(c.erp[1].id).not.toBe(c.erp[0].id);
  expect(c.erp.map(p => p.quantity)).toEqual([1,2]);
});
