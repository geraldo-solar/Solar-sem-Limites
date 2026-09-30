import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const previousWindow = globalThis.window;
after(() => {
  if (previousWindow === undefined) delete globalThis.window;
  else globalThis.window = previousWindow;
});

async function carregar(dev) {
  const { outputFiles } = await build({
    stdin: {
      contents: `
        import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import VendasNovembro from './VendasNovembro';
        import CheckoutPage from './CheckoutPage';
        import PagamentoConcluido from './PagamentoConcluido';
        import { CheckoutForm } from './Checkout-Solar-sem-Limites/components/CheckoutForm';
        export * from './testeManualCheckout';
        export const renderSales = () => renderToStaticMarkup(React.createElement(VendasNovembro));
        export const renderCheckout = () => renderToStaticMarkup(React.createElement(CheckoutPage));
        export const renderPaymentReturn = () => renderToStaticMarkup(React.createElement(PagamentoConcluido));
        export const renderForm = (quantidadeInicial, modoTeste) => renderToStaticMarkup(
          React.createElement(CheckoutForm, { quantidadeInicial, modoTeste, cartaoPelaCielo: true, isLoading: false, onSubmit: async () => {} })
        );
      `,
      resolveDir: fileURLToPath(new URL('../', import.meta.url)),
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    banner: {
      js: `import { createRequire } from 'node:module'; const require = createRequire(${JSON.stringify(fileURLToPath(new URL('../package.json', import.meta.url)))});`,
    },
    define: {
      'import.meta.env.BASE_URL': '"/"',
      'import.meta.env.DEV': String(dev),
      'process.env.NODE_ENV': '"production"',
    },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
}

const [local, producao] = await Promise.all([carregar(true), carregar(false)]);
const simularLocal = () => {
  globalThis.window = { location: { hostname: '127.0.0.1', search: '?teste_checkout=1' } };
};

test('nome comercial 2027 acompanha vendas, checkout e retorno sem alterar a campanha de 2026', () => {
  simularLocal();
  for (const html of [local.renderSales(), local.renderCheckout(), local.renderPaymentReturn(), producao.renderSales()]) {
    assert.match(html, /Solar Sem Limites 2027/);
    assert.doesNotMatch(html, /Solar Sem Limites 2026|Solar Sem Limites VIP/);
  }
  const vendas = readFileSync(new URL('../VendasNovembro.tsx', import.meta.url), 'utf8');
  const checkout = readFileSync(new URL('../CheckoutPage.tsx', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
  assert.match(vendas, /2026-11-25T08:00:00-03:00/);
  assert.match(vendas, /2026-12-01T23:59:59-03:00/);
  assert.match(checkout, /sendOrderToErp\(order, 'ssl26_novembro_2026'/);
  assert.match(app, /pathname === '\/solarsemlimites2026'/);
});

test('modo de teste exige desenvolvimento, endereço local e opção explícita', () => {
  const { permiteTesteManual } = local;
  for (const hostname of ['localhost', '127.0.0.1', '[::1]']) {
    assert.equal(permiteTesteManual(true, hostname, '?teste_checkout=1'), true);
    assert.equal(permiteTesteManual(false, hostname, '?teste_checkout=1'), false);
  }
  for (const hostname of ['www.hotelsolar.tur.br', 'localhost.example.test', '192.168.1.10']) {
    assert.equal(permiteTesteManual(true, hostname, '?teste_checkout=1'), false);
  }
  for (const search of ['', '?teste_checkout=0', '?teste_checkout=true']) {
    assert.equal(permiteTesteManual(true, 'localhost', search), false);
  }
});

test('compilação de produção ignora a opção de teste, mesmo em localhost', () => {
  simularLocal();
  assert.equal(local.testeManualCheckoutAtivo(), true);
  assert.equal(producao.testeManualCheckoutAtivo(), false);
  assert.doesNotMatch(producao.renderSales(), /href="#\/checkout/);
  assert.doesNotMatch(producao.renderCheckout(), /Teste local do checkout/);
});

test('modo real local é distinto da simulação e não libera compilação de produção', () => {
  simularLocal();
  assert.equal(local.testeRealCheckoutAtivo(), false);
  globalThis.window.location.search = '?teste_checkout=real';
  assert.equal(local.testeManualCheckoutAtivo(), false);
  assert.equal(local.testeRealCheckoutAtivo(), true);
  assert.equal(producao.testeRealCheckoutAtivo(), false);
  const html = local.renderSales();
  assert.match(html, /pedido, e-mails e pagamento ativos/);
  assert.match(html, /href="#\/checkout\?pacotes=2"/);
  assert.doesNotMatch(producao.renderSales(), /href="#\/checkout/);
  assert.match(local.renderCheckout(), /Teste real — finalizar cria pedido e envia e-mails/);
  assert.doesNotMatch(local.renderCheckout(), /CONFERIR TESTE — SEM COMPRA/);
});

test('CTAs da prévia abrem checkout com quantidades distintas e aviso de simulação', () => {
  simularLocal();
  const html = local.renderSales();
  assert.match(html, /Modo de teste local/);
  assert.match(html, /href="#\/checkout\?pacotes=1"/);
  assert.match(html, /href="#\/checkout\?pacotes=2"/);
  assert.match(html, /href="#\/checkout"/);
  assert.match(html, /href="#opcoes"/);
});

test('links selecionam apenas 1 ou 2 pacotes; valores inválidos voltam a 1', () => {
  assert.equal(local.quantidadeDoLinkCheckout('#/checkout?pacotes=2'), 2);
  for (const hash of ['#/checkout', '#/checkout?pacotes=1', '#/checkout?pacotes=-1', '#/checkout?pacotes=2x', '#/checkout?pacotes=999']) {
    assert.equal(local.quantidadeDoLinkCheckout(hash), 1);
  }
  const um = local.renderForm(1, true);
  const dois = local.renderForm(2, true);
  assert.match(um, /3\.100,00/);
  assert.match(dois, /6\.200,00/);
});

test('formulário de teste mantém validação e não oferece dados bancários ou aceite de compra', () => {
  const html = local.renderForm(2, true);
  assert.match(html, /CONFERIR TESTE — SEM COMPRA/);
  assert.match(html, /<button[^>]*type="submit"[^>]*disabled/);
  assert.match(html, /apenas para esta simulação, sem realizar compra/);
  assert.doesNotMatch(html, /Coordenadas bancárias:|Conta Corrente:|Chave:|CONCLUIR COMPRA/);
  const real = local.renderForm(1, false);
  assert.match(real, /CONCLUIR COMPRA/);
  assert.match(real, /Coordenadas bancárias:/);
});

test('simulação retorna antes do envio real; fluxo normal ainda chama seu envio uma vez', async () => {
  let simulacoes = 0;
  let envios = 0;
  const simular = () => { simulacoes++; return 'teste'; };
  const enviar = async () => { envios++; return 'real'; };
  assert.equal(await local.executarCheckoutComTeste(true, simular, enviar), 'teste');
  assert.equal(simulacoes, 1);
  assert.equal(envios, 0);
  assert.equal(await local.executarCheckoutComTeste(false, simular, enviar), 'real');
  assert.equal(simulacoes, 1);
  assert.equal(envios, 1);
});
