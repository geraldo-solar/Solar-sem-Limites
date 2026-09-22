import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { createHash, createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';

// All provider requests are intercepted; no contacts or messages are created.
const previousEnv = { ...process.env };
const previousFetch = globalThis.fetch;
const previousLog = console.log;
const previousError = console.error;
process.env.BREVO_API_KEY = 'test-only-not-a-real-key';
delete process.env.BREVO_SENDER_EMAIL;
delete process.env.BREVO_SENDER_NAME;
delete process.env.BREVO_REPLY_TO_EMAIL;
delete process.env.BREVO_REPLY_TO_NAME;
const { default: handler } = await import('../api/capture-lead.ts');
let calls = [];
let logs = [];
let fail = '';
let reads = [];
let existingContact = null;
let afterSaveContact;
let rejectSms = false;
let failCode = '';
console.log = (...args) => logs.push(args.join(' '));
console.error = (...args) => logs.push(args.join(' '));

beforeEach(() => {
  calls = [];
  logs = [];
  fail = '';
  reads = [];
  existingContact = null;
  afterSaveContact = undefined;
  rejectSms = false;
  failCode = '';
  delete process.env.LEAD_WEBHOOK_URL;
  delete process.env.LEAD_WEBHOOK_TOKEN;
  delete process.env.META_PIXEL_ID;
  delete process.env.META_CAPI_TOKEN;
  delete process.env.META_TEST_EVENT_CODE;
  process.env.BREVO_LEADS_LIST_ID = '24';
  process.env.BREVO_SSL26_ATTRIBUTES_ENABLED = 'true';
  globalThis.fetch = async (url, options) => {
    if (options.method === 'GET') {
      reads.push({ url, options });
      const contact = reads.length > 1 && afterSaveContact !== undefined ? afterSaveContact : existingContact;
      if (contact === 'error') return new Response(null, { status: 503 });
      return contact ? Response.json(contact) : new Response(null, { status: 404 });
    }
    calls.push({ url, payload: JSON.parse(options.body), options });
    // O Brevo recusa gravar um telefone que ja pertence a outro contato.
    if (rejectSms && url.endsWith('/contacts') && JSON.parse(options.body)?.attributes?.SMS) {
      return new Response(
        JSON.stringify({ code: 'duplicate_parameter', message: 'Private contact detail that must not appear in logs' }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      );
    }
    if (fail && url.includes(fail)) {
      if (failCode) {
        return new Response(
          JSON.stringify({ code: failCode, message: 'Private contact detail that must not appear in logs' }),
          { status: 400, headers: { 'content-type': 'application/json' } },
        );
      }
      return new Response('Private contact detail that must not appear in logs', { status: 503 });
    }
    if (url.includes('integration.example.test')) return Response.json({ success: true, persisted: true }, { status: 202 });
    return new Response(null, { status: 204 });
  };
});

after(() => {
  globalThis.fetch = previousFetch;
  console.log = previousLog;
  console.error = previousError;
  process.env = previousEnv;
});

const validLead = () => ({
  action: 'capture', firstName: 'Teste', email: 'teste@example.test',
  phone: '(91) 99999-0000', consent: true, leadId: 'ssl26-test-001',
  utmSource: 'qa', utmCampaign: 'ssl26_novembro_2026', referral: 'teste-indicacao',
});

async function request(body = validLead(), method = 'POST', headers = {}) {
  const result = { headers: {} };
  const res = {
    setHeader(key, value) { result.headers[key] = value; },
    status(code) { result.status = code; return res; },
    json(value) { result.body = value; return res; },
  };
  await handler({ method, body, headers }, res);
  return result;
}

const metaCall = () => calls.find((call) => call.url.includes('graph.facebook.com'));
const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');

test('rejects non-POST without contacting providers', async () => {
  const result = await request({}, 'GET');
  assert.equal(result.status, 405);
  assert.equal(result.headers.Allow, 'POST');
  assert.equal(calls.length, 0);
});

test('rejects malformed bodies, invalid action and invalid phone types', async () => {
  for (const body of [null, [], 'invalid', { ...validLead(), action: 'erase' }, { ...validLead(), phone: 123 }]) {
    assert.equal((await request(body)).status, 400);
  }
  assert.equal(calls.length, 0);
});

test('requires consent and valid essential fields', async () => {
  for (const override of [{ consent: false }, { firstName: 'A' }, { email: 'invalid' }, { phone: '123' }]) {
    assert.equal((await request({ ...validLead(), ...override })).status, 400);
  }
  assert.equal(calls.length, 0);
});

test('honeypot does not create a contact or send messages', async () => {
  assert.equal((await request({ ...validLead(), website: 'bot' })).status, 200);
  assert.equal(calls.length, 0);
});

test('saves contact before delivery and preserves attribution', async () => {
  const result = await request();
  assert.equal(result.status, 200);
  assert.equal(result.headers['Cache-Control'], 'no-store');
  assert.equal(result.body.emailDelivery, 'accepted');
  assert.equal(result.body.integration, 'not_configured');
  assert.ok(result.body.profileToken);
  assert.equal(calls.length, 2);
  assert.equal(reads.length, 2);
  assert.ok(reads.every(read => read.options.redirect === 'error' && read.options.cache === 'no-store'));
  assert.ok(calls[0].url.endsWith('/contacts'));
  assert.deepEqual(calls[0].payload.listIds, [24]);
  assert.equal(calls[0].payload.attributes.SMS, '+5591999990000');
  assert.equal(calls[0].payload.attributes.SSL26_REFERRAL, 'teste-indicacao');
  assert.equal(calls[0].payload.attributes.SSL26_SOURCE, 'qa');
  assert.ok(calls[1].payload.textContent.includes('0029Vb8iEz73gvWjJea5rt3k'));
  assert.ok(calls.every(call => call.options.signal instanceof AbortSignal));
  assert.ok(!logs.join(' ').includes('teste@example.test'));
});

test('contact storage failure prevents all secondary deliveries', async () => {
  fail = '/contacts';
  assert.equal((await request()).status, 502);
  assert.equal(calls.length, 1);
  assert.ok(!logs.join(' ').includes('Private contact detail'));
});

test('guide email uses Geraldo as sender and the singular reserva address for replies', async () => {
  await request();
  const email = calls.find(call => call.url.endsWith('/smtp/email')).payload;
  assert.deepEqual(email.sender, { email: 'geraldo@hotelsolar.tur.br', name: 'Geraldo | Hotel Solar' });
  assert.deepEqual(email.replyTo, { email: 'reserva@hotelsolar.tur.br', name: 'Reservas | Hotel Solar' });
  assert.deepEqual(email.to, [{ email: 'teste@example.test', name: 'Teste' }]);
  assert.equal(email.cc, undefined);
  assert.equal(email.bcc, undefined);
});

test('email failure keeps registration successful and reports fallback', async () => {
  fail = '/smtp/email';
  const result = await request();
  assert.equal(result.status, 200);
  assert.equal(result.body.emailDelivery, 'failed');
  assert.ok(result.body.profileToken);
});

test('webhook outage does not lose lead and is not silently reported as success', async () => {
  process.env.LEAD_WEBHOOK_URL = 'https://integration.example.test/leads';
  process.env.LEAD_WEBHOOK_TOKEN = 'test-token';
  fail = 'integration.example.test';
  const result = await request();
  assert.equal(result.status, 200);
  assert.equal(result.body.integration, 'failed');
  assert.equal(calls[2].payload.eventId, 'ssl26-test-001:capture');
  assert.equal(calls[2].options.headers.authorization, 'Bearer test-token');
  assert.equal(calls[2].options.redirect, 'error');
});

test('webhook requires HTTPS and a token before transmitting contact data', async () => {
  for (const url of ['http://integration.example.test/leads', 'https://integration.example.test/leads']) {
    calls = [];
    process.env.LEAD_WEBHOOK_URL = url;
    assert.equal((await request()).body.integration, 'failed');
    assert.equal(calls.length, 2);
  }
});

test('webhook success requires a durable receipt, not just an HTTP 2xx', async () => {
  process.env.LEAD_WEBHOOK_URL = 'https://integration.example.test/leads';
  process.env.LEAD_WEBHOOK_TOKEN = 'test-token';
  globalThis.fetch = async (_url, options) => new Response(null, { status: options.method === 'GET' ? 404 : 204 });
  const result = await request();
  assert.equal(result.status, 200);
  assert.equal(result.body.integration, 'failed');
});

test('webhook carries the exact displayed consent, version and receipt time', async () => {
  process.env.LEAD_WEBHOOK_URL = 'https://integration.example.test/leads';
  process.env.LEAD_WEBHOOK_TOKEN = 'test-token';
  await request();
  const body = calls[2].payload;
  assert.equal(body.schemaVersion, 1);
  assert.equal(body.consent.version, 'ssl26_landing_2026_09_v1');
  assert.equal(body.consent.text, 'Concordo em receber o guia e comunicações do Hotel Solar por e-mail e WhatsApp. Posso cancelar quando quiser.');
  assert.ok(Date.parse(body.occurredAt) >= Date.parse(body.capturedAt));
});

test('profile requires signed receipt bound to the saved contact', async () => {
  const capture = await request();
  calls = [];
  assert.equal((await request({ action: 'profile', email: 'other@example.test', profile: 'nao_conhece' })).status, 403);
  assert.equal((await request({ action: 'profile', email: 'other@example.test', profile: 'nao_conhece', profileToken: capture.body.profileToken })).status, 403);
  assert.equal(calls.length, 0);
  const profile = await request({ action: 'profile', email: 'teste@example.test', profile: 'nao_conhece', profileToken: capture.body.profileToken });
  assert.equal(profile.status, 200);
  assert.equal(calls[0].payload.attributes.SSL26_PROFILE, 'nao_conhece');
  assert.equal(calls[0].payload.email, 'teste@example.test');
});

test('profile rejects tampered and expired receipts', async () => {
  const capture = await request();
  const [payload] = capture.body.profileToken.split('.');
  const expired = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, 'base64url')), expiresAt: Date.now() - 1 })).toString('base64url');
  const signature = createHmac('sha256', process.env.BREVO_API_KEY).update(`ssl26-profile-v1:${expired}`).digest('base64url');
  calls = [];
  for (const profileToken of [capture.body.profileToken + 'tampered', `${expired}.${signature}`]) {
    assert.equal((await request({ action: 'profile', profile: 'conhece', profileToken })).status, 403);
  }
  assert.equal(calls.length, 0);
});

