import test from 'node:test';
import assert from 'node:assert/strict';
import {after} from 'node:test';
import handler from '../api/ssl26-checkout.ts';
import {nextCampaignOrder} from '../identidadePedidoNovembro.ts';
const originalFetch=globalThis.fetch, originalEnv={...process.env};
after(()=>{globalThis.fetch=originalFetch;process.env=originalEnv;});
async function request(body={},method='POST') {const result={headers:{}};const res={setHeader(k,v){result.headers[k]=v;},status(v){result.status=v;return res;},json(v){result.body=v;return res;}};await handler({method,body,headers:{'x-ssl26-checkout':'forged'}},res);return result;}
test('dedicated proxy disabled by default, refuses malformed input and never calls providers',async()=>{
  let calls=0;globalThis.fetch=async()=>{calls++;throw new Error('unexpected');};delete process.env.SSL26_CHECKOUT_ATTRIBUTION_ENABLED;
  assert.equal((await request()).status,503);assert.equal((await request({},'GET')).status,405);
  process.env.SSL26_CHECKOUT_ATTRIBUTION_ENABLED='true';process.env.SOLAR_INGEST_SECRET='test-'.repeat(10);
  for(const body of [null,[],{comment:'x'.repeat(17000)}, {cardCvv:'synthetic'}, {cardNumber:'synthetic'}])assert.equal((await request(body)).status,400);
  assert.equal(calls,0);
});
test('proxy supplies fixed server scope, no browser credential/authority, safe Cielo response and no raw upstream errors',async()=>{
  process.env.SSL26_CHECKOUT_ATTRIBUTION_ENABLED='true';process.env.SOLAR_INGEST_SECRET='test-'.repeat(10);process.env.SOLAR_ERP_URL='https://erp.example.test';
  let sent;globalThis.fetch=async(url,options)=>{sent={url:String(url),options};return Response.json({success:true,id:'id',checkoutUrl:'https://cieloecommerce.cielo.com.br/transactional/order/test',private:'never'});};
  const result=await request({id:'synthetic'});assert.equal(result.status,200);assert.equal(result.headers['Cache-Control'],'no-store');
  assert.equal(sent.options.headers['x-ssl26-checkout'],'ssl26_novembro_2026');assert.equal(sent.options.redirect,'error');
  assert.ok(!JSON.stringify(result).includes('never'));assert.ok(!JSON.stringify(result).includes(process.env.SOLAR_INGEST_SECRET));
  globalThis.fetch=async()=>Response.json({error:'private response',carrinhoFechado:true},{status:409});
  const closed=await request();assert.equal(closed.status,409);assert.equal(closed.body.error.carrinhoFechado,true);assert.ok(!JSON.stringify(closed).includes('private response'));
  globalThis.fetch=async()=>{throw new Error('private response');};assert.equal((await request()).status,502);
});
test('retry preserves ID and receipt time; changed buyer/payment/quantity creates another order',async()=>{
  const body={firstName:'Synthetic',lastName:'Buyer',cpf:'00000000000',email:'buyer@example.test',phone:'91999999999',quantity:1,paymentMethod:'pix'};
  let ids=0;const id=()=>String(++ids),now=()=>'2026-11-25T12:00:00Z';
  const first=nextCampaignOrder(null,body,id,now);assert.equal(nextCampaignOrder(first,{...body},id,now),first);assert.equal(ids,1);
  for(const change of [{email:'other@example.test'},{phone:'91988888888'},{cpf:'11111111111'},{quantity:2},{paymentMethod:'credit_card'}])assert.notEqual(nextCampaignOrder(first,{...body,...change},id,now).id,first.id);
  const split=nextCampaignOrder(null,{...body,paymentMethod:'pix_credit_card',splitPercent:30},id,now);
  assert.notEqual(nextCampaignOrder(split,{...body,paymentMethod:'pix_credit_card',splitPercent:50},id,now).id,split.id);
});
