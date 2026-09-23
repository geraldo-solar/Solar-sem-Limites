import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

const ler = (arquivo) => readFileSync(new URL(`../${arquivo}`, import.meta.url), 'utf8');

test('versão aceita no checkout é a impressa no regulamento e na política', () => {
  const versao = ler('versaoDoRegulamento.ts').match(/VERSAO_DO_REGULAMENTO = '(\d{4})-(\d{2})-(\d{2})'/);
  assert.ok(versao, 'constante no formato AAAA-MM-DD');
  const [, ano, mes, dia] = versao;
  const impressa = `Versão de ${dia}/${mes}/${ano}`;
  assert.ok(ler('Regulamento_SSL.html').includes(impressa), `rodapé do regulamento com "${impressa}"`);
  assert.ok(ler('Checkout-Solar-sem-Limites/components/CheckoutForm.tsx').includes(`${impressa} do regulamento`), 'fim da política do checkout');
  assert.ok(ler('CheckoutPage.tsx').includes('aceite: { versao: VERSAO_DO_REGULAMENTO }'), 'pedido leva a versão');
});

test('regulamento, política e página dizem o mesmo sobre indicação e devolução', () => {
  const reg = ler('Regulamento_SSL.html');
  const pol = ler('Checkout-Solar-sem-Limites/components/CheckoutForm.tsx');
  const pag = ler('VendasNovembro.tsx');
  for (const texto of [reg, pol]) {
    assert.match(texto, /liberada 30 dias após a compra do indicado/);
    assert.match(texto, /Limite de 5 diárias de indicação por CPF/);
    assert.match(texto, /acréscimo de 10% referente à operadora do cartão não é devolvido/);
  }
  assert.match(pag, /liberada 30 dias após a compra do/);
  assert.match(pag, /acréscimo de 10% da operadora não é devolvido/);
  assert.doesNotMatch(pag, /liberado somente depois que o pagamento do indicado for aprovado/);
});

test('aviso de privacidade publicado e ligado na captação, na página de vendas e no checkout', () => {
  const aviso = ler('public/privacidade.html');
  assert.match(aviso, /CNPJ 97\.519\.659\/0001-90/);
  assert.match(aviso, /reserva@hotelsolar\.tur\.br/);
  assert.match(aviso, /por 5 anos/);
  assert.match(aviso, /não recebe nem guarda o número/);
  const url = ler('avisoDePrivacidade.ts').match(/'(https:\/\/[^']+privacidade\.html)'/)[1];
  assert.ok(ler('CapturaNovembro.tsx').includes('AVISO_DE_PRIVACIDADE_URL'), 'captação');
  assert.ok(ler('VendasNovembro.tsx').includes('AVISO_DE_PRIVACIDADE_URL'), 'página de vendas');
  const checkout = ler('Checkout-Solar-sem-Limites/components/CheckoutForm.tsx');
  assert.ok(checkout.includes(url), 'checkout');
  assert.doesNotMatch(checkout, /não serão utilizados para outras finalidades/, 'frase antiga saiu');
});
