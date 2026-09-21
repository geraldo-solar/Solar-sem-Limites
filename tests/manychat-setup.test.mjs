import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, createClient, EXPECTED_ACCOUNT_ID, FIELDS, provision, TAGS } from '../scripts/setup_manychat_ssl26.mjs';

function fakeAccount({ tags = [], fields = [], accountId = EXPECTED_ACCOUNT_ID } = {}) {
  const state = { tags: structuredClone(tags), fields: structuredClone(fields), calls: [], nextId: 1000 };
  const request = async (operation, body) => {
    state.calls.push({ operation, body });
    if (operation === 'getInfo') return { id: accountId, name: 'Hotel Solar' };
    if (operation === 'getTags') return structuredClone(state.tags);
    if (operation === 'getCustomFields') return structuredClone(state.fields);
    if (operation === 'createTag') {
      const tag = { id: state.nextId++, name: body.name }; state.tags.push(tag); return { tag };
    }
    if (operation === 'createCustomField') {
      const field = { id: state.nextId++, name: body.caption, type: body.type, description: body.description };
      state.fields.push(field); return { field };
    }
    throw new Error('Unexpected operation');
  };
  return { state, request };
}

test('manifest has unique names and complete launch/guard fields', () => {
  assert.equal(TAGS.length, 16); assert.equal(FIELDS.length, 13);
  assert.ok(TAGS.includes('SSL26_QA')); assert.ok(TAGS.includes('SSL26_ATENDIMENTO_PAUSA'));
  assert.equal(new Set(TAGS).size, TAGS.length);
  assert.equal(new Set(FIELDS.map(f => f.name)).size, FIELDS.length);
  assert.ok(TAGS.includes('SSL26_CANAL_VIP_CLICK'));
  assert.ok(TAGS.includes('ATENDIMENTO_HOTEL_ATIVO'));
  assert.ok(TAGS.includes('SSL26_PAUSA_REVISAO'));
  assert.equal(FIELDS.find(f => f.name === 'ssl26_support_pause_ok').type, 'boolean');
  assert.equal(FIELDS.find(f => f.name === 'ssl26_individual_attempts').type, 'number');
  for (const name of ['ssl26_consent_at', 'ssl26_last_attempt_at', 'ssl26_opt_out_at']) {
    assert.equal(FIELDS.find(f => f.name === name).type, 'datetime');
  }
});

test('default is dry-run and only reads three endpoints', async () => {
  const { state, request } = fakeAccount();
  const report = await provision({ request });
  assert.equal(report.mode, 'dry-run'); assert.equal(report.verified, false);
  assert.equal(report.items.filter(i => i.action === 'create').length, 29);
  assert.deepEqual(state.calls.map(c => c.operation), ['getInfo', 'getTags', 'getCustomFields']);
});

test('wrong account aborts before listing or writing', async () => {
  const { state, request } = fakeAccount({ accountId: '123' });
  await assert.rejects(provision({ request, apply: true }), /nao corresponde/);
  assert.equal(state.calls.length, 1);
});

test('apply uses official payloads, preserves legacy objects and is repeatable', async () => {
  const tags = [{ id: 1, name: 'Solar sem Limites 2025 Lead' }, { id: 2, name: 'ATENDIMENTO_HOTEL_ATIVO' }];
  const fields = [{ id: 3, name: 'campo_legado', type: 'text', description: 'Preservar' }];
  const { state, request } = fakeAccount({ tags, fields });
  const report = await provision({ request, apply: true });
  assert.equal(report.verified, true);
  assert.equal(report.items.filter(i => i.action === 'created').length, 28);
  assert.deepEqual(state.tags.slice(0, 2), tags); assert.deepEqual(state.fields[0], fields[0]);
  const fieldPost = state.calls.find(c => c.operation === 'createCustomField');
  assert.ok(fieldPost.body.caption); assert.equal(fieldPost.body.name, undefined);
  const writes = state.calls.filter(c => c.operation.startsWith('create')).length;
  const again = await provision({ request, apply: true });
  assert.ok(again.items.every(i => i.action === 'reused'));
  assert.equal(state.calls.filter(c => c.operation.startsWith('create')).length, writes);
  assert.equal(report.contactsModified + report.messagesSent + report.flowsActivated, 0);
});

test('field type mismatch stops before any mutation, even if tags are missing', async () => {
  const { state, request } = fakeAccount({ fields: [{ id: 1, name: 'ssl26_consent_at', type: 'text' }] });
  await assert.rejects(provision({ request, apply: true }), /Tipo incompativel/);
  assert.ok(state.calls.every(c => !c.operation.startsWith('create')));
});

