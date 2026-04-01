import { CustomerData } from "../types";
import { UNIT_PRICE, CREDIT_CARD_SURCHARGE, formatCurrency } from "../constants";

// URL configurada para o Web App do Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDc7jiWeW1VRRSuBpVyCdF7BpbYvS7Ai0ZWPmeEmFMx6mmIJlBTk_AHSvtD6W8q1PW/exec";

export const sendOrderToGoogleSheets = async (order: CustomerData) => {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("SUA_URL")) {
    console.warn("Google Sheets URL not configured. Data not sent to spreadsheet.");
    return;
  }

  const baseTotal = order.quantity * UNIT_PRICE;
  const total = order.paymentMethod === 'credit_card'
    ? baseTotal * (1 + CREDIT_CARD_SURCHARGE)
    : baseTotal;

  let paymentDetails = 'Pix';
  if (order.paymentMethod === 'credit_card') {
    paymentDetails = `Cartão ${order.installments}x (Final: ${order.cardNumber?.slice(-4)})`;
  } else if (order.paymentMethod === 'pix_credit_card') {
    paymentDetails = 'Pagamento híbrido (fechamento presencial)';
  }

  const payload = {
    date: new Date().toLocaleString('pt-BR'),
    id: order.id,
    name: `${order.firstName} ${order.lastName}`,
    email: order.email,
    phone: order.phone,
    cpf: order.cpf,
    quantity: order.quantity,
    total: formatCurrency(total),
    paymentMethod: order.paymentMethod === 'credit_card' ? 'Cartão' : order.paymentMethod === 'pix_credit_card' ? 'Cartão Múltiplo / Pix+Cartão' : 'Pix',
    status: order.paymentStatus || 'pending',
    paymentDetails: paymentDetails
  };

  try {
    // We use 'no-cors' mode because Google Script doesn't return standard CORS headers for simple POSTs
    // This implies we won't get a readable response JSON, but the request will succeed.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log("Order sent to Google Sheets");
  } catch (error) {
    console.error("Error sending to Google Sheets:", error);
  }
};