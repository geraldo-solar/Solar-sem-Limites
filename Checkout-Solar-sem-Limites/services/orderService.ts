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

  orders.push(newOrder);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  
  return newOrder;
};

export const getOrders = (): CustomerData[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
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