test('profile webhook uses original consent time and trusted identity', async () => {
  process.env.LEAD_WEBHOOK_URL = 'https://integration.example.test/leads';
  process.env.LEAD_WEBHOOK_TOKEN = 'test-token';
  const capture = await request();
  const initialWebhook = calls[2].payload;
  calls = [];
  const profile = await request({ action: 'profile', profile: 'ja_hospedou', phone: 'untrusted', firstName: 'untrusted', profileToken: capture.body.profileToken });
  assert.equal(profile.status, 200);
  assert.equal(profile.body.integration, 'accepted');
  assert.equal(calls[1].payload.capturedAt, initialWebhook.capturedAt);
  assert.equal(calls[1].payload.lead.firstName, 'Teste');
  assert.equal(calls[1].payload.lead.phone, '+5591999990000');
  assert.equal(calls[1].payload.consent.granted, true);
});

test('invalid list configuration cannot silently drop contacts outside campaign list', async () => {
  process.env.BREVO_LEADS_LIST_ID = 'wrong';
  assert.equal((await request()).status, 503);
  assert.equal(calls.length, 0);
});

test('campaign withdrawal or email blacklist prevents reenrollment and promotional guide email', async () => {
  for (const globalBlock of [false, true]) {
    calls = []; reads = [];
    existingContact = { email: 'teste@example.test', attributes: { SMS: '+5591999990000', SSL26_OPT_OUT: !globalBlock }, emailBlacklisted: globalBlock };
    const result = await request();
    assert.equal(result.status, 200); assert.equal(result.body.emailDelivery, 'suppressed'); assert.ok(result.body.profileToken);
    assert.equal(calls.length, 0); assert.equal(reads.length, 1);
  }
});
test('suppressed recapture still records the event in ERP without resetting provider withdrawal', async () => {
  existingContact = { email: 'teste@example.test', attributes: { SMS: '+5591999990000', SSL26_OPT_OUT: true } };
  process.env.LEAD_WEBHOOK_URL = 'https://integration.example.test/leads'; process.env.LEAD_WEBHOOK_TOKEN = 'test-token';
  const result = await request();
  assert.equal(result.body.integration, 'accepted'); assert.equal(result.body.emailDelivery, 'suppressed');
  assert.equal(calls.length, 1); assert.ok(calls[0].url.includes('integration.example.test'));
});
for (const marker of ['SSL26_QA', 'SSL26_ATENDIMENTO_PAUSA', 'SSL26_COMPRADOR']) {
  test(`${marker} prevents recapture writes/email without converting hold to opt-out`, async () => {
    existingContact = { email: 'teste@example.test', attributes: { SMS: '+5591999990000', [marker]: true, SSL26_OPT_OUT: false } };
    const before = structuredClone(existingContact);
    const result = await request();
    assert.equal(result.status, 200); assert.equal(result.body.emailDelivery, 'suppressed');
    assert.equal(calls.length, 0); assert.deepEqual(existingContact, before);
  });
  test(`${marker} malformed value fails closed; late hold stops delivery`, async () => {
    existingContact = { email: 'teste@example.test', attributes: { [marker]: 'false' } };
    assert.equal((await request()).status, 502); assert.equal(calls.length, 0);
    existingContact = null; reads = [];
    afterSaveContact = { email: 'teste@example.test', attributes: { SMS: '+5591999990000', [marker]: true } };
    assert.equal((await request()).body.emailDelivery, 'suppressed');
    assert.equal(calls.length, 1); assert.ok(calls[0].url.endsWith('/contacts'));
    assert.equal(calls[0].payload.attributes[marker], undefined);
  });
}
test('suppression read outages, malformed data and conflicting phones fail closed without writes', async () => {
  for (const contact of ['error', { email: 'wrong@example.test', attributes: {} },
    { email: 'teste@example.test', attributes: { SMS: '+5591888880000' } },
    { email: 'teste@example.test', attributes: { SSL26_OPT_OUT: 'false' } }]) {
    existingContact = contact;
    assert.equal((await request()).status, 502); assert.equal(calls.length, 0);
  }
  assert.ok(!logs.join(' ').includes('teste@example.test'));
});
test('withdrawal or read outage after saving never sends an email or loses saved capture', async () => {
  for (const contact of ['error', { email: 'teste@example.test', attributes: { SMS: '+5591999990000', SSL26_OPT_OUT: true } }]) {
    calls = []; reads = []; afterSaveContact = contact;
    const result = await request();
    assert.equal(result.status, 200); assert.equal(result.body.emailDelivery, contact === 'error' ? 'failed' : 'suppressed');
    assert.ok(result.body.profileToken); assert.equal(calls.length, 1); assert.ok(calls[0].url.endsWith('/contacts'));
    assert.equal(calls[0].payload.attributes.SSL26_OPT_OUT, undefined);
  }
});

