import { CustomerData } from "../types";

const STORAGE_KEY = 'solar_orders_db';

export const saveOrder = (data: CustomerData): CustomerData => {
  const orders = getOrders();
  
  const newOrder: CustomerData = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    paymentStatus: 'pending', // Default status for new orders
  };

  // O objeto completo volta para o chamador apenas para a sincronizacao
  // imediata com o cofre do ERP. localStorage nunca deve reter PAN, validade,
  // titular ou CVV, pois fica acessivel a qualquer script da pagina.
  const safeOrder: CustomerData = {
    ...newOrder,
    cardNumber: newOrder.cardNumber?.replace(/\D/g, '').slice(-4),
    cardHolder: undefined,
    cardExpiryMonth: undefined,
    cardExpiryYear: undefined,
    cardCvv: undefined,
  };

  orders.push(safeOrder);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  
  return newOrder;
};

export const getOrders = (): CustomerData[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as CustomerData[];
    const sanitized = parsed.map((order) => ({
      ...order,
      cardNumber: order.cardNumber?.replace(/\D/g, '').slice(-4),
      cardHolder: undefined,
      cardExpiryMonth: undefined,
      cardExpiryYear: undefined,
      cardCvv: undefined,
    }));
    // Remove tambem dados completos que possam ter ficado de versoes antigas.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch (e) {
    return [];
  }
};

export const updateOrderStatus = (id: string, status: 'pending' | 'approved' | 'rejected'): CustomerData | null => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  
  if (index !== -1) {
    orders[index].paymentStatus = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return orders[index]; // Return the updated object
  }
  return null;
};

export const clearOrders = () => {
  localStorage.removeItem(STORAGE_KEY);
};
