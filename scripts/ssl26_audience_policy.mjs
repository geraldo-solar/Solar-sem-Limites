// Read-only audit policy. This module cannot enroll, send, or authorize dispatch.
// Inputs are normalized evidence, never names, addresses, phone numbers or keys.
export const AUDIENCE_POLICY_VERSION = 'ssl26_audience_audit_v1';
const MAX_AGE_MS = 5 * 60 * 1000;
const flag = value => typeof value === 'boolean';

export function inspectSsl26Audience(evidence = {}, now = Date.now()) {
  const blocked = [];
  const review = [];
  const observed = Date.parse(evidence.observedAt ?? '');
  if (!Number.isFinite(now) || !Number.isFinite(observed) || observed > now || now - observed > MAX_AGE_MS) review.push('snapshot_not_current');
  for (const [key, reason] of [['qa', 'internal_test'], ['optedOut', 'campaign_opt_out'], ['paused', 'human_support'], ['purchased', 'campaign_buyer']]) {
    if (evidence[key] === true) blocked.push(reason);
    else if (evidence[key] !== false) review.push(`${key}_unknown`);
  }
  for (const key of ['qaRegistry', 'supportCoverage', 'purchaseCoverage']) {
    if (evidence[key] !== true) review.push(`${key}_not_homologated`);
  }
  const result = (channel, welcome = false) => {
    const b = [...blocked], r = [...review];
    const data = evidence[channel] ?? {};
    const requireTrue = (value, reason) => { if (value !== true) r.push(reason); };
    const denyTrue = (value, reason) => {
      if (value === true) b.push(reason);
      else if (!flag(value)) r.push(`${reason}_unknown`);
    };
    if (data.consentValid === false) b.push('channel_consent_invalid');
    else requireTrue(data.consentValid, 'channel_consent_unknown');
    requireTrue(data.identityMatch, 'channel_identity_unverified');
    requireTrue(data.present, 'provider_contact_missing');
    if (channel === 'email') {
      denyTrue(data.blacklisted, 'email_blacklisted');
      denyTrue(data.listUnsubscribed, 'email_list_unsubscribed');
      requireTrue(data.listMember, 'campaign_list_membership_missing');
    } else {
      if (data.optedIn === false) b.push('whatsapp_not_opted_in');
      else requireTrue(data.optedIn, 'whatsapp_opt_in_unknown');
      requireTrue(data.leadTagged, 'campaign_lead_tag_missing');
      requireTrue(data.capturedTagged, 'campaign_capture_tag_missing');
      requireTrue(data.consentMatched, 'provider_consent_unverified');
      if (welcome) {
        if (['reserved', 'dispatching', 'accepted', 'unknown', 'blocked'].includes(evidence.welcomeState)) b.push('welcome_already_recorded');
        else if (evidence.welcomeState !== 'none') r.push('welcome_history_unknown');
      }
    }
    return {
      status: b.length ? 'blocked' : r.length ? 'review' : 'candidate_not_authorized',
      sendAllowed: false,
      blockedReasons: [...new Set(b)], reviewReasons: [...new Set(r)],
    };
  };
  return {
    policyVersion: AUDIENCE_POLICY_VERSION,
    emailAcquisition: result('email'), whatsappAcquisition: result('whatsapp'), whatsappWelcome: result('whatsapp', true),
  };
}

export function summarizeSsl26Audience(rows, now = Date.now()) {
  const channels = Object.fromEntries(['emailAcquisition', 'whatsappAcquisition', 'whatsappWelcome'].map(name => [name, {
    blocked: 0, review: 0, candidate_not_authorized: 0, blockedReasons: {}, reviewReasons: {},
  }]));
  for (const row of rows) {
    const result = inspectSsl26Audience(row, now);
    for (const [name, counts] of Object.entries(channels)) {
      const channel = result[name]; counts[channel.status]++;
      for (const category of ['blockedReasons', 'reviewReasons']) {
        for (const reason of channel[category]) counts[category][reason] = (counts[category][reason] ?? 0) + 1;
      }
    }
  }
  return { policyVersion: AUDIENCE_POLICY_VERSION, records: rows.length, channels, readOnly: true, sendAllowed: false };
}
