import { devices, expect, test } from '@playwright/test';

// A página de vendas oferece compra quando o servidor confirma e o encerramento
// anunciado ainda não passou. Desde 06/10/2026 não há mais trava antes de
// 25/11: o botão fica ativo para testes e venda antecipada, e a página não
// anuncia data de abertura.
//
// O relógio do visitante é ajustável, então ele só pode SEGURAR a oferta
// depois do fechamento, nunca liberá-la. Adiantar o relógio não abre o carrinho.

const ABERTURA = '2026-11-25T08:00:00-03:00';
const FECHAMENTO = '2026-12-01T23:59:59-03:00';

function respostaDoErp(aberto: boolean) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      aberto,
      abreEm: ABERTURA,
      fechaEm: FECHAMENTO,
      pacotesVendidos: 64,
    }),
  };
}

const cenarios: Array<{ nome: string; quando: string; erpAberto: boolean; vende: boolean }> = [
  { nome: 'antes de 25/11, com o ERP aberto', quando: '2026-10-06T12:00:00-03:00', erpAberto: true, vende: true },
  { nome: 'véspera, com o ERP aberto', quando: '2026-11-24T20:00:00-03:00', erpAberto: true, vende: true },
  { nome: 'antes de 25/11, mas o ERP recusou', quando: '2026-10-06T12:00:00-03:00', erpAberto: false, vende: false },
  { nome: 'logo após abrir', quando: '2026-11-25T08:05:00-03:00', erpAberto: true, vende: true },
  { nome: 'no meio da janela', quando: '2026-11-28T12:00:00-03:00', erpAberto: true, vende: true },
  { nome: 'último minuto', quando: '2026-12-01T23:50:00-03:00', erpAberto: true, vende: true },
  { nome: 'depois do fechamento', quando: '2026-12-02T10:00:00-03:00', erpAberto: false, vende: false },
  { nome: 'dentro da janela, mas o ERP recusou', quando: '2026-11-28T12:00:00-03:00', erpAberto: false, vende: false },
];

for (const cenario of cenarios) {
  test(`oferta de compra — ${cenario.nome}`, async ({ browser }) => {
    const contexto = await browser.newContext({ ...devices['iPhone 13'] });
    await contexto.route('**/api/solar-status', (rota) => rota.fulfill(respostaDoErp(cenario.erpAberto)));
    await contexto.clock.install({ time: new Date(cenario.quando) });

    const pagina = await contexto.newPage();
    await pagina.goto('/solarsemlimitescadastro/#/vendas', { waitUntil: 'networkidle' });
    await pagina.waitForTimeout(600);

    const botoes = pagina.locator('a[href^="#/checkout"]');
    if (cenario.vende) {
      expect(await botoes.count()).toBeGreaterThan(0);
    } else {
      await expect(botoes).toHaveCount(0);
    }

    // A página nunca promete vaga restante: as 200 unidades são comunicação,
    // não limite, e o criativo A7 proíbe promessa de esgotamento.
    const texto = await pagina.locator('body').innerText();
    expect(texto).not.toMatch(/vagas restantes|últimas vagas|esgotad/i);

    // A página não anuncia mais data de abertura, em nenhum cenário.
    expect(texto).not.toMatch(/abrem em|abertura em/i);

    await contexto.close();
  });
}