test('pause acknowledgement must be boolean and cannot replace a text field', async () => {
  const { state, request } = fakeAccount({ fields: [{ id: 1, name: 'ssl26_support_pause_ok', type: 'text' }] });
  await assert.rejects(provision({ request, apply: true }), /Tipo incompativel/);
  assert.ok(state.calls.every(c => !c.operation.startsWith('create')));
});

test('duplicate, similar and malformed inventory entries fail closed', () => {
  assert.throws(() => buildPlan([{ id: 1, name: 'SSL26_LEAD' }, { id: 2, name: 'SSL26_LEAD' }], []), /duplicado/);
  assert.throws(() => buildPlan([{ id: 1, name: 'ssl26_lead ' }], []), /semelhante/);
  assert.throws(() => buildPlan([{ name: 'SSL26_LEAD' }], []), /ID invalido/);
  assert.throws(() => buildPlan({}, []), /Inventario invalido/);
  assert.throws(() => buildPlan([], null), /Inventario invalido/);
});

test('fresh read reuses a definition created after initial inventory', async () => {
  const { state, request: base } = fakeAccount();
  let tagReads = 0;
  const request = async (operation, body) => {
    if (operation === 'getTags' && ++tagReads === 2) state.tags.push({ id: 7, name: 'SSL26_LEAD' });
    return base(operation, body);
  };
  const result = await provision({ request, apply: true });
  assert.equal(result.items[0].action, 'reused');
  assert.ok(!state.calls.some(c => c.operation === 'createTag' && c.body.name === 'SSL26_LEAD'));
});

test('an uncertain write is not retried and subsequent writes stop', async () => {
  const { state, request: base } = fakeAccount();
  let writes = 0;
  const request = async (operation, body) => {
    if (operation.startsWith('create')) { writes++; throw new Error('uncertain'); }
    return base(operation, body);
  };
  await assert.rejects(provision({ request, apply: true }), /uncertain/);
  assert.equal(writes, 1); assert.equal(state.tags.length, 0);
});

test('client restricts operations, disables redirects and keeps errors secret-free', async () => {
  const secret = 'FAKE_TEST_KEY_NOT_A_CREDENTIAL';
  let options;
  const client = createClient(secret, { minGapMs: 0, fetchImpl: async (url, opts) => {
    options = opts;
    assert.equal(url, 'https://api.manychat.com/fb/page/getInfo');
    return { ok: false, status: 401, json: async () => ({ status: 'error', message: secret }) };
  } });
  await assert.rejects(client('sendContent'), /fora do escopo/);
  await assert.rejects(client('getInfo'), error => !error.message.includes(secret) && /401/.test(error.message));
  assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'error');
  assert.equal(options.headers.Authorization, `Bearer ${secret}`); assert.ok(options.signal);
});

test('network failures and redirects never expose raw exceptions or retry POST', async () => {
  let calls = 0;
  const client = createClient('FAKE_TEST_KEY', { minGapMs: 0, fetchImpl: async () => { calls++; throw new Error('FAKE_TEST_KEY'); } });
  await assert.rejects(client('createTag', { name: 'SSL26_LEAD' }), error => !error.message.includes('FAKE_TEST_KEY') && /Sem repeticao/.test(error.message));
  assert.equal(calls, 1);
});

test('HTTP success with API error is still a failure without provider text', async () => {
  const client = createClient('FAKE_TEST_KEY', { minGapMs: 0, fetchImpl: async () => ({
    ok: true, status: 200, json: async () => ({ status: 'error', message: 'FAKE_TEST_KEY' }),
  }) });
  await assert.rejects(client('createTag', { name: 'SSL26_LEAD' }), error => /recusou/.test(error.message) && !error.message.includes('FAKE_TEST_KEY'));
});

test('malformed creation confirmation stops immediately without retry', async () => {
  const { request: base } = fakeAccount();
  let posts = 0;
  const request = async (operation, body) => {
    if (operation.startsWith('create')) { posts++; return {}; }
    return base(operation, body);
  };
  await assert.rejects(provision({ request, apply: true }), /sem confirmacao/);
  assert.equal(posts, 1);
});

test('missing target during final readback cannot be reported as verified', async () => {
  const { state, request: base } = fakeAccount();
  const request = async (operation, body) => {
    const result = await base(operation, body);
    if (operation === 'getTags' && state.fields.length === FIELDS.length) {
      return result.filter(t => t.name !== 'SSL26_LEAD');
    }
    return result;
  };
  await assert.rejects(provision({ request, apply: true }), /Verificacao final divergente/);
});
