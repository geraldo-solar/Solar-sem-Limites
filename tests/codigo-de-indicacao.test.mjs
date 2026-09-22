import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

// sessionStorage de mentira, para rodar fora do navegador.
const armazem = new Map();
globalThis.window = {
  location: { href: 'http://localhost/' },
  sessionStorage: {
    getItem: (k) => (armazem.has(k) ? armazem.get(k) : null),
    setItem: (k, v) => armazem.set(k, String(v)),
  },
};

const { registrarIndicacaoDaUrl, indicacaoDaVisita } =
  await import('../codigoDeIndicacao.ts');

beforeEach(() => armazem.clear());

test('le o codigo da query e o guarda para o resto da visita', () => {
  assert.equal(registrarIndicacaoDaUrl('https://x.test/solarsemlimites2026?ref=ABC123'), 'ABC123');
  // A travessia que importa: o checkout e outra tela, e le sem ver a URL.
  assert.equal(indicacaoDaVisita(), 'ABC123');
});

test('le o codigo tambem depois do hash, que e como a rota interna funciona', () => {
  assert.equal(registrarIndicacaoDaUrl('https://x.test/#/vendas?ref=DEF456'), 'DEF456');
  assert.equal(indicacaoDaVisita(), 'DEF456');
});

test('sem codigo no link, nada e inventado', () => {
  assert.equal(registrarIndicacaoDaUrl('https://x.test/solarsemlimites2026'), '');
  assert.equal(indicacaoDaVisita(), '');
});

test('o codigo guardado sobrevive a navegacao sem ref na URL', () => {
  registrarIndicacaoDaUrl('https://x.test/solarsemlimites2026?ref=ABC123');
  // Ir para o checkout apaga o parametro da URL, mas nao a indicacao da visita.
  assert.equal(registrarIndicacaoDaUrl('https://x.test/#/checkout'), 'ABC123');
  assert.equal(indicacaoDaVisita(), 'ABC123');
});

test('formato invalido e recusado em vez de virar dado da compra', () => {
  // O codigo entra pela URL, entao qualquer um pode escrever o que quiser ali.
  for (const lixo of [
    '<script>',
    'com espaco',
    'a',                       // curto demais
    'x'.repeat(41),            // longo demais
    "'; drop table--",
    'ABC/123',
  ]) {
    armazem.clear();
    assert.equal(registrarIndicacaoDaUrl(`https://x.test/?ref=${encodeURIComponent(lixo)}`), '',
      `deveria recusar: ${lixo}`);
    assert.equal(indicacaoDaVisita(), '');
  }
});

test('URL quebrada nao derruba a pagina', () => {
  assert.equal(registrarIndicacaoDaUrl('nao é uma url'), '');
});

test('armazenamento bloqueado nao impede a compra', () => {
  // Navegador em modo restrito: perder o credito de indicacao e aceitavel,
  // quebrar o checkout nao é.
  const original = window.sessionStorage;
  window.sessionStorage = {
    getItem() { throw new Error('bloqueado'); },
    setItem() { throw new Error('bloqueado'); },
  };
  assert.doesNotThrow(() => registrarIndicacaoDaUrl('https://x.test/?ref=ABC123'));
  assert.equal(indicacaoDaVisita(), '');
  window.sessionStorage = original;
});
