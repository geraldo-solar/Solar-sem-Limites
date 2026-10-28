import { expect, test } from '@playwright/test';

// Página da Lista VIP (/vip), endereço do link pessoal de indicação. Até 25/11
// às 8h (hora do servidor) mostra a entrada na lista; depois, leva à página de
// vendas com o mesmo ?ref=. Localmente a página roda em #/vip.

const LINK = 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A';

async function servidorEm(page, quando: string) {
  await page.route('**/api/solar-status', (rota) => rota.fulfill({
    status: 200, contentType: 'application/json',
    headers: { date: new Date(quando).toUTCString() },
    body: JSON.stringify({ success: true, aberto: true }),
  }));
}

test('antes da abertura: convite aparece, cadastro leva o convite e mostra o link pessoal', async ({ page }) => {
  await servidorEm(page, '2026-10-20T12:00:00-03:00');
  let pedido: Record<string, unknown> | null = null;
  await page.route('**/api/lista-vip', async (rota) => {
    pedido = rota.request().postDataJSON();
    await rota.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, link: LINK, codigo: 'K7M2QX9A', emailDelivery: 'accepted' }) });
  });
  await page.goto('/solarsemlimitescadastro/#/vip?ref=abc12345');

  await expect(page.getByRole('heading', { name: 'Lista VIP Solar Sem Limites 2027' })).toBeVisible();
  await expect(page.getByText('Você recebeu um convite para a Lista VIP')).toBeVisible();
  await expect(page).toHaveTitle('Lista VIP Solar Sem Limites 2027 | Hotel Solar');
  const entrarPeloWhatsApp = page.getByRole('link', { name: 'Prefiro entrar pelo WhatsApp' });
  await expect(entrarPeloWhatsApp).toHaveAttribute('href', /wa\.me\/5591981229825\?text=.*convite%20ABC12345/);

  await page.getByLabel('Nome', { exact: true }).fill('Bia Souza');
  await page.getByLabel('WhatsApp', { exact: true }).fill('91981110002');
  await page.getByLabel('E-mail', { exact: true }).fill('bia@example.test');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Entrar na Lista VIP' }).click();

  await expect(page.getByText('Pronto, Bia!')).toBeVisible();
  await expect(page.getByText(LINK)).toBeVisible();
  await expect(page.getByText(/até 01\/12/).first()).toBeVisible();
  expect(pedido).toMatchObject({ nome: 'Bia Souza', telefone: '(91) 98111-0002', email: 'bia@example.test', consent: true, convite: 'ABC12345' });
  const compartilhar = page.getByRole('link', { name: 'Compartilhar' });
  await expect(compartilhar).toHaveAttribute('href', new RegExp(`wa\\.me/\\?text=.*${encodeURIComponent(LINK).replace(/[.?]/g, '\\$&')}`));
});

test('sem consentimento nao envia; erro do servidor mantem o formulario preenchido', async ({ page }) => {
  await servidorEm(page, '2026-10-20T12:00:00-03:00');
  let enviados = 0;
  await page.route('**/api/lista-vip', async (rota) => {
    enviados += 1;
    await rota.fulfill({ status: 503, contentType: 'application/json',
      body: JSON.stringify({ error: 'Não conseguimos concluir agora. Tente novamente em instantes.' }) });
  });
  await page.goto('/solarsemlimitescadastro/#/vip');
  await expect(page.getByText('Você recebeu um convite para a Lista VIP')).toHaveCount(0);
  await page.getByLabel('Nome', { exact: true }).fill('Caio');
  await page.getByLabel('WhatsApp', { exact: true }).fill('91981110003');
  await page.getByLabel('E-mail', { exact: true }).fill('caio@example.test');
  await page.getByRole('button', { name: 'Entrar na Lista VIP' }).click();
  expect(enviados).toBe(0);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Entrar na Lista VIP' }).click();
  await expect(page.getByRole('alert')).toContainText('Tente novamente');
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('caio@example.test');
});

test('a partir de 25/11 as 8h, pela hora do servidor, o link leva a pagina de vendas com o convite', async ({ page }) => {
  await servidorEm(page, '2026-11-25T08:00:00-03:00');
  await page.route('**/solarsemlimites2027**', (rota) => rota.fulfill({ status: 200, contentType: 'text/html', body: '<h1>vendas</h1>' }));
  await page.goto('/solarsemlimitescadastro/#/vip?ref=abc12345');
  await page.waitForURL('**/solarsemlimites2027?ref=ABC12345');
});

test('relogio do celular adiantado nao troca o destino: vale a hora do servidor', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-12-01T12:00:00-03:00') });
  await servidorEm(page, '2026-10-20T12:00:00-03:00');
  await page.goto('/solarsemlimitescadastro/#/vip?ref=abc12345');
  await expect(page.getByRole('button', { name: 'Entrar na Lista VIP' })).toBeVisible();
});

test('WhatsApp digitado com o 55 na frente chega inteiro (28/10/2026)', async ({ page }) => {
  await servidorEm(page, '2026-10-28T09:00:00-03:00');
  await page.goto('/solarsemlimitescadastro/#/vip');
  const campo = page.getByLabel('WhatsApp', { exact: true });
  await campo.pressSequentially('55 91 98111-0004');
  await expect(campo).toHaveValue('(91) 98111-0004');
  await campo.fill('');
  await campo.pressSequentially('+55 (91) 98111-0005');
  await expect(campo).toHaveValue('(91) 98111-0005');
});

test('quem chega por anuncio ou e-mail leva a origem na mensagem pronta do WhatsApp (28/10/2026)', async ({ page }) => {
  await servidorEm(page, '2026-10-28T13:00:00-03:00');
  await page.goto('/solarsemlimitescadastro/#/vip?ref=abc12345&utm_source=meta&utm_medium=paid&utm_campaign=ssl27_fase1_listavip');
  const botao = page.getByRole('link', { name: 'Prefiro entrar pelo WhatsApp' });
  await expect(botao).toHaveAttribute('href', new RegExp(`text=${encodeURIComponent('Quero entrar na Lista VIP Solar Sem Limites 2027 (vim pelo anúncio) (convite ABC12345)').replace(/[()]/g, '\\$&')}`));
  const novaVisita = async (url: string) => {
    await page.goto(url);
    await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch { /* sem armazenamento */ } });
    await page.reload();
  };
  await novaVisita('/solarsemlimitescadastro/#/vip?utm_source=brevo&utm_medium=email');
  await expect(page.getByRole('link', { name: 'Prefiro entrar pelo WhatsApp' })).toHaveAttribute('href', /\(vim%20pelo%20e-mail\)/);
  await novaVisita('/solarsemlimitescadastro/#/vip');
  await expect(page.getByRole('link', { name: 'Prefiro entrar pelo WhatsApp' })).toHaveAttribute('href', /text=Quero%20entrar%20na%20Lista%20VIP%20Solar%20Sem%20Limites%202027$/);
});
