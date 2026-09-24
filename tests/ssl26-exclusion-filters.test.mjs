import test from 'node:test';
import assert from 'node:assert/strict';
import { SSL26_EXCLUSION_FILTERS as specs, inspectSsl26ExclusionFilter as inspect } from '../scripts/ssl26_exclusion_filters.mjs';

const now = Date.parse('2026-09-23T23:40:00Z');
const base = () => ({observedAt:new Date(now).toISOString(),identityMatch:true,complete:true});
const names = provider => specs[provider].conditions.map(c=>c.name);
const brevo = (attributes = {}) => ({...base(), attributes:{...Object.fromEntries(names('brevo').map(k=>[k,false])),...attributes}});
const manychat = (tags = []) => ({...base(),tags});

test('manifest names are explicit exclusions and cannot authorize dispatch', () => {
  assert.equal(specs.brevo.restrictToList,false);
  assert.equal(specs.manychat.restrictToLeadTag,false);
  assert.equal(specs.brevo.match,'any');
  assert.equal(specs.manychat.match,'any');
  assert.equal(specs.brevo.conditions.length,4);
  assert.equal(specs.manychat.conditions.length,6);
  for(const spec of Object.values(specs)){
    assert.match(spec.name,/não enviar/);
    assert.equal(spec.purpose,'acquisition_exclusion_only');
    assert.equal(Object.isFrozen(spec.conditions),true);
  }
});

for(const provider of ['brevo','manychat']){
  test(`${provider}: every combination is OR, not AND; absence never allows sending`, () => {
    const flags=names(provider);
    for(let mask=0;mask<2**flags.length;mask++){
      const set=flags.filter((_,i)=>mask & (1<<i));
      const s=provider==='brevo'?brevo(Object.fromEntries(set.map(k=>[k,true]))):manychat(set);
      const r=inspect(provider,s,now);
      assert.equal(r.status,set.length?'excluded':'no_marked_block');
      assert.deepEqual(r.blockedReasons,set);
      assert.equal(r.sendAllowed,false);
      assert.equal(r.centralEligibilityRequired,true);
    }
  });
  test(`${provider}: snapshot needs exact identity, completeness and freshness`, () => {
    const good=()=>provider==='brevo'?brevo():manychat();
    for(const patch of [{identityMatch:false},{identityMatch:'true'},{complete:false},{complete:undefined},{observedAt:undefined},{observedAt:'bad'},{observedAt:new Date(now+1).toISOString()},{observedAt:new Date(now-300001).toISOString()}]){
      assert.equal(inspect(provider,{...good(),...patch},now).status,'review');
    }
    assert.equal(inspect(provider,good(),NaN).status,'review');
  });
  test(`${provider}: holds still exclude if the snapshot also needs review`,()=>{
    const s=provider==='brevo'?{attributes:{SSL26_OPT_OUT:true}}:{tags:['SSL26_OPT_OUT']};
    const r=inspect(provider,s,now);
    assert.equal(r.status,'excluded');assert.ok(r.reviewReasons.length>0);assert.equal(r.sendAllowed,false);
  });
  test(`${provider}: no personal data in output; input remains unchanged`,()=>{
    const s={...(provider==='brevo'?brevo():manychat()),email:'synthetic@example.test',phone:'+5511999999999'};
    const before=JSON.stringify(s),out=JSON.stringify(inspect(provider,s,now));
    assert.equal(JSON.stringify(s),before);assert.equal(out.includes('synthetic'),false);assert.equal(out.includes('5511999999999'),false);
  });
}
test('Brevo: missing, null, string booleans, numbers and inherited attributes require review',()=>{
  for(const key of names('brevo'))for(const value of [undefined,null,'true','false',0,1]){
    assert.equal(inspect('brevo',brevo({[key]:value}),now).status,'review');
  }
  assert.equal(inspect('brevo',{...base(),attributes:{}},now).status,'review');
  assert.equal(inspect('brevo',{...base(),attributes:Object.create(brevo().attributes)},now).status,'review');
});
test('ManyChat: legacy support and unconfirmed pause each independently exclude',()=>{
  for(const tag of ['ATENDIMENTO_HOTEL_ATIVO','SSL26_PAUSA_REVISAO'])assert.equal(inspect('manychat',manychat([tag]),now).status,'excluded');
});
test('ManyChat: invalid or missing tag snapshot requires review',()=>{
  for(const tags of [undefined,null,'SSL26_LEAD',[null],[{}],['']])assert.equal(inspect('manychat',{...base(),tags},now).status,'review');
});
test('lead/capture/click/pending-order tags do not prove exclusion or permission',()=>{
  const r=inspect('manychat',manychat(['SSL26_LEAD','SSL26_CAPTADO','SSL26_CANAL_VIP_CLICK','SSL26_PAGAMENTO_PENDENTE']),now);
  assert.equal(r.status,'no_marked_block');assert.equal(r.sendAllowed,false);
});
test('unknown provider is rejected; null snapshots stay in review',()=>{
  for(const p of ['sms','__proto__','constructor'])assert.throws(()=>inspect(p,{},now),/unsupported_provider/);
  for(const p of ['brevo','manychat'])assert.equal(inspect(p,null,now).status,'review');
});
