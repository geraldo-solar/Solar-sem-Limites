import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';

export const EXPECTED_ACCOUNT_ID = '156918594386969';
export const TAGS = Object.freeze([
  'SSL26_LEAD', 'SSL26_CAPTADO', 'SSL26_CANAL_VIP_CLICK', 'SSL26_CANAL_VIP',
  'SSL26_ENGAJADO', 'SSL26_LIVE', 'SSL26_PAGINA_VENDAS',
  'SSL26_CHECKOUT_INICIADO', 'SSL26_CHECKOUT_ABANDONADO',
  'SSL26_PAGAMENTO_PENDENTE', 'SSL26_COMPRADOR', 'SSL26_OPT_OUT',
  'ATENDIMENTO_HOTEL_ATIVO', 'SSL26_PAUSA_REVISAO',
  'SSL26_QA', 'SSL26_ATENDIMENTO_PAUSA',
]);
export const FIELDS = Object.freeze([
  { name: 'ssl26_profile', type: 'text', description: 'SSL26 novembro/2026: ja_hospedou, conhece ou nao_conhece; opcional.' },
  { name: 'ssl26_source', type: 'text', description: 'SSL26: origem do cadastro consentido.' },
  { name: 'ssl26_utm_campaign', type: 'text', description: 'SSL26: campanha UTM do cadastro.' },
  { name: 'ssl26_utm_content', type: 'text', description: 'SSL26: criativo/conteudo UTM do cadastro.' },
  { name: 'ssl26_referral', type: 'text', description: 'SSL26: codigo de indicacao; cadastro nao gera recompensa.' },
  { name: 'ssl26_consent_at', type: 'datetime', description: 'SSL26: instante do consentimento original, com fuso horario.' },
  { name: 'ssl26_consent_source', type: 'text', description: 'SSL26: origem e referencia da evidencia de consentimento.' },
  { name: 'ssl26_order_id', type: 'text', description: 'SSL26: identificador do pedido no ERP; nao armazenar dados de cartao.' },
  { name: 'ssl26_individual_attempts', type: 'number', description: 'SSL26: tentativas de recuperacao somadas entre canais/equipe; limite 3.' },
  { name: 'ssl26_last_attempt_at', type: 'datetime', description: 'SSL26: instante da ultima tentativa individual de recuperacao, com fuso.' },
  { name: 'ssl26_opt_out_at', type: 'datetime', description: 'SSL26: instante do pedido de saida, com fuso; nao reativar por importacao.' },
  { name: 'ssl26_opt_out_source', type: 'text', description: 'SSL26: canal/origem do pedido de saida para conciliacao da supressao.' },
  { name: 'ssl26_support_pause_ok', type: 'boolean', description: 'SSL26: confirmacao da pausa central. Reiniciar como falso a cada pedido; verdadeiro somente apos resposta positiva do ERP. Nao representa consentimento nem libera envios.' },
]);

const OPERATIONS = Object.freeze({
  getInfo: 'GET', getTags: 'GET', getCustomFields: 'GET',
  createTag: 'POST', createCustomField: 'POST',
});
const ROOT = fileURLToPath(new URL('../', import.meta.url));
class SafeSetupError extends Error {}
const normalizedName = (name) => String(name).normalize('NFC').trim().toLowerCase();
const validId = (id) => /^(0|[1-9]\d*)$/.test(String(id)) && Number.isSafeInteger(Number(id)) && Number(id) > 0;

