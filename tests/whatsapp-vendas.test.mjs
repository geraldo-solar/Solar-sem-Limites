import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// Renderiza a página de vendas real, sem navegador nem rede. Sem resposta do
// servidor, os botões de compra não aparecem; o WhatsApp aparece sempre.
const { outputFiles } = await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import VendasNovembro from './VendasNovembro';
      export const renderPage = () => renderToStaticMarkup(React.createElement(VendasNovembro));
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
    'import.meta.env.BASE_URL': '"/solarsemlimites2026/"',
    'process.env.NODE_ENV': '"production"',
  },
});
const { renderPage } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);

const MENSAGEM = 'Olá! Tenho uma dúvida sobre o Solar Sem Limites 2027.';

test('WhatsApp do atendimento no ManyChat, com a mensagem natural decidida em 06/10, em nova aba', () => {
  const html = renderPage();
  const links = [...html.matchAll(/<a [^>]*href="(https:\/\/wa\.me\/[^"]+)"[^>]*>/g)];
  // Flutuante, depois das regras, depois das perguntas e no rodapé.
  assert.ok(links.length >= 4, `esperava ao menos 4 links, achou ${links.length}`);
  for (const [tag, href] of links) {
    const url = new URL(href.replaceAll('&amp;', '&'));
    assert.equal(url.pathname, '/5591981229825');
    assert.equal(url.searchParams.get('text'), MENSAGEM);
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="noopener noreferrer"/);
  }
  // A frase da entrada automática do ManyChat não é usada.
  assert.doesNotMatch(html, /atendimento solar sem limites/i);
  assert.match(html, /Fale com a gente no WhatsApp/);
  assert.match(html, /WhatsApp \(91\) 98122-9825/);
});

test('o canal de reservas do regulamento continua o mesmo', () => {
  const html = renderPage();
  assert.match(html, /O pedido é feito pelo WhatsApp \(91\) 98100-0800 ou por reserva@hotelsolar\.tur\.br/);
});

test('sem confirmação do servidor não há barra fixa nem botão de compra', () => {
  const html = renderPage();
  assert.doesNotMatch(html, /href="#\/checkout/);
  assert.doesNotMatch(html, />Ver opções</);
});
