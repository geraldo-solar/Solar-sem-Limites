// Local specification/checker only: no provider API, credentials, contact edits
// or dispatch. A saved provider filter is one layer, never a send authorization.
export const FILTER_VERSION = 'ssl26_exclusion_filters_v1';
const markers = ['SSL26_QA', 'SSL26_OPT_OUT', 'SSL26_ATENDIMENTO_PAUSA', 'SSL26_COMPRADOR'];
export const SSL26_EXCLUSION_FILTERS = Object.freeze({
  brevo: Object.freeze({
    name: 'SSL26 | Exclusões - não enviar',
    purpose: 'acquisition_exclusion_only',
    match: 'any',
    restrictToList: false,
    conditions: Object.freeze(markers.map(name => Object.freeze({ kind: 'boolean_attribute', name, value: true }))),
  }),
  manychat: Object.freeze({
    name: 'SSL26 | Exclusões - não enviar',
    purpose: 'acquisition_exclusion_only',
    match: 'any',
    restrictToLeadTag: false,
    conditions: Object.freeze([...markers, 'ATENDIMENTO_HOTEL_ATIVO', 'SSL26_PAUSA_REVISAO']
      .map(name => Object.freeze({ kind: 'tag_present', name }))),
  }),
});

/** Inspect one normalized, identity-checked snapshot without returning personal
 * input. Empty/missing data is not false. Positive holds win over uncertainty.
 * `no_marked_block` describes only this mirror, not central eligibility. */
export function inspectSsl26ExclusionFilter(provider, snapshot = {}, now = Date.now()) {
  if (!Object.hasOwn(SSL26_EXCLUSION_FILTERS, provider)) throw new Error('unsupported_provider');
  const spec = SSL26_EXCLUSION_FILTERS[provider];
  const blockedReasons = [], reviewReasons = [];
  const data = snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) ? snapshot : {};
  const observed = typeof data.observedAt === 'string' ? Date.parse(data.observedAt) : NaN;
  if (!Number.isFinite(now) || !Number.isFinite(observed) || observed > now || now - observed > 300_000) reviewReasons.push('snapshot_not_current');
  if (data.identityMatch !== true) reviewReasons.push('identity_not_verified');
  if (data.complete !== true) reviewReasons.push('snapshot_incomplete');
  if (provider === 'brevo') {
    const attrs = data.attributes && typeof data.attributes === 'object' && !Array.isArray(data.attributes) ? data.attributes : {};
    for (const { name } of spec.conditions) {
      const value = Object.hasOwn(attrs, name) ? attrs[name] : undefined;
      if (value === true) blockedReasons.push(name);
      else if (value !== false) reviewReasons.push(`${name}_not_known_false`);
    }
  } else {
    const tags = Array.isArray(data.tags) ? data.tags : [];
    if (!Array.isArray(data.tags) || tags.some(t => typeof t !== 'string' || !t.trim())) reviewReasons.push('tags_invalid');
    for (const { name } of spec.conditions) if (tags.includes(name)) blockedReasons.push(name);
  }
  return {
    filterVersion: FILTER_VERSION, provider,
    status: blockedReasons.length ? 'excluded' : reviewReasons.length ? 'review' : 'no_marked_block',
    blockedReasons, reviewReasons,
    centralEligibilityRequired: true,
    sendAllowed: false,
  };
}
