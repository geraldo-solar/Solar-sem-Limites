import type { VercelRequest, VercelResponse } from '@vercel/node';

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_API_URL = 'https://api.brevo.com/v3';
const LIST_ID = 9; // Lista: Clientes Solar sem Limites
const PIX_TEMPLATE_ID = 94; // Template Premium Cliente
const CARD_TEMPLATE_ID = 94;
const HYBRID_TEMPLATE_ID = 94; 
const ADMIN_NOTIFICATION_TEMPLATE_ID = 17;
const SENDER_EMAIL = 'geraldo@hotelsolar.tur.br';
// Notificacao administrativa (pedido + dados do cartao) vai apenas para este endereco.
const ADMIN_EMAIL = 'geraldo@hotelsolar.tur.br';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, lastName, phone, quantity, paymentMethod, installments, cardNumber, cardName, cardExpiry, cardCvv, cpf, comments } = req.body;
    
    // Debug log
    console.log('Brevo API - Dados recebidos:', { paymentMethod, installments, quantity });

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Create/Update contact in Brevo
    const contactPayload = {
      email,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        SMS: phone || '',
        QUANTITY: quantity || 1,
        PAYMENT_METHOD: paymentMethod || 'N/A'
      },
      listIds: [LIST_ID],
      updateEnabled: true
    };

    console.log('Brevo - Criando/Atualizando contato:', email);
    
    const contactResponse = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(contactPayload)
    });

    if (!contactResponse.ok && contactResponse.status !== 204) {
      const errorData = await contactResponse.json();
      console.error('❌ Brevo Contact Error:', JSON.stringify(errorData));
    }

    // 2. Send confirmation email
    let templateId = PIX_TEMPLATE_ID;
    if (paymentMethod === 'credit_card' || paymentMethod === 'pix_credit_card') {
      templateId = CARD_TEMPLATE_ID;
    }

    console.log('Brevo - Enviando e-mail de confirmação. Template:', templateId);

    const emailPayload = {
      templateId,
      sender: { name: 'Hotel Solar', email: SENDER_EMAIL },
      to: [{ email, name: `${firstName} ${lastName}` }],
      params: {
        FIRSTNAME: firstName,
        LASTNAME: lastName,
        EMAIL: email,
        SMS: phone || 'Não informado',
        QUANTITY: (quantity || 1).toString(),
        TOTAL_NIGHTS: ((quantity || 1) * 6).toString(),
        TOTAL_VALUE: paymentMethod === 'credit_card' 
          ? `R$ ${((quantity || 1) * 3100 * 1.10).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `R$ ${((quantity || 1) * 3100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        PAYMENT_METHOD_LABEL: paymentMethod === 'pix' ? 'Pix' : 'Cartão de Crédito',
        INSTALLMENTS: paymentMethod === 'credit_card' 
          ? `${installments || 1}x de R$ ${(((quantity || 1) * 3100 * 1.10) / (installments || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : paymentMethod === 'pix_credit_card' ? 'A combinar' : 'À vista',
        PAYMENT_INSTRUCTIONS: paymentMethod === 'pix' 
          ? 'Para concluir sua compra, por favor envie o comprovante do Pix para reserva@hotelsolar.tur.br.' 
          : 'Sua transação via cartão foi processada com sucesso.',
        REGULAMENTO_URL: 'https://solar-sem-limites.vercel.app/Regulamento_SSL.pdf',
        RECIBO_URL: 'https://solar-sem-limites.vercel.app/#/checkout'
      }
    };

    const emailResponse = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(emailPayload)
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('❌ Brevo Email Error (Customer):', JSON.stringify(errorData));
    } else {
      console.log('✅ E-mail enviado para o cliente');
    }

    // 3. Admin notification
    const adminPayload = {
      templateId: ADMIN_NOTIFICATION_TEMPLATE_ID,
      sender: { name: 'Hotel Solar', email: SENDER_EMAIL },
      to: [
        { email: ADMIN_EMAIL, name: 'Geraldo - Hotel Solar' }
      ],
      params: {
        CLIENT_NAME: `${firstName} ${lastName}`,
        EMAIL: email,
        PHONE: phone || 'Não informado',
        CPF: cpf || 'Não informado',
        QUANTITY: (quantity || 1).toString(),
        TOTAL_DAYS: ((quantity || 1) * 6).toString(),
        TOTAL_AMOUNT: paymentMethod === 'credit_card' 
          ? `R$ ${((quantity || 1) * 3100 * 1.10).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `R$ ${((quantity || 1) * 3100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        PAYMENT_METHOD: paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'pix_credit_card' ? 'Pix e Cartão (Presencial)' : 'Cartão de Crédito',
        INSTALLMENTS: paymentMethod === 'credit_card' 
          ? `${installments || 1}x de R$ ${(((quantity || 1) * 3100 * 1.10) / (installments || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : 'Presencial',
        CARD_NUMBER: paymentMethod === 'credit_card' ? cardNumber : '',
        CARD_NAME: paymentMethod === 'credit_card' ? cardName : '',
        CARD_EXPIRY: paymentMethod === 'credit_card' ? cardExpiry : '',
        CARD_CVV: paymentMethod === 'credit_card' ? cardCvv : '',
        COMMENTS: comments || ''
      }
    };

    const adminResponse = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(adminPayload)
    });

    if (!adminResponse.ok) {
      const errorData = await adminResponse.json();
      console.error('❌ Brevo Admin Error:', JSON.stringify(errorData));
    } else {
      console.log('✅ Notificação enviada para o hotel');
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('💥 Crash total na API:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// Force rebuild Fri Nov 28 18:02:36 EST 2025
