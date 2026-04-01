// Use Google Sheets API to read data
const SPREADSHEET_ID = '1gadR_c-fLhfbDpgZB9abcFA0e7F9febcHIB4_p5Rk60';
const SHEET_NAME = 'Página 1';
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY || 'AIzaSyBqKZlwWXjhGqZq1_-3VpJQqmqKEfDqKPMmZ5Hs6Zt-F0xAd';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Buscando pedidos do Google Sheets...');
    
    // Fetch data from Google Sheets using Sheets API v4
    const range = `${SHEET_NAME}!A2:N1000`; // Read from row 2 to 1000 (skip header)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error('❌ Erro ao buscar do Google Sheets:', response.status);
      const errorText = await response.text();
      console.error('Erro detalhado:', errorText);
      throw new Error(`Failed to fetch from Google Sheets: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    console.log(`✅ ${rows.length} linhas encontradas`);
    
    // Transform rows into order objects
    const orders = rows.map((row) => {
      // Row structure: [date, id, name, email, phone, cpf, quantity, total, paymentMethod, status, paymentDetails]
      const [date, id, name, email, phone, cpf, quantity, total, paymentMethod, status, paymentDetails] = row;
      
      // Split name into firstName and lastName
      const nameParts = (name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Parse quantity
      const qty = parseInt(quantity) || 1;
      
      // Determine installments from paymentDetails
      let installments = 1;
      if (paymentMethod === 'Cartão' && paymentDetails) {
        const match = paymentDetails.match(/(\d+)x/);
        if (match) {
          installments = parseInt(match[1]);
        }
      }
      
      return {
        id: id || `order-${Date.now()}`,
        firstName,
        lastName,
        email: email || '',
        phone: phone || '',
        cpf: cpf || '',
        quantity: qty,
        paymentMethod: paymentMethod === 'Cartão' ? 'credit_card' : 'pix',
        installments,
        paymentStatus: status || 'pending',
        createdAt: date || new Date().toISOString(),
        cardNumber: paymentDetails?.includes('Final:') ? paymentDetails.split('Final:')[1]?.trim() : undefined
      };
    });
    
    // Sort by newest first
    orders.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    return res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('❌ Erro na API get-orders:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      orders: []
    });
  }
}
