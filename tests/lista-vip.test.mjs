import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// Rota /api/lista-vip com ERP e Brevo interceptados: nenhum contato,
// cadastro ou mensagem de verdade é criado.
const previousEnv = { ...process.env };
const previousFetch = globalThis.fetch;
const previousLog = console.log;
const previousError = console.error;
process.env.BREVO_API_KEY = 'test-only-not-a-real-key';
process.env.SOLAR_INGEST_SECRET = 'segredo-de-teste';
process.env.SOLAR_ERP_URL = 'https://erp.example.test';
delete process.env.SSL26_CENTRAL_ELIGIBILITY_ENABLED;
delete process.env.BREVO_LISTA_VIP_LIST_ID;

const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL('../api/lista-vip.ts', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'esm', packages: 'external',
});
const { default: handler, emailDeBoasVindas, mensagemParaCompartilhar } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);

let chamadas = [];
let erp = null;
let contato = null;
let logs = [];
console.log = (...args) => logs.push(args.join(' '));
console.error = (...args) => logs.push(args.join(' '));

beforeEach(() => {
  chamadas = [];
  logs = [];
  contato = null;
  erp = { status: 200, body: { success: true, codigo: 'K7M2QX9A', link: 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A', indicacao: 'registrada' } };
  globalThis.fetch = async (url, options = {}) => {
    const metodo = options.method || 'GET';
    chamadas.push({ url: String(url), metodo, headers: options.headers, corpo: options.body ? JSON.parse(options.body) : undefined });
    if (String(url).startsWith('https://erp.example.test')) {
      if (erp === 'erro') throw new Error('rede');
      return Response.json(erp.body, { status: erp.status });
    }
    if (metodo === 'GET') return contato ? Response.json(contato) : new Response(null, { status: 404 });
    return new Response(null, { status: 201 });
  };
});

after(() => {
  globalThis.fetch = previousFetch;
  console.log = previousLog;
  console.error = previousError;
  process.env = previousEnv;
});

function resposta() {
  const r = { statusCode: 0, body: null, headers: {} };
  r.status = (c) => { r.statusCode = c; return r; };
  r.json = (b) => { r.body = b; return r; };
  r.setHeader = (k, v) => { r.headers[k] = v; };
  return r;
}
const enviar = async (body, method = 'POST') => {
  const res = resposta();
  await handler({ method, body, headers: {} }, res);
  return res;
};
const valido = { nome: ' Bia  Souza ', telefone: '(91) 98111-0002', email: ' Bia@Example.test ', consent: true, convite: 'k7m2qx9a' };

test('entra na lista: link do ERP, contato na lista 25 e e-mail com o link', async () => {
  const res = await enviar(valido);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, link: 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A', codigo: 'K7M2QX9A', emailDelivery: 'accepted' });

  const [pedidoErp] = chamadas;
  assert.equal(pedidoErp.url, 'https://erp.example.test/api/ssl26/lista-vip');
  assert.equal(pedidoErp.headers['x-solar-ingest-secret'], 'segredo-de-teste');
  assert.equal(pedidoErp.corpo.telefone, '+5591981110002');
  assert.equal(pedidoErp.corpo.email, 'bia@example.test');
  assert.equal(pedidoErp.corpo.nome, 'Bia Souza');
  assert.equal(pedidoErp.corpo.convite, 'K7M2QX9A');
  assert.ok(pedidoErp.corpo.consentimentoEm);

  const salvo = chamadas.find((c) => c.url.endsWith('/contacts') && c.metodo === 'POST');
  assert.deepEqual(salvo.corpo.listIds, [25]);
  assert.equal(salvo.corpo.attributes.SSL26_LINK_INDICACAO, 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A');
  assert.equal(salvo.corpo.attributes.SMS, '+5591981110002');
  assert.equal(salvo.corpo.attributes.SSL26_REFERRAL, 'K7M2QX9A');

  const email = chamadas.find((c) => c.url.endsWith('/smtp/email'));
  assert.equal(email.corpo.to[0].email, 'bia@example.test');
  assert.match(email.corpo.subject, /Bia, você está na Lista VIP Solar Sem Limites 2027/);
  assert.match(email.corpo.htmlContent, /vip\?ref=K7M2QX9A/);
  assert.match(email.corpo.htmlContent, /até 01\/12/);
  assert.doesNotMatch(logs.join('\n'), /bia@example|98111/i, 'log sem dado pessoal');
});

test('sem o ERP nao ha link: nada e gravado no Brevo e a pessoa pode tentar de novo', async () => {
  erp = 'erro';
  const res = await enviar(valido);
  assert.equal(res.statusCode, 503);
  assert.equal(chamadas.filter((c) => !c.url.startsWith('https://erp.example.test')).length, 0);
  erp = { status: 200, body: { success: true, codigo: 'X', link: 'https://outro.site/?ref=X' } };
  assert.equal((await enviar(valido)).statusCode, 503, 'link fora do formato tambem e recusado');
});

test('quem pediu para sair recebe o link na tela, sem e-mail e sem regravar o contato', async () => {
  contato = { email: 'bia@example.test', attributes: { SSL26_OPT_OUT: true }, emailBlacklisted: false };
  const res = await enviar(valido);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.emailDelivery, 'suppressed');
  assert.equal(chamadas.filter((c) => c.metodo === 'POST' && !c.url.startsWith('https://erp.example.test')).length, 0);
});

test('dados incompletos, sem consentimento ou robo nao chegam ao ERP', async () => {
  for (const ruim of [
    { ...valido, consent: false },
    { ...valido, telefone: '123' },
    { ...valido, email: 'sem-arroba' },
    { ...valido, nome: 'B' },
  ]) {
    assert.equal((await enviar(ruim)).statusCode, 400);
  }
  assert.equal((await enviar({ ...valido, website: 'http://spam' })).statusCode, 200);
  assert.equal((await enviar(valido, 'GET')).statusCode, 405);
  assert.equal(chamadas.length, 0);
});

test('convite fora do formato nao vai para o ERP', async () => {
  await enviar({ ...valido, convite: '<script>' });
  assert.equal(chamadas[0].corpo.convite, '');
});

test('e-mail escapa o nome e traz regulamento e WhatsApp de atendimento', () => {
  const email = emailDeBoasVindas('<b>Ana</b>', 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A');
  assert.doesNotMatch(email.htmlContent, /<b>Ana<\/b>/);
  assert.match(email.htmlContent, /Regulamento_SSL\.pdf/);
  assert.match(email.htmlContent, /98122-9825/);
  assert.match(mensagemParaCompartilhar('L'), /Lista VIP do Solar Sem Limites 2027.*L$/);
});