export function createClient(key, { fetchImpl = fetch, minGapMs = 160 } = {}) {
  if (!key || /[\r\n]/.test(key)) throw new SafeSetupError('Chave local ausente ou em formato invalido.');
  let lastStartedAt = 0;
  return async function request(operation, body) {
    const method = Object.hasOwn(OPERATIONS, operation) && OPERATIONS[operation];
    if (!method) throw new SafeSetupError('Operacao fora do escopo permitido.');
    const remaining = minGapMs - (Date.now() - lastStartedAt);
    if (remaining > 0) await delay(remaining);
    lastStartedAt = Date.now();
    let response;
    let payload;
    try {
      response = await fetchImpl(`https://api.manychat.com/fb/page/${operation}`, {
        method,
        headers: { Authorization: `Bearer ${key}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
      });
      payload = await response.json();
    } catch {
      // Never include raw provider errors, headers, or secrets in logs. No automatic POST retry.
      throw new SafeSetupError(`Falha de rede/resposta em ${operation}. Sem repeticao automatica; consulte o inventario antes de reaplicar.`);
    }
    if (!response.ok || payload?.status !== 'success' || !Object.hasOwn(payload, 'data')) {
      throw new SafeSetupError(`ManyChat recusou ${operation} (HTTP ${response.status}). Nenhuma repeticao automatica.`);
    }
    return payload.data;
  };
}

function lookup(items, desired, kind) {
  if (!Array.isArray(items)) throw new SafeSetupError(`Inventario invalido de ${kind}; operacao interrompida.`);
  const matches = items.filter((item) => item && normalizedName(item.name) === normalizedName(desired.name));
  if (matches.length > 1) throw new SafeSetupError(`Nome duplicado em ${desired.name}; resolver antes de criar.`);
  if (!matches.length) return null;
  const item = matches[0];
  if (item.name !== desired.name || !validId(item.id)) {
    throw new SafeSetupError(`Nome semelhante ou ID invalido em ${desired.name}; nenhuma substituicao automatica.`);
  }
  if (kind === 'field' && item.type !== desired.type) {
    throw new SafeSetupError(`Tipo incompativel em ${desired.name}; nenhuma alteracao automatica.`);
  }
  return item;
}

export function buildPlan(tags, fields) {
  return [
    ...TAGS.map((name) => ({ kind: 'tag', name })),
    ...FIELDS.map((field) => ({ kind: 'field', ...field })),
  ].map((desired) => {
    const existing = lookup(desired.kind === 'tag' ? tags : fields, desired, desired.kind);
    return { ...desired, action: existing ? 'reuse' : 'create', ...(existing ? { id: existing.id } : {}) };
  });
}

export async function provision({ request, apply = false, onEvent = () => {} }) {
  const account = await request('getInfo');
  if (String(account?.id) !== EXPECTED_ACCOUNT_ID) {
    throw new SafeSetupError('A chave nao corresponde a conta Hotel Solar aprovada. Nenhuma gravacao executada.');
  }
  const initialTags = await request('getTags');
  const initialFields = await request('getCustomFields');
  // Check every target for conflicts before the first write.
  const plan = buildPlan(initialTags, initialFields);
  const report = {
    accountId: EXPECTED_ACCOUNT_ID, accountName: 'Hotel Solar',
    checkedAt: new Date().toISOString(), mode: apply ? 'apply' : 'dry-run',
    before: { tags: initialTags.length, fields: initialFields.length },
    contactsModified: 0, messagesSent: 0, flowsActivated: 0,
    items: plan, verified: false,
  };
  if (!apply) return report;

  const completed = [];
  for (const desired of plan) {
    const tag = desired.kind === 'tag';
    // Re-read just before creation. Sequential re-runs reuse existing definitions.
    // Do not run provisioning concurrently from multiple processes/accounts.
    const fresh = await request(tag ? 'getTags' : 'getCustomFields');
    const existing = lookup(fresh, desired, desired.kind);
    let item = existing;
    if (!item) {
      const created = await request(tag ? 'createTag' : 'createCustomField', tag
        ? { name: desired.name }
        : { caption: desired.name, type: desired.type, description: desired.description });
      item = lookup([tag ? created?.tag : created?.field], desired, desired.kind);
      if (!item) throw new SafeSetupError(`Criacao de ${desired.name} sem confirmacao valida; conferir inventario antes de reaplicar.`);
    }
    completed.push({ kind: desired.kind, name: desired.name, ...(tag ? {} : { type: desired.type }), id: item.id, action: existing ? 'reused' : 'created' });
    onEvent({ name: desired.name, action: existing ? 'reused' : 'created' });
  }

  const finalTags = await request('getTags');
  const finalFields = await request('getCustomFields');
  for (const desired of completed) {
    const saved = lookup(desired.kind === 'tag' ? finalTags : finalFields, desired, desired.kind);
    if (!saved || String(saved.id) !== String(desired.id)) {
      throw new SafeSetupError(`Verificacao final divergente em ${desired.name}; nenhuma exclusao ou nova tentativa automatica.`);
    }
  }
  return {
    ...report, checkedAt: new Date().toISOString(), items: completed,
    after: { tags: finalTags.length, fields: finalFields.length }, verified: true,
  };
}

function readLocalKey() {
  const localFile = resolve(ROOT, '.env.manychat.local');
  try {
    execFileSync('git', ['check-ignore', '--quiet', '.env.manychat.local'], { cwd: ROOT, stdio: 'ignore' });
    const tracked = execFileSync('git', ['ls-files', '--', '.env.manychat.local'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    if (tracked.trim() || (statSync(localFile).mode & 0o077) !== 0) throw new Error('unsafe-file');
    const raw = readFileSync(localFile, 'utf8');
    if (raw.trimStart().startsWith('{\\rtf')) throw new Error('rich-text');
    return parseEnv(raw).MANYCHAT_API_KEY?.trim();
  } catch {
    throw new SafeSetupError('Confira o arquivo local: texto simples, fora do Git e permissao 600. Nenhum segredo foi exibido.');
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('node scripts/setup_manychat_ssl26.mjs [--dry-run|--apply]\nPadrao: consulta e plano sem gravacao. --apply cria somente tags/campos ausentes na conta Hotel Solar. Nao executar em paralelo.');
    return;
  }
  if (args.length > 1 || (args.length && !['--dry-run', '--apply'].includes(args[0]))) {
    throw new SafeSetupError('Argumentos invalidos. Use --dry-run ou --apply.');
  }
  const key = readLocalKey();
  const result = await provision({
    request: createClient(key), apply: args[0] === '--apply',
    onEvent: (event) => console.error(JSON.stringify(event)),
  });
  // Report contains only approved names, IDs and counts; never raw API responses.
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof SafeSetupError ? error.message : 'Configuracao interrompida. Verifique o inventario antes de reaplicar.');
    process.exitCode = 1;
  });
}
