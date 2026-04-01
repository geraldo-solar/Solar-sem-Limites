import { CustomerData } from '../types';
import { UNIT_PRICE, CREDIT_CARD_SURCHARGE, formatCurrency } from '../constants';

interface NotifyStatusParams {
  orderId: string;
  status: 'approved' | 'rejected';
  customerData: CustomerData;
}

export async function notifyPaymentStatus(params: NotifyStatusParams): Promise<void> {
  const { orderId, status, customerData } = params;

  // Calcular valor total
  const baseValue = customerData.quantity * UNIT_PRICE;
  const totalValue = customerData.paymentMethod === 'credit_card' 
    ? baseValue * (1 + CREDIT_CARD_SURCHARGE)
    : baseValue;

  // Calcular total de diárias (6 diárias por pacote)
  const totalNights = customerData.quantity * 6;

  try {
    const response = await fetch('/api/notify-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        status,
        customerData: {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          quantity: customerData.quantity,
          totalValue: formatCurrency(totalValue),
          totalNights
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Falha ao enviar notificação');
    }

    const result = await response.json();
    console.log(`✅ Notificação de ${status} enviada com sucesso:`, result);
    
  } catch (error) {
    console.error('Erro ao notificar status:', error);
    throw error;
  }
}