test('Meta CAPI stays inert until the token is configured', async () => {
  // Publicar antes de o token existir nao pode disparar nada nem quebrar a
  // captura. O ID do Pixel ja vem embutido, entao so o token segura o envio.
  for (const env of [{}, { META_PIXEL_ID: '123456789012345' }]) {
    calls = []; reads = [];
    Object.assign(process.env, env);
    const result = await request();
    assert.equal(result.status, 200);
    assert.equal(metaCall(), undefined);
    delete process.env.META_PIXEL_ID;
  }
});

test('navegador e servidor usam o mesmo Pixel, senao a deduplicacao morre calada', async () => {
  // IDs diferentes nos dois lados nao geram erro: a Meta so passa a contar cada
  // lead duas vezes, e isso so apareceria depois da midia paga ja ter rodado.
  const doNavegador = await readFile(new URL('../metaPixel.ts', import.meta.url), 'utf8');
  const idDoNavegador = doNavegador.match(/PIXEL_ID_PADRAO = '(\d+)'/)?.[1];
  assert.ok(idDoNavegador, 'metaPixel.ts deveria declarar PIXEL_ID_PADRAO');

  process.env.META_CAPI_TOKEN = 'test-only-not-a-real-token';
  await request();
  assert.ok(metaCall().url.endsWith(`/${idDoNavegador}/events`));
});

