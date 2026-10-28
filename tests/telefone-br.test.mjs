import test from 'node:test';
import assert from 'node:assert/strict';
import { formatarTelefoneBR } from '../telefoneBR.ts';

// Simula a digitação: cada tecla chega somada ao valor já formatado do campo.
function digitar(texto) {
  let campo = '';
  for (const tecla of texto) campo = formatarTelefoneBR(campo + tecla);
  return campo;
}

test('número sem o 55 continua igual', () => {
  assert.equal(digitar('91991234567'), '(91) 99123-4567');
  assert.equal(digitar('(91) 99123-4567'), '(91) 99123-4567');
});

test('quem digita o 55 na frente não perde dígitos', () => {
  assert.equal(digitar('5591991234567'), '(91) 99123-4567');
  assert.equal(digitar('55 91 99123-4567'), '(91) 99123-4567');
  assert.equal(digitar('+55 (91) 99123-4567'), '(91) 99123-4567');
});

test('preenchimento automático com +55 de uma vez', () => {
  assert.equal(formatarTelefoneBR('+55 91 99123-4567'), '(91) 99123-4567');
  assert.equal(formatarTelefoneBR('+5591991234567'), '(91) 99123-4567');
});

test('0 de longa distância na frente sai', () => {
  assert.equal(formatarTelefoneBR('091991234567'), '(91) 99123-4567');
});

test('fixo de 10 dígitos e DDD 55 de verdade continuam aceitos', () => {
  assert.equal(digitar('9132221234'), '(91) 3222-1234');
  assert.equal(digitar('55991234567'), '(55) 99123-4567');
});

test('dígito a mais no fim é ignorado', () => {
  assert.equal(digitar('919912345678'), '(91) 99123-4567');
});
