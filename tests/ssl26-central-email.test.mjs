import test, {after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
const savedEnv={...process.env},savedFetch=globalThis.fetch,savedLog=console.log,savedError=console.error;
process.env.BREVO_API_KEY='synthetic-brevo-only';
const {default:handler,centralEmailEligibility}=await import('../api/capture-lead.ts');
const body={firstName:'Synthetic',email:'buyer@example.test',phone:'91999999999',consent:true,leadId:'synthetic-central-001'};
let calls,decisions,centralError,integrationError,contact,logs;
beforeEach(()=>{
  calls=[];decisions=['eligible','eligible'];centralError=false;integrationError=false;contact=null;logs=[];
  process.env.SSL26_CENTRAL_ELIGIBILITY_ENABLED='true';process.env.LEAD_WEBHOOK_TOKEN='synthetic-'.repeat(6);
  process.env.LEAD_WEBHOOK_URL='https://erp.example.test/api/ssl26/ingest';
  delete process.env.OPS_ALERT_EMAIL;delete process.env.META_CAPI_TOKEN;
  console.log=console.error=(...args)=>logs.push(args.join(' '));
  globalThis.fetch=async(url,options)=>{
    url=String(url);const payload=options.body?JSON.parse(options.body):null;calls.push({url,payload,options});
    if(url.endsWith('/api/ssl26/ingest'))return Response.json({success:!integrationError,persisted:!integrationError});
    if(url.endsWith('/api/ssl26/eligibility')){
      if(centralError)throw new Error('private-secret');
      return Response.json({success:true,requestId:payload.requestId,decision:decisions.shift()||'eligible',checkedAt:new Date().toISOString()});
    }
    if(options.method==='GET')return contact?Response.json(contact):new Response(null,{status:404});
    return new Response(null,{status:204});
  };
});
after(()=>{process.env=savedEnv;globalThis.fetch=savedFetch;console.log=savedLog;console.error=savedError;});
async function request(data=body){const result={};const res={setHeader(){},status(v){result.status=v;return res;},json(v){result.body=v;return res;}};await handler({method:'POST',body:data,headers:{}},res);return result;}
const writes=()=>calls.filter(c=>c.options.method==='POST'&&c.url.includes('api.brevo.com'));
test('central capture: persist first, check before list, recheck before email, one webhook and no raw identity in logs',async()=>{
  const result=await request();assert.equal(result.body.emailDelivery,'accepted');assert.equal(result.body.integration,'accepted');
  const sequence=calls.filter(c=>c.options.method==='POST').map(c=>new URL(c.url).pathname);
  assert.deepEqual(sequence,['/api/ssl26/ingest','/api/ssl26/eligibility','/v3/contacts','/api/ssl26/eligibility','/v3/smtp/email']);
  assert.ok(!logs.join().includes(body.email));assert.ok(!logs.join().includes('synthetic-brevo-only'));
});
for(const decision of ['blocked','review'])test(`central ${decision} holds Brevo writes and email even when provider tags are absent`,async()=>{
  decisions=[decision];const result=await request();assert.equal(result.status,200);assert.ok(result.body.profileToken);
  assert.equal(result.body.emailDelivery,decision==='blocked'?'suppressed':'failed');assert.equal(writes().length,0);
});
test('new hold between contact save and delivery prevents email and Meta',async()=>{
  process.env.META_CAPI_TOKEN='synthetic-meta-only';decisions=['eligible','blocked'];
  const result=await request();assert.equal(result.body.emailDelivery,'suppressed');
  assert.deepEqual(writes().map(c=>new URL(c.url).pathname),['/v3/contacts']);
  assert.ok(!calls.some(c=>c.url.includes('graph.facebook.com')));
});
test('central timeout and unconfirmed registration never use provider-only fallback',async()=>{
  centralError=true;assert.equal((await request()).body.emailDelivery,'failed');assert.equal(writes().length,0);
  centralError=false;integrationError=true;calls=[];const unconfirmed=await request();
  assert.equal(unconfirmed.status,503);assert.equal(unconfirmed.body.integration,'failed');
  assert.equal(unconfirmed.body.success,undefined);assert.equal(unconfirmed.body.profileToken,undefined);
  assert.ok(writes().every(c=>c.url.endsWith('/smtp/email')&&c.payload.to.every(to=>to.email!==body.email)));
  assert.ok(!calls.some(c=>c.url.endsWith('/eligibility')));
  assert.ok(writes().some(c=>c.payload.textContent?.includes('Não presumir cadastro salvo')));
});
test('provider phone mismatch requires review even with central eligibility; no overwrite',async()=>{
  contact={email:body.email,attributes:{SMS:'+5591888888888'},emailBlacklisted:false};
  assert.equal((await request()).body.emailDelivery,'failed');assert.equal(writes().length,0);
});
test('profile signed receipt is not a back door around a later central hold',async()=>{
  const captured=await request();decisions=['blocked'];calls=[];
  const result=await request({action:'profile',profileToken:captured.body.profileToken,profile:'conhece'});
  assert.equal(result.status,200);assert.equal(writes().length,0);assert.ok(calls.some(c=>c.url.endsWith('/api/ssl26/ingest')));
});
test('profile cannot overwrite a provider contact with a different phone',async()=>{
  const captured=await request();calls=[];
  contact={email:body.email,attributes:{SMS:'+5591888888888'},emailBlacklisted:false};
  assert.equal((await request({action:'profile',profileToken:captured.body.profileToken,profile:'conhece'})).status,200);
  assert.equal(writes().length,0);
});
test('request binding, freshness, malformed responses, revoked gate and bad URL all fail closed',async()=>{
  for(const mode of ['wrong_id','old','future','bad_status','bad_decision','disabled','redirect']){
    process.env.SSL26_CENTRAL_ELIGIBILITY_ENABLED='true';
    globalThis.fetch=async(url,options)=>{
      const payload=JSON.parse(options.body);
      if(mode==='disabled')process.env.SSL26_CENTRAL_ELIGIBILITY_ENABLED='false';
      if(mode==='redirect')return new Response(null,{status:302});
      return Response.json({success:mode!=='bad_status',requestId:mode==='wrong_id'?'wrong':payload.requestId,
        decision:mode==='bad_decision'?true:'eligible',checkedAt:new Date(Date.now()+(mode==='old'?-60000:mode==='future'?60000:0)).toISOString()});
    };
    assert.equal(await centralEmailEligibility(body.email,'+5591999999999'),'review',mode);
  }
  process.env.SSL26_CENTRAL_ELIGIBILITY_ENABLED='true';process.env.LEAD_WEBHOOK_URL='https://erp.example.test/other?token=unsafe';
  globalThis.fetch=async()=>{throw new Error('must not call');};assert.equal(await centralEmailEligibility(body.email,'+5591999999999'),'review');
});
