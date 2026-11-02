import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// Volta da Cielo: qual compra conferir e como ler a resposta do ERP. A tela
// renderizada sem navegador mostra o estado inicial de cada caminho.
const { outputFiles } = await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import PagamentoConcluido from './PagamentoConcluido';
      export * from './pagamentoDaCompra';
      export const renderRetorno = (pedido) => renderToStaticMarkup(React.createElement(PagamentoConcluido, { pedido }));
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
const m = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);

const ID = '3f2b8c1a-9d4e-4f6a-8b7c-1234567890ab';
const OUTRO = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

test('volta da Cielo: o id do endereço vale; sem ele, o guardado antes de sair', () => {
  assert.equal(m.pedidoDaVolta(`?pagamento=${ID}`, OUTRO), ID);
  assert.equal(m.pedidoDaVolta('', OUTRO), OUTRO);
  assert.equal(m.pedidoDaVolta('?ref=CODIGO', null), null);
  // Endereço com lixo não vira consulta.
  assert.equal(m.pedidoDaVolta('?pagamento=<script>', null), null);
  assert.equal(m.pedidoDaVolta('', 'nao-e-uuid'), null);
});

test('desfecho: pago só sem divergência; recusado encerra; o resto continua conferindo', () => {
  const s = (situacao, extra = {}) => ({ compraAprovada: false, entradaNoPix: false,
    pagamento: { situacao, texto: '', divergencia: null, parcelas: null, bandeira: null, final: null, podeTentarDeNovo: false, ...extra } });
  assert.equal(m.desfechoDoPagamento(s('pago')), 'pago');
  assert.equal(m.desfechoDoPagamento(s('pago', { divergencia: 'valor_diferente' })), 'em_aberto');
  for (const r of ['negado', 'expirado', 'cancelado']) assert.equal(m.desfechoDoPagamento(s(r)), 'recusado');
  for (const a of ['aguardando', 'pendente', 'autorizado', 'nao_finalizado', 'desconhecido']) {
    assert.equal(m.desfechoDoPagamento(s(a)), 'em_aberto');
  }
  assert.equal(m.desfechoDoPagamento({ compraAprovada: false, entradaNoPix: false, pagamento: null }), 'em_aberto');
  // A equipe já aprovou: está pago, diga o que disser a última consulta.
  assert.equal(m.desfechoDoPagamento({ ...s('aguardando'), compraAprovada: true }), 'pago');
});

test('tentar de novo passa pela rota do ERP que confere antes de abrir outra página', () => {
  const url = new URL(m.linkParaTentarDeNovo(ID));
  assert.equal(url.origin, 'https://erp-hotel-solar.vercel.app');
  assert.equal(url.pathname, '/api/advance-packages/pagamento-cartao/abrir');
  assert.equal(url.searchParams.get('purchaseId'), ID);
});

test('tela de retorno: com o pedido, confere; sem ele, não afirma nada', () => {
  const comPedido = m.renderRetorno(ID);
  assert.match(comPedido, /Confirmando seu pagamento/);
  assert.match(comPedido, /#3F2B8C1A/);
  assert.doesNotMatch(comPedido, /aprovado/i);
  const semPedido = m.renderRetorno(null);
  assert.match(semPedido, /Se você concluiu o pagamento na Cielo/);
  assert.doesNotMatch(semPedido, /Confirmando/);
});
