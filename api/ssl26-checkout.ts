import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Dedicated November route. It never forwards browser headers as authority. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ success: false });
  const secret = process.env.SOLAR_INGEST_SECRET || '';
  if (process.env.SSL26_CHECKOUT_ATTRIBUTION_ENABLED !== 'true' || secret.length < 32) {
    return res.status(503).json({ success: false, error: 'Checkout de novembro indisponível.' });
  }
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)
    || Buffer.byteLength(JSON.stringify(req.body)) > 16384) return res.status(400).json({ success: false });
  // Fail before any network call: this route never transports raw card data.
  if (['cardNumber', 'cardHolder', 'cardExpiryMonth', 'cardExpiryYear', 'cardCvv']
    .some(key => req.body[key] != null && req.body[key] !== '')) {
    return res.status(400).json({ success: false, error: 'Use a página de pagamento da Cielo.' });
  }
  try {
    const target = new URL(process.env.SOLAR_ERP_URL || 'https://erp-hotel-solar.vercel.app');
    if (target.protocol !== 'https:' || target.username || target.password || target.search || target.hash
      || target.pathname !== '/') throw new Error('invalid_server_configuration');
    const response = await fetch(new URL('/api/advance-packages/ingest', target), {
      method: 'POST', headers: { 'Content-Type': 'application/json',
        'x-solar-ingest-secret': secret, 'x-ssl26-checkout': 'ssl26_novembro_2026' },
      body: JSON.stringify(req.body), signal: AbortSignal.timeout(15000), redirect: 'error', cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok || data?.success !== true) return res.status(response.ok ? 502 : response.status).json({
      success: false, error: { carrinhoFechado: data?.carrinhoFechado === true,
        error: data?.carrinhoFechado === true ? 'Compra disponível de 25/11 às 8h até 01/12 às 23h59.' : 'Pedido não confirmado. Confira com a recepção.' },
    });
    return res.status(200).json({ success: true, id: data.id,
      checkoutUrl: typeof data.checkoutUrl === 'string' && /^https:\/\/cieloecommerce\.cielo\.com\.br\//.test(data.checkoutUrl) ? data.checkoutUrl : undefined,
      pagamentoIndisponivel: data.pagamentoIndisponivel === true || undefined,
    });
  } catch {
    // Never print the order, a provider response, a credential or a card.
    return res.status(502).json({ success: false, error: 'Não foi possível confirmar. Use o mesmo pedido ou fale com a recepção.' });
  }
}
