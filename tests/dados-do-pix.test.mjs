import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

// Os dados do Pix aparecem em dois lugares: na tela do checkout e no e-mail
// de pedido recebido, montado pelo ERP. Se a conta mudar num só, o cliente
// paga para a conta errada. Este teste falha quando os dois divergem.
const TELA = new URL('../Checkout-Solar-sem-Limites/components/CheckoutForm.tsx', import.meta.url);
const EMAIL = new URL('../../ERP Hotel Solar/src/lib/advancePackages/conteudoDoPedidoRecebido.ts', import.meta.url);

test('dados do Pix iguais na tela e no e-mail', { skip: existsSync(EMAIL) ? false : 'ERP ausente' }, () => {
  const tela = readFileSync(TELA, 'utf8');
  const email = readFileSync(EMAIL, 'utf8');
  // Sem o ponto final da frase, que a leitura do e-mail pega junto.
  const pegar = (texto, re) => (texto.match(re) || [])[1]?.replace(/\.$/, '');
  const campos = {
    chave: [/Chave: <span[^>]*>(\d+)</, /PIX_CHAVE: "(\d+)"/],
    cnpj: [/CNPJ: ([\d./-]+)/, /PIX_CNPJ: "([\d./-]+)"/],
    agencia: [/Agência: (\d+)/, /PIX_AGENCIA: "(\d+)"/],
    conta: [/Conta Corrente: ([\d-]+)/, /PIX_CONTA: "([\d-]+)"/],
    operacao: [/Op: (\d+)/, /PIX_OPERACAO: "(\d+)"/],
  };
  for (const [nome, [naTela, noEmail]] of Object.entries(campos)) {
    const a = pegar(tela, naTela);
    const b = pegar(email, noEmail);
    assert.ok(a, `${nome} nao encontrado na tela`);
    assert.equal(b, a, `${nome} diferente entre a tela e o e-mail`);
  }
});