test('Meta CAPI sends the lead hashed, with the event id the browser used', async () => {
  process.env.META_PIXEL_ID = '123456789012345';
  process.env.META_CAPI_TOKEN = 'test-only-not-a-real-token';
  const result = await request();
  assert.equal(result.status, 200);

  const call = metaCall();
  assert.ok(call, 'evento deveria ter sido enviado a Meta');
  assert.ok(call.url.endsWith('/v21.0/123456789012345/events'));
  // Token em URL vaza em log de servidor: tem que viajar no corpo.
  assert.ok(!call.url.includes('test-only-not-a-real-token'));
  assert.equal(call.payload.access_token, 'test-only-not-a-real-token');

  const event = call.payload.data[0];
  assert.equal(event.event_name, 'Lead');
  assert.equal(event.action_source, 'website');
  // Mesmo id do fbq(..., { eventID }): e o que evita contar o lead duas vezes.
  assert.equal(event.event_id, 'ssl26-test-001');

  // Nada em claro: nome, e-mail e telefone so podem sair como hash.
  assert.deepEqual(event.user_data.em, [sha256('teste@example.test')]);
  assert.deepEqual(event.user_data.ph, [sha256('5591999990000')]);
  assert.deepEqual(event.user_data.fn, [sha256('teste')]);
  const serialized = JSON.stringify(call.payload);
  for (const plain of ['teste@example.test', 'Teste', '99999-0000', '5591999990000']) {
    assert.ok(!serialized.includes(plain), `dado em claro no payload: ${plain}`);
  }
});

