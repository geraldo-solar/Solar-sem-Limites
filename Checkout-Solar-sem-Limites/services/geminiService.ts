import { GoogleGenAI } from "@google/genai";
import { CustomerData } from "../types";

// Safely access API key to prevent crashes in environments where process is undefined (like GitHub Pages)
const getApiKey = () => {
  try {
    // Check if process exists and has env property before accessing
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
    return '';
  } catch (e) {
    // Silently fail if process is not defined
    return '';
  }
};

const apiKey = getApiKey();

export const generateConfirmationMessage = async (customer: CustomerData): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning default message.");
    if (customer.paymentMethod === 'pix') {
       return `Obrigado, ${customer.firstName}! Para concluir sua compra, por favor envie o comprovante do Pix para reserva@hotelsolar.tur.br. Assim que recebermos, enviaremos seu contrato e a confirmação para seu email.`;
    }
    return `Obrigado, ${customer.firstName}! Sua compra do Solar sem Limites foi confirmada com sucesso.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const modelId = 'gemini-2.5-flash';

    const prompt = `
      You are a premium customer success assistant for a high-end sustainable energy product called "Solar sem Limites".
      
      A customer named "${customer.firstName} ${customer.lastName}" just purchased the product using ${customer.paymentMethod === 'credit_card' ? 'Credit Card' : 'Pix'}.
      They provided the email "${customer.email}".
      City: ${customer.city}, State: ${customer.state}.
      
      Write a short, elegant, and warm confirmation message (maximum 3 sentences) in Portuguese (Brazil).
      
      Key points to include naturally:
      1. Thank them by first name.
      ${customer.paymentMethod === 'pix' 
        ? '2. CRITICAL: Explicitly instruct the customer that to finalize their purchase, they MUST forward their Pix payment proof (comprovante) to "reserva@hotelsolar.tur.br". Mention that the contract will be sent via email after this step.' 
        : '2. Confirm that the contract and purchase confirmation have been sent to their email.'}
      
      Tone: Sophisticated, eco-friendly, trustworthy, and welcoming.
      Do NOT mention WhatsApp contact.
      Do not include markdown or quotes.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || `Parabéns pela compra, ${customer.firstName}!`;
  } catch (error) {
    console.error("Gemini generation error:", error);
    // Fallback logic on error
    if (customer.paymentMethod === 'pix') {
       return `Obrigado, ${customer.firstName}! Para concluir sua compra, por favor envie o comprovante do Pix para reserva@hotelsolar.tur.br. Assim que recebermos, enviaremos seu contrato e a confirmação para seu email.`;
    }
    return `Obrigado, ${customer.firstName}! Sua compra do Solar sem Limites foi confirmada com sucesso.`;
  }
};