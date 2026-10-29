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
  assert.deepEqual(res.body, { success: true, link: 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A', codigo: 'K7M2QX9A', emailDelivery: 'accepted', propriaIndicacao: false });

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

test('quem pediu para sair e marca o consentimento de novo volta a receber', async () => {
  contato = { email: 'bia@example.test', attributes: { SSL26_OPT_OUT: true }, emailBlacklisted: true };
  const res = await enviar(valido);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.emailDelivery, 'accepted');
  const salvo = chamadas.find((c) => c.url.endsWith('/contacts') && c.metodo === 'POST');
  assert.equal(salvo.corpo.attributes.SSL26_OPT_OUT, false, 'consentimento novo desfaz a saida');
  assert.equal(salvo.corpo.emailBlacklisted, false);
  assert.ok(chamadas.find((c) => c.url.endsWith('/smtp/email')), 'e-mail de boas-vindas enviado');
});

test('comprador ou contato de teste tambem recebe o link por e-mail, sem perder a marca', async () => {
  contato = { email: 'bia@example.test', attributes: { SSL26_COMPRADOR: true, SSL26_QA: true }, emailBlacklisted: false };
  const res = await enviar(valido);
  assert.equal(res.body.emailDelivery, 'accepted');
  const salvo = chamadas.find((c) => c.url.endsWith('/contacts') && c.metodo === 'POST');
  assert.equal(salvo.corpo.attributes.SSL26_COMPRADOR, undefined, 'marca de comprador nao e regravada');
  assert.equal(salvo.corpo.attributes.SSL26_QA, undefined);
});

test('e-mail de boas-vindas convida para o canal do lancamento', () => {
  const email = emailDeBoasVindas('Ana', 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A');
  assert.match(email.htmlContent, /whatsapp\.com\/channel\/0029Vb8iEz73gvWjJea5rt3k/);
  assert.match(email.textContent, /canal Solar Sem Limites/);
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

// Pixel da Meta (Fase 1, otimização por entrada na Lista VIP): o servidor
// manda o Lead pela Conversions API com o mesmo id do fbq do navegador.
const metaDaLista = () => chamadas.find((c) => c.url.includes('graph.facebook.com'));

test('entrada na lista vai para a Meta como Lead, com o id do navegador', async () => {
  process.env.META_CAPI_TOKEN = 'test-only-not-a-real-token';
  try {
    const res = await enviar({ ...valido, eventId: 'b3f1c2d4-1111-2222-3333-444455556666', pageUrl: 'https://www.hotelsolar.tur.br/vip?fbclid=abc' });
    assert.equal(res.statusCode, 200);
    const meta = metaDaLista();
    assert.ok(meta, 'chamada à Conversions API');
    const [evento] = meta.corpo.data;
    assert.equal(evento.event_name, 'Lead');
    assert.equal(evento.event_id, 'b3f1c2d4-1111-2222-3333-444455556666');
    assert.equal(evento.custom_data.content_name, 'ssl27_lista_vip');
    assert.equal(evento.custom_data.content_category, 'indicacao');
    assert.ok(evento.user_data.em[0].length === 64, 'e-mail só em hash');
    assert.doesNotMatch(JSON.stringify(evento), /bia@example|98111/i, 'nenhum dado pessoal em claro');
    assert.match(logs.join('\n'), /"metaCapi":"accepted"/);
  } finally {
    delete process.env.META_CAPI_TOKEN;
  }
});

test('sem id do navegador nada vai para a Meta; quem volta com consentimento novo vai', async () => {
  process.env.META_CAPI_TOKEN = 'test-only-not-a-real-token';
  try {
    await enviar(valido);
    assert.equal(metaDaLista(), undefined, 'sem eventId não manda: evitaria contar em dobro');
    chamadas = [];
    contato = { email: 'bia@example.test', attributes: { SSL26_OPT_OUT: true }, emailBlacklisted: false };
    await enviar({ ...valido, eventId: 'b3f1c2d4-1111-2222-3333-444455556666' });
    assert.ok(metaDaLista(), 'consentimento novo vale para medição');
  } finally {
    delete process.env.META_CAPI_TOKEN;
  }
});

// ManyChat (28/10/2026): a rota cria ou acha o contato, com etiqueta e link.
function comManyChat(responder) {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).startsWith('https://api.manychat.com/')) {
      chamadas.push({ url: String(url), metodo: options.method || 'GET', headers: options.headers, corpo: options.body ? JSON.parse(options.body) : undefined });
      return responder(String(url).replace('https://api.manychat.com/fb/subscriber/', ''), options);
    }
    return original(url, options);
  };
}
const ok = (data) => Response.json({ status: 'success', data });
const doManyChat = () => chamadas.filter((c) => c.url.startsWith('https://api.manychat.com/'));
const logFinal = () => JSON.parse(logs.find((l) => l.includes('"message":"SSL26 Lista VIP"')) || '{}');

test('sem a chave do ManyChat nada vai para o ManyChat', async () => {
  delete process.env.MANYCHAT_API_KEY;
  comManyChat(() => ok({ id: '1' }));
  const res = await enviar(valido);
  assert.equal(res.statusCode, 200);
  assert.equal(doManyChat().length, 0);
  assert.equal(logFinal().manychat, 'skipped');
});

test('contato novo no ManyChat: WhatsApp autorizado, etiqueta da Lista VIP e link', async () => {
  process.env.MANYCHAT_API_KEY = 'chave-de-teste';
  comManyChat((operacao) => ok(operacao === 'createSubscriber' ? { id: '9001' } : {}));
  const res = await enviar(valido);
  delete process.env.MANYCHAT_API_KEY;
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.link, 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A');
  const [criar, etiqueta, campo] = doManyChat();
  assert.equal(criar.headers.Authorization, 'Bearer chave-de-teste');
  assert.match(criar.url, /createSubscriber$/);
  assert.equal(criar.corpo.whatsapp_phone, '+5591981110002');
  assert.equal(criar.corpo.first_name, 'Bia');
  assert.equal(criar.corpo.last_name, 'Souza');
  assert.match(criar.corpo.consent_phrase, /Lista VIP Solar Sem Limites 2027/);
  assert.deepEqual(etiqueta.corpo, { subscriber_id: '9001', tag_name: 'SSL26_LISTA_VIP' });
  assert.deepEqual(campo.corpo, { subscriber_id: '9001', field_name: 'ssl26_link_indicacao', field_value: 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A' });
  assert.equal(logFinal().manychat, 'created');
  assert.ok(!logs.join(' ').includes('chave-de-teste'));
});

test('contato que ja existe no ManyChat e achado pelo telefone e ganha etiqueta e link', async () => {
  process.env.MANYCHAT_API_KEY = 'chave-de-teste';
  comManyChat((operacao) => {
    if (operacao === 'createSubscriber') return Response.json({ status: 'error', message: 'Validation error' }, { status: 400 });
    if (operacao.startsWith('findBySystemField')) return ok({ id: 7007 });
    return ok({});
  });
  const res = await enviar(valido);
  delete process.env.MANYCHAT_API_KEY;
  assert.equal(res.statusCode, 200);
  const operacoes = doManyChat().map((c) => c.url.replace('https://api.manychat.com/fb/subscriber/', ''));
  assert.deepEqual(operacoes, ['createSubscriber', 'findBySystemField?phone=5591981110002', 'addTagByName', 'setCustomFieldByName']);
  assert.equal(doManyChat()[2].corpo.subscriber_id, '7007');
  assert.equal(logFinal().manychat, 'updated');
});

test('ManyChat fora do ar nao atrapalha a entrada na lista', async () => {
  process.env.MANYCHAT_API_KEY = 'chave-de-teste';
  comManyChat(() => { throw new Error('rede'); });
  const res = await enviar(valido);
  delete process.env.MANYCHAT_API_KEY;
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.emailDelivery, 'accepted');
  assert.equal(logFinal().manychat, 'failed');
});

test('sem o ERP nada vai para o ManyChat', async () => {
  process.env.MANYCHAT_API_KEY = 'chave-de-teste';
  erp = 'erro';
  comManyChat(() => ok({ id: '1' }));
  const res = await enviar(valido);
  delete process.env.MANYCHAT_API_KEY;
  assert.equal(res.statusCode, 503);
  assert.equal(doManyChat().length, 0);
});

test('contato existente so com o + no ManyChat tambem e achado; sem achar, nada e gravado', async () => {
  process.env.MANYCHAT_API_KEY = 'chave-de-teste';
  comManyChat((operacao) => {
    if (operacao === 'createSubscriber') return Response.json({ status: 'error' }, { status: 400 });
    if (operacao === 'findBySystemField?phone=%2B5591981110002') return ok({ id: '55' });
    if (operacao.startsWith('findBySystemField')) return Response.json({ status: 'error' }, { status: 400 });
    return ok({});
  });
  await enviar(valido);
  assert.equal(logFinal().manychat, 'updated');
  comManyChat((operacao) => (operacao === 'createSubscriber' || operacao.startsWith('findBySystemField'))
    ? Response.json({ status: 'error' }, { status: 400 }) : ok({}));
  chamadas = []; logs = [];
  await enviar(valido);
  delete process.env.MANYCHAT_API_KEY;
  assert.equal(logFinal().manychat, 'not_found');
  assert.ok(!doManyChat().some((c) => c.url.endsWith('addTagByName')));
});

// Origem (28/10/2026): as UTMs do endereço da página vão para o ERP.
test('UTMs do link da pagina vao para o ERP; endereco de fora do site e ignorado', async () => {
  await enviar({ ...valido, pageUrl: 'https://www.hotelsolar.tur.br/vip?utm_source=meta&utm_medium=paid&utm_campaign=ssl27_fase1_listavip&utm_term=Quentes&utm_content=E1%20%C2%B7%20A%C3%A9rea' });
  assert.deepEqual(chamadas[0].corpo.rastreio, {
    utmSource: 'meta', utmMedium: 'paid', utmCampaign: 'ssl27_fase1_listavip', utmContent: 'E1 · Aérea', utmTerm: 'Quentes',
  });
  chamadas = [];
  await enviar({ ...valido, pageUrl: 'https://outro-site.example/vip?utm_source=meta' });
  assert.equal(chamadas[0].corpo.rastreio, undefined);
  chamadas = [];
  await enviar({ ...valido, pageUrl: 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A' });
  assert.equal(chamadas[0].corpo.rastreio, undefined, 'sem UTM, nada vai');
});

test('entrou pelo proprio link: a pagina fica sabendo que nao conta como indicacao (29/10/2026)', async () => {
  erp.body.indicacao = 'propria';
  const res = await enviar(valido);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.propriaIndicacao, true);
  assert.equal(res.body.link, 'https://www.hotelsolar.tur.br/vip?ref=K7M2QX9A');
  for (const outra of ['registrada', 'outra_indicacao_vale', 'sem_convite', '']) {
    erp.body.indicacao = outra;
    assert.equal((await enviar(valido)).body.propriaIndicacao, false, outra);
  }
});
