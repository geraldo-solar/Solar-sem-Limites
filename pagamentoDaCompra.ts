// Volta da página de pagamento da Cielo (decisão de 02/11/2026, a mesma do
// Motor de Reservas). O ERP pede à Cielo que devolva o comprador em
// /solarsemlimites2027?pagamento=<id da compra>#/obrigado; a tela de retorno
// usa o id só para saber qual pagamento conferir. Quem diz se pagou é a
// consulta do ERP à Cielo, nunca o endereço.

export const ERP_URL = 'https://erp-hotel-solar.vercel.app';

const CHAVE = 'ssl26_pagamento_cielo';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** A Cielo decidiu que não houve pagamento: não adianta esperar mais. */
const RECUSADO = new Set(['negado', 'expirado', 'cancelado']);

export type SituacaoDaCompra = {
  /** A equipe já aprovou a compra no PCDA. */
  compraAprovada: boolean;
  /** Pix + cartão: a entrada é paga no Pix, fora da Cielo. */
  entradaNoPix: boolean;
  /** `null` enquanto a Cielo não registrou tentativa. */
  pagamento: null | {
    situacao: string;
    texto: string;
    divergencia: string | null;
    parcelas: number | null;
    bandeira: string | null;
    final: string | null;
    podeTentarDeNovo: boolean;
  };
};

export type Desfecho = 'pago' | 'recusado' | 'em_aberto';

export function desfechoDoPagamento(s: SituacaoDaCompra): Desfecho {
  if (s.compraAprovada || (s.pagamento?.situacao === 'pago' && !s.pagamento.divergencia)) return 'pago';
  if (s.pagamento && RECUSADO.has(s.pagamento.situacao)) return 'recusado';
  return 'em_aberto';
}

/**
 * Qual compra conferir na volta: a do endereço ou, se a Cielo voltar sem ele
 * (página antiga, botão "voltar"), a guardada antes de sair para a Cielo.
 */
export function pedidoDaVolta(search: string, guardado: string | null): string | null {
  const doEndereco = new URLSearchParams(search).get('pagamento');
  if (doEndereco && UUID.test(doEndereco)) return doEndereco;
  return guardado && UUID.test(guardado) ? guardado : null;
}

export function guardarPedidoParaAVolta(id: string | undefined) {
  try { if (id && UUID.test(id)) window.sessionStorage.setItem(CHAVE, id); } catch { /* aba anônima */ }
}

export function esquecerPedidoDaVolta() {
  try { window.sessionStorage.removeItem(CHAVE); } catch { /* aba anônima */ }
}

export function lerPedidoDaVolta(): string | null {
  let guardado: string | null = null;
  try { guardado = window.sessionStorage.getItem(CHAVE); } catch { /* aba anônima */ }
  return pedidoDaVolta(window.location.search, guardado);
}

/** `'erro'` quando a consulta falhou: rede, ERP fora ou pedido desconhecido. */
export async function consultarPagamentoDaCompra(id: string): Promise<SituacaoDaCompra | 'erro'> {
  try {
    const r = await fetch(`${ERP_URL}/api/advance-packages/pagamento-cartao?purchaseId=${encodeURIComponent(id)}`, { cache: 'no-store' });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d?.ok !== true) return 'erro';
    return { compraAprovada: d.compraAprovada === true, entradaNoPix: d.entradaNoPix === true, pagamento: d.pagamento ?? null };
  } catch {
    return 'erro';
  }
}

/** Rota do ERP que confere de novo na Cielo e só então abre outra página. */
export const linkParaTentarDeNovo = (id: string) =>
  `${ERP_URL}/api/advance-packages/pagamento-cartao/abrir?purchaseId=${encodeURIComponent(id)}`;