test('Meta CAPI normalizes case and phone formatting before hashing', async () => {
  // Hash de formato diferente nao casa com a pessoa do outro lado: se a
  // normalizacao mudar, o lead deixa de ser reconhecido pela Meta.
  process.env.META_PIXEL_ID = '123456789012345';
  process.env.META_CAPI_TOKEN = 'test-only-not-a-real-token';
  await request({ ...validLead(), firstName: '  TeStE  ', email: 'TESTE@Example.Test', phone: '(91) 99999-0000' });
  const { user_data: userData } = metaCall().payload.data[0];
  assert.deepEqual(userData.em, [sha256('teste@example.test')]);
  assert.deepEqual(userData.ph, [sha256('5591999990000')]);
  assert.deepEqual(userData.fn, [sha256('teste')]);
});

test('Meta CAPI forwards match signals from cookies, click id and request headers', async () => {
  process.env.META_PIXEL_ID = '123456789012345';
  process.env.META_CAPI_TOKEN = 'test-only-not-a-real-token';
  await request(
    { ...validLead(), pageUrl: 'https://hotelsolar.tur.br/solarsemlimitescadastro?fbclid=ABC123' },
    'POST',
    { cookie: '_fbp=fb.1.1700000000.987654321; outro=x', 'x-forwarded-for': '200.1.2.3, 10.0.0.1', 'user-agent': 'Mozilla/5.0 (Teste)' },
  );
  const { user_data: userData } = metaCall().payload.data[0];
  assert.equal(userData.fbp, 'fb.1.1700000000.987654321');
  assert.match(userData.fbc, /^fb\.1\.\d+\.ABC123$/);
  // So o IP do cliente, nao a cadeia inteira de proxy.
  assert.equal(userData.client_ip_address, '200.1.2.3');
  assert.equal(userData.client_user_agent, 'Mozilla/5.0 (Teste)');
});

test('Meta CAPI reads fbclid from the hash route too', async () => {
  // A pagina tambem atende em #/lista-vip: o anuncio cola o fbclid no fim da
  // URL que for usada, e depois do '#' ele nao aparece em searchParams.
  process.env.META_PIXEL_ID = '123456789012345';
  process.env.META_CAPI_TOKEN = 'test-only-not-a-real-token';
  await request({ ...validLead(), pageUrl: 'https://hotelsolar.tur.br/#/lista-vip?fbclid=HASH999' });
  assert.match(metaCall().payload.data[0].user_data.fbc, /^fb\.1\.\d+\.HASH999$/);
});

