export interface CustomerData {
  id?: string; // Unique ID
  createdAt?: string; // Timestamp
  
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  state: string;
  email: string;
  phone: string;
  cpf: string;
  comments?: string;
  
  quantity: number;

  paymentMethod: 'credit_card' | 'pix' | 'pix_credit_card';
  paymentStatus?: 'pending' | 'approved' | 'rejected'; // Status for admin
  
  installments?: string;
  cardNumber?: string;
  cardHolder?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardCvv?: string;
}

export interface OrderState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
}

export enum Step {
  FORM = 'FORM',
  CONFIRMATION = 'CONFIRMATION'
}

export enum View {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}