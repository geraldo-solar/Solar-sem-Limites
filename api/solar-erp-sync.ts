import type { VercelRequest, VercelResponse } from '@vercel/node';

// Funcao da publicacao feita a partir da raiz do repositorio. O segredo de
// ingestao permanece no servidor e nunca e enviado ao navegador.
const ERP_URL = process.env.SOLAR_ERP_URL || 'https://erp-hotel-solar.vercel.app';
const SOLAR_INGEST_SECRET = process.env.SOLAR_INGEST_SECRET || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SOLAR_INGEST_SECRET) {
    console.error('SOLAR_INGEST_SECRET nao configurada — pedido nao foi sincronizado com o ERP.');
    return res.status(500).json({ success: false, error: 'Sincronizacao com o ERP nao configurada' });
  }

  try {
    // CVV nunca e encaminhado ao ERP nem armazenado no cofre.
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
      console.error('Erro ao sincronizar pedido com o ERP:', data);
      return res.status(erpResponse.status).json({ success: false, error: data });
    }

    console.log('Pedido sincronizado com o ERP:', data.id);
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Erro na sincronizacao com o ERP:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