test('withdrawn contacts are not sent to Meta', async () => {
  // Consentimento retirado vale para medicao, nao so para mensagem.
  process.env.META_PIXEL_ID = '123456789012345';
  process.env.META_CAPI_TOKEN = 'test-only-not-a-real-token';
  existingContact = { email: 'teste@example.test', attributes: { SMS: '+5591999990000', SSL26_OPT_OUT: true } };
  const result = await request();
  assert.equal(result.status, 200);
  assert.equal(result.body.emailDelivery, 'suppressed');
  assert.equal(metaCall(), undefined);
});

test('a Meta outage neither breaks the capture nor leaks the lead into logs', async () => {
  process.env.META_PIXEL_ID = '123456789012345';
  process.env.META_CAPI_TOKEN = 'test-only-not-a-real-token';
  fail = 'graph.facebook.com';
  const result = await request();
  // O cadastro e o e-mail do guia valem mais que o evento de anuncio.
  assert.equal(result.status, 200);
  assert.equal(result.body.emailDelivery, 'accepted');
  const registro = logs.join('\n');
  assert.match(registro, /"metaCapi":"failed"/);
  for (const plain of ['teste@example.test', 'Private contact detail']) {
    assert.ok(!registro.includes(plain), `dado sensivel em log: ${plain}`);
  }
});

test('telefone ja usado por outro contato nao faz o lead inteiro se perder', async () => {
  // O Brevo recusa o mesmo telefone em dois contatos. Antes, o cadastro morria
  // ai — sem guia, sem ManyChat, sem Meta — e a tela dizia "tente novamente",
  // que nunca funcionaria. O lead vale mais que o campo SMS.
  process.env.LEAD_WEBHOOK_URL = 'https://integration.example.test/leads';
  process.env.LEAD_WEBHOOK_TOKEN = 'test-token';
  process.env.META_CAPI_TOKEN = 'test-only-not-a-real-token';
  rejectSms = true;

  const result = await request();
  assert.equal(result.status, 200);
  assert.equal(result.body.emailDelivery, 'accepted');
  assert.equal(result.body.integration, 'accepted');
  assert.ok(result.body.profileToken);

  // Primeira tentativa com SMS, segunda sem — e so o SMS foi removido.
  const contatos = calls.filter((call) => call.url.endsWith('/contacts'));
  assert.equal(contatos.length, 2);
  assert.equal(contatos[0].payload.attributes.SMS, '+5591999990000');
  assert.equal(contatos[1].payload.attributes.SMS, undefined);
  assert.equal(contatos[1].payload.attributes.FIRSTNAME, 'Teste');
  assert.equal(contatos[1].payload.attributes.SSL26_SOURCE, 'qa');
  assert.deepEqual(contatos[1].payload.listIds, [24]);

  // O telefone continua chegando ao ManyChat, que e onde o WhatsApp importa.
  const webhook = calls.find((call) => call.url.includes('integration.example.test'));
  assert.equal(webhook.payload.lead.phone, '+5591999990000');
  assert.ok(metaCall(), 'evento da Meta deveria ter sido enviado mesmo assim');

  assert.match(logs.join('\n'), /"contactStorage":"saved_without_phone"/);
});

test('telefone duplicado que persiste continua falhando em vez de fingir sucesso', async () => {
  // Se a segunda tentativa tambem for recusada, a causa nao era o telefone:
  // fechar como sucesso esconderia um lead que nao foi gravado.
  fail = '/contacts';
  failCode = 'duplicate_parameter';
  const result = await request();
  assert.equal(result.status, 502);
  assert.equal(calls.filter((call) => call.url.endsWith('/contacts')).length, 2);
});

test('outros erros do Brevo nao viram nova tentativa e registram so o codigo', async () => {
  fail = '/contacts';
  failCode = 'invalid_parameter';
  const result = await request();
  assert.equal(result.status, 502);
  // Uma tentativa so: remover o SMS nao resolveria.
  assert.equal(calls.filter((call) => call.url.endsWith('/contacts')).length, 1);

  const registro = logs.join('\n');
  assert.match(registro, /"code":"invalid_parameter"/);
  // O codigo e um enum do provedor; a mensagem pode trazer dado do contato.
  assert.ok(!registro.includes('Private contact detail'));
  assert.ok(!registro.includes('teste@example.test'));
});
