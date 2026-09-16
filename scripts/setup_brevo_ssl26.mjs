const API_URL = 'https://api.brevo.com/v3';
const API_KEY = process.env.BREVO_API_KEY;
const FOLDER_NAME = 'Solar Sem Limites 2026';
const LIST_NAME = 'SSL26_LEADS';
const ATTRIBUTES = [
  ['SSL26_PROFILE', 'text'],
  ['SSL26_SOURCE', 'text'],
  ['SSL26_CAMPAIGN', 'text'],
  ['SSL26_REFERRAL', 'text'],
  ['SSL26_CONSENT_AT', 'text'],
];

if (!API_KEY) {
  console.error('BREVO_API_KEY não encontrada. Execute este comando em um ambiente seguro com a chave carregada.');
  process.exit(1);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`${options.method || 'GET'} ${path} falhou (${response.status}): ${details.slice(0, 500)}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function findAcrossPages(path, property, predicate) {
  let offset = 0;
  const limit = 50;

  while (true) {
    const separator = path.includes('?') ? '&' : '?';
    const result = await request(`${path}${separator}limit=${limit}&offset=${offset}&sort=desc`);
    const items = Array.isArray(result[property]) ? result[property] : [];
    const match = items.find(predicate);
    if (match) return match;
    if (items.length < limit) return null;
    offset += limit;
  }
}

async function ensureFolder() {
  const existing = await findAcrossPages('/contacts/folders', 'folders', (folder) => folder.name === FOLDER_NAME);
  if (existing) return existing.id;

  const created = await request('/contacts/folders', {
    method: 'POST',
    body: JSON.stringify({ name: FOLDER_NAME }),
  });
  return created.id;
}

async function ensureList(folderId) {
  const existing = await findAcrossPages(
    `/contacts/folders/${folderId}/lists`,
    'lists',
    (list) => list.name === LIST_NAME,
  );
  if (existing) return existing.id;

  const created = await request('/contacts/lists', {
    method: 'POST',
    body: JSON.stringify({ folderId, name: LIST_NAME }),
  });
  return created.id;
}

async function ensureAttributes() {
  const result = await request('/contacts/attributes');
  const existingNames = new Set((result.attributes || []).map((attribute) => attribute.name));

  for (const [name, type] of ATTRIBUTES) {
    if (existingNames.has(name)) continue;
    await request(`/contacts/attributes/normal/${name}`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }
}

const folderId = await ensureFolder();
const listId = await ensureList(folderId);
await ensureAttributes();

console.log('Estrutura SSL26 pronta no Brevo.');
console.log(`BREVO_LEADS_LIST_ID=${listId}`);
console.log('BREVO_SSL26_ATTRIBUTES_ENABLED=true');
console.log('BREVO_PROFILE_ATTRIBUTE=SSL26_PROFILE');
