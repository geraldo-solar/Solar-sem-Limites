import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// Checkout e retorno do pagamento renderizados de verdade, sem navegador nem
// rede: os dois caminhos de contato precisam aparecer com os números certos.
const { outputFiles } = await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import CheckoutPage from './CheckoutPage';
      import PagamentoConcluido from './PagamentoConcluido';
      import { CheckoutForm } from './Checkout-Solar-sem-Limites/components/CheckoutForm';
      export const renderCheckout = () => renderToStaticMarkup(React.createElement(CheckoutPage));
      export const renderRetorno = () => renderToStaticMarkup(React.createElement(PagamentoConcluido));
      export const renderForm = () => renderToStaticMarkup(
        React.createElement(CheckoutForm, { quantidadeInicial: 1, modoTeste: false, cartaoPelaCielo: true, isLoading: false, onSubmit: async () => {} })
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
    'import.meta.env.DEV': 'false',
    'process.env.NODE_ENV': '"production"',
  },
});
const { renderCheckout, renderRetorno, renderForm } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);

function contatos(html) {
  const whatsapp = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map(([, href]) => new URL(href.replaceAll('&amp;', '&')));
  const ligacoes = [...html.matchAll(/href="(tel:[^"]+)"/g)].map(([, href]) => href);
  return { whatsapp, ligacoes };
}

test('checkout: ajuda para finalizar pelo WhatsApp do ManyChat e por ligação', () => {
  const html = renderCheckout();
  const { whatsapp, ligacoes } = contatos(html);
  assert.equal(whatsapp.length, 1);
  assert.equal(whatsapp[0].pathname, '/5591981229825');
  assert.equal(whatsapp[0].searchParams.get('text'), 'Olá! Estou finalizando a compra do Solar Sem Limites 2027 e tenho uma dúvida.');
  assert.deepEqual(ligacoes, ['tel:+5591981000800']);
  assert.match(html, /Precisa de ajuda para finalizar\?/);
  assert.match(html, /WhatsApp \(91\) 98122-9825/);
  assert.match(html, /Ligar \(91\) 98100-0800/);
});

test('retorno do pagamento: os dois contatos, com a mensagem sobre pagamento', () => {
  const html = renderRetorno();
  const { whatsapp, ligacoes } = contatos(html);
  assert.equal(whatsapp.length, 1);
  assert.equal(whatsapp[0].pathname, '/5591981229825');
  assert.equal(whatsapp[0].searchParams.get('text'), 'Olá! Tenho uma dúvida sobre o pagamento do Solar Sem Limites 2027.');
  assert.deepEqual(ligacoes, ['tel:+5591981000800']);
  assert.match(html, /reserva@hotelsolar\.tur\.br/);
  // O número antigo não aparece mais como WhatsApp de dúvidas nesta tela.
  assert.doesNotMatch(html, /WhatsApp \(91\) 98100-0800/);
});

test('o número do ManyChat nunca vira link de ligação; o regulamento aceito segue igual', () => {
  for (const html of [renderCheckout(), renderRetorno()]) assert.doesNotMatch(html, /tel:\+5591981229825/);
  assert.match(renderForm(), /WhatsApp \(91 98100-0800\)/);
});
