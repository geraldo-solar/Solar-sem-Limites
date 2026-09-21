import { test, expect, type Page } from '@playwright/test';

async function fillLead(page: Page) {
  await page.getByLabel('Primeiro nome', { exact: true }).fill('Teste');
  await page.getByLabel('WhatsApp', { exact: true }).fill('91999990000');
  await page.getByLabel('E-mail', { exact: true }).fill('teste@example.test');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Quero receber o guia gratuito' }).click();
}

test('form, download, channel and profile work without live provider writes', async ({ page }, testInfo) => {
  const requests: Record<string, unknown>[] = [];
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/**', async route => {
    expect(new URL(route.request().url()).hostname).toBe('127.0.0.1');
    const body = route.request().postDataJSON();
    requests.push(body);
    if (body.action === 'profile') expect(body.profileToken).toBe('mock-receipt');
    await route.fulfill({ json: { success: true, emailDelivery: 'accepted', profileToken: 'mock-receipt' } });
  });
  await page.goto('/solarsemlimitescadastro/?utm_source=qa&utm_campaign=ssl26_novembro_2026&ref=test');
  await expect(page.getByLabel('Primeiro nome', { exact: true })).toBeVisible();
  await fillLead(page);
  await expect(page.getByText('Cadastro concluído', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Baixar o guia agora' })).toHaveAttribute('href', '/solarsemlimitescadastro/guia-salinas-em-familia.pdf');
  await expect(page.getByRole('link', { name: 'Entrar no Canal VIP do WhatsApp' })).toHaveAttribute('href', 'https://whatsapp.com/channel/0029Vb8iEz73gvWjJea5rt3k');
  expect(requests[0].utmSource).toBe('qa');
  expect(requests[0].referral).toBe('test');
  await page.getByRole('button', { name: /Ainda não conheço o hotel/ }).click();
  await expect(page.getByText('Obrigado por contar para nós.')).toBeVisible();
  expect(requests[1].profile).toBe('nao_conhece');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  expect(errors).toEqual([]);
  await page.locator('#cadastro-concluido').screenshot({ path: testInfo.outputPath('capture-success.png') });
});

test('email fallback and retryable profile error stay honest', async ({ page }) => {
  let profileAttempts = 0;
  await page.route('**/api/**', async route => {
    const body = route.request().postDataJSON();
    if (body.action === 'profile' && ++profileAttempts === 1) {
      await route.fulfill({ status: 502, json: { error: 'Simulated outage' } });
      return;
    }
    await route.fulfill({ json: { success: true, emailDelivery: 'failed', profileToken: 'mock-receipt' } });
  });
  await page.goto('/solarsemlimitescadastro/');
  await fillLead(page);
  await expect(page.getByText(/Não conseguimos enviar o e-mail agora/)).toBeVisible();
  await page.getByRole('button', { name: /Já me hospedei no Hotel Solar/ }).click();
  await expect(page.getByRole('alert')).toContainText('Não conseguimos salvar sua resposta');
  await expect(page.getByText('Obrigado por contar para nós.')).not.toBeVisible();
  await expect(page.getByRole('link', { name: 'Baixar o guia agora' })).toBeVisible();
  await page.getByRole('button', { name: /Já me hospedei no Hotel Solar/ }).click();
  await expect(page.getByText('Obrigado por contar para nós.')).toBeVisible();
});

test('failed registration preserves entered data and offers retry', async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 502, json: { error: 'Tente novamente em instantes.' } }));
  await page.goto('/solarsemlimitescadastro/');
  await fillLead(page);
  await expect(page.getByRole('alert')).toHaveText('Tente novamente em instantes.');
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('teste@example.test');
  await expect(page.getByRole('button', { name: 'Quero receber o guia gratuito' })).toBeEnabled();
  await expect(page.getByText('Cadastro concluído', { exact: true })).not.toBeVisible();
});

test('withdrawal keeps guide access without claiming email delivery', async ({ page }, testInfo) => {
  await page.route('**/api/**', route => route.fulfill({ json: { success: true, emailDelivery: 'suppressed', profileToken: 'mock-receipt' } }));
  await page.goto('/solarsemlimitescadastro/');
  await fillLead(page);
  await expect(page.getByText(/Respeitamos sua preferência de não receber/)).toBeVisible();
  await expect(page.getByText(/O envio por e-mail foi solicitado/)).not.toBeVisible();
  await expect(page.getByRole('link', { name: 'Baixar o guia agora' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.locator('#cadastro-concluido').screenshot({ path: testInfo.outputPath('capture-suppressed.png') });
});
