import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectSsl26Audience, summarizeSsl26Audience } from '../scripts/ssl26_audience_policy.mjs';
const now = Date.parse('2026-09-21T17:00:00Z');
const valid = () => ({
  observedAt: new Date(now - 1000).toISOString(), qa: false, optedOut: false, paused: false, purchased: false,
  qaRegistry: true, supportCoverage: true, purchaseCoverage: true, welcomeState: 'none',
  email: { present: true, identityMatch: true, consentValid: true, blacklisted: false, listUnsubscribed: false, listMember: true },
  whatsapp: { present: true, identityMatch: true, consentValid: true, optedIn: true, leadTagged: true, capturedTagged: true, consentMatched: true },
});
const channels = ['emailAcquisition', 'whatsappAcquisition', 'whatsappWelcome'];
test('complete current evidence is a candidate, never authorization to send', () => {
  for (const c of channels) {
    const result = inspectSsl26Audience(valid(), now)[c];
    assert.equal(result.status, 'candidate_not_authorized'); assert.equal(result.sendAllowed, false);
  }
});
for (const [field, reason] of [['qa', 'internal_test'], ['optedOut', 'campaign_opt_out'], ['paused', 'human_support'], ['purchased', 'campaign_buyer']]) {
  test(`${field} blocks both acquisition channels`, () => {
    const row = { ...valid(), [field]: true };
    for (const c of channels) { const r = inspectSsl26Audience(row, now)[c]; assert.equal(r.status, 'blocked'); assert.ok(r.blockedReasons.includes(reason)); }
  });
  test(`${field} missing is unknown, not permission`, () => {
    const row = valid(); delete row[field];
    assert.equal(inspectSsl26Audience(row, now).emailAcquisition.status, 'review');
  });
}
for (const field of ['qaRegistry', 'supportCoverage', 'purchaseCoverage']) {
  test(`incomplete ${field} requires review`, () => {
    const row = { ...valid(), [field]: false };
    for (const c of channels) assert.equal(inspectSsl26Audience(row, now)[c].status, 'review');
  });
}
for (const observedAt of [undefined, 'invalid', '2026-09-21T16:54:59Z', '2026-09-21T17:00:01Z']) {
  test(`non-current snapshot ${observedAt} cannot become candidate`, () => {
    for (const c of channels) assert.equal(inspectSsl26Audience({ ...valid(), observedAt }, now)[c].status, 'review');
  });
}
test('a known withdrawal remains blocked even with unavailable evidence', () => {
  assert.equal(inspectSsl26Audience({ optedOut: true }, now).emailAcquisition.status, 'blocked');
});
test('global email blacklist and list-level unsubscribe only block email', () => {
  for (const key of ['blacklisted', 'listUnsubscribed']) {
    const row = valid(); row.email[key] = true;
    const r = inspectSsl26Audience(row, now); assert.equal(r.emailAcquisition.status, 'blocked'); assert.equal(r.whatsappAcquisition.status, 'candidate_not_authorized');
  }
});
test('unknown email blacklist/unsubscribe is not silently treated as false', () => {
  for (const key of ['blacklisted', 'listUnsubscribed']) {
    const row = valid(); delete row.email[key]; assert.equal(inspectSsl26Audience(row, now).emailAcquisition.status, 'review');
  }
});
test('email list membership alone does not establish consent or identity', () => {
  const r = inspectSsl26Audience({ ...valid(), email: { listMember: true } }, now);
  assert.equal(r.emailAcquisition.status, 'review');
});
test('email absent from the campaign list is not exportable', () => {
  const row = valid(); row.email.listMember = false; assert.equal(inspectSsl26Audience(row, now).emailAcquisition.status, 'review');
});
test('withdrawn WhatsApp opt-in does not falsely blacklist email', () => {
  const row = valid(); row.whatsapp.optedIn = false; const r = inspectSsl26Audience(row, now);
  assert.equal(r.whatsappAcquisition.status, 'blocked'); assert.equal(r.emailAcquisition.status, 'candidate_not_authorized');
});
test('WhatsApp tags without consent evidence do not establish eligibility', () => {
  const row = valid(); row.whatsapp.consentMatched = false;
  assert.equal(inspectSsl26Audience(row, now).whatsappAcquisition.status, 'review');
});
test('bad identity and missing provider contact require review independently per channel', () => {
  for (const channel of ['email', 'whatsapp']) for (const key of ['identityMatch', 'present']) {
    const row = valid(); row[channel][key] = false;
    assert.equal(inspectSsl26Audience(row, now)[channel === 'email' ? 'emailAcquisition' : 'whatsappAcquisition'].status, 'review');
  }
});
test('recorded welcome blocks another welcome, not subsequent campaign content by itself', () => {
  for (const state of ['reserved', 'dispatching', 'accepted', 'unknown', 'blocked']) {
    const r = inspectSsl26Audience({ ...valid(), welcomeState: state }, now);
    assert.equal(r.whatsappWelcome.status, 'blocked'); assert.equal(r.whatsappAcquisition.status, 'candidate_not_authorized');
  }
});
test('unknown welcome history never permits a first welcome', () => {
  assert.equal(inspectSsl26Audience({ ...valid(), welcomeState: undefined }, now).whatsappWelcome.status, 'review');
});
test('invalid consent and string boolean values fail closed', () => {
  const row = valid(); row.email.consentValid = false; row.whatsapp.optedIn = 'true'; row.purchased = 'false';
  const r = inspectSsl26Audience(row, now); assert.equal(r.emailAcquisition.status, 'blocked'); assert.equal(r.whatsappAcquisition.status, 'review');
});
test('aggregate contains counts and reasons, never extra personal input or send permissions', () => {
  const rows = [valid(), { ...valid(), qa: true, emailAddress: 'private@example.test' }, { ...valid(), purchased: null }];
  const before = JSON.stringify(rows); const summary = summarizeSsl26Audience(rows, now);
  assert.equal(summary.records, 3); assert.equal(summary.channels.emailAcquisition.blocked, 1);
  assert.equal(summary.channels.emailAcquisition.review, 1); assert.equal(summary.channels.emailAcquisition.candidate_not_authorized, 1);
  assert.equal(summary.sendAllowed, false); assert.equal(JSON.stringify(summary).includes('private@example.test'), false);
  assert.equal(JSON.stringify(rows), before);
});
test('empty audience stays empty and cannot authorize sending', () => {
  const r = summarizeSsl26Audience([], now); assert.equal(r.records, 0); assert.equal(r.sendAllowed, false);
});
