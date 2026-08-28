import type { VercelRequest, VercelResponse } from '@vercel/node';

// Repassa o pedido para o ERP (substitui o link do Google Apps Script, que
// morreu e parou de receber pedidos sem ninguém perceber). O segredo de
// ingestão fica só aqui, no servidor — o navegador nunca vê essa chave,
// diferente de uma chamada direta do cliente ao ERP.
const ERP_URL = process.env.SOLAR_ERP_URL || 'https://erp-hotel-solar.vercel.app';
const SOLAR_INGEST_SECRET = process.env.SOLAR_INGEST_SECRET || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SOLAR_INGEST_SECRET) {
    console.error('SOLAR_INGEST_SECRET não configurada — pedido não foi sincronizado com o ERP.');
    return res.status(500).json({ success: false, error: 'Sincronização com o ERP não configurada' });
  }

  try {
    // O CVV nao e necessario para montar a referencia protegida no ERP e
    // nunca deve atravessar mais sistemas do que o estritamente necessario.
    const erpPayload = { ...(req.body || {}) };
    delete erpPayload.cardCvv;
    const erpResponse = await fetch(`${ERP_URL}/api/advance-packages/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-solar-ingest-secret': SOLAR_INGEST_SECRET,
      },
      body: JSON.stringify(erpPayload),
    });

    const data = await erpResponse.json();

    if (!erpResponse.ok) {
      console.error('❌ Erro ao sincronizar pedido com o ERP:', data);
      return res.status(erpResponse.status).json({ success: false, error: data });
    }

    console.log('✅ Pedido sincronizado com o ERP:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('❌ Erro na sincronização com o ERP:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
