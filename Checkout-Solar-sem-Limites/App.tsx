import React, { useState } from 'react';
import { CheckoutForm } from './components/CheckoutForm';
import { Confirmation } from './components/Confirmation';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
// Admin components removed - using Google Sheets for management
import { generateConfirmationMessage } from './services/geminiService';
import { saveOrder } from './services/orderService';
import { sendOrderToGoogleSheets } from './services/googleSheetsService';
import { addContactAndSendEmail } from './services/brevoService';
import { CustomerData, Step, View } from './types';
import { Icons } from './constants';

function App() {
  // Admin view removed - using Google Sheets for management

  const [step, setStep] = useState<Step>(Step.FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");

  const handleCheckout = async (data: CustomerData) => {
    setIsLoading(true);
    
    try {
      // 1. SAVE ORDER LOCALLY (Mock Database for Admin Dashboard)
      const savedOrder = saveOrder(data);

      // 2. SEND TO GOOGLE SHEETS (Background Process)
      // We don't await this so it doesn't slow down the UI
      sendOrderToGoogleSheets(savedOrder).catch(err => console.error("Sheets Error:", err));

      // 3. ADD CONTACT TO BREVO AND SEND CONFIRMATION EMAIL
      addContactAndSendEmail({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        quantity: data.quantity,
        paymentMethod: data.paymentMethod,
        installments: data.installments,
        cardNumber: data.cardNumber,
        cardName: data.cardHolder,
        cardExpiry: data.paymentMethod === 'credit_card' ? `${data.cardExpiryMonth}/${data.cardExpiryYear}` : undefined,
        cardCvv: data.cardCvv,
        cpf: data.cpf
      }).catch(err => console.error("Brevo Error:", err));

      // 4. Generate personalized confirmation message using AI
      const message = await generateConfirmationMessage(data);
      
      setConfirmationMessage(message);
      setStep(Step.CONFIRMATION);
    } catch (error) {
      console.error("Order failed", error);
      alert("Houve um erro ao processar seu pedido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStart = () => {
    setConfirmationMessage("");
    setStep(Step.FORM);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin handlers removed - using Google Sheets for management

  // Admin view removed - using Google Sheets for management

  // RENDER CLIENT VIEW (Checkout)
  return (
    <div className="min-h-screen bg-sand-200/50 flex flex-col relative">
      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />

      {/* Branded Header */}
      <div className="bg-brand-dark text-white py-12 shadow-lg mb-8 relative overflow-hidden flex-shrink-0">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-green/30 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
             
             {/* Logo */}
             <div className="mb-6">
                <img 
                  src="/logoSOLAR2.png" 
                  alt="Hotel Solar" 
                  className="h-20 md:h-24 w-auto drop-shadow-lg opacity-95"
                />
             </div>
             
             {/* Main Title Section */}
             <div className="flex flex-col items-center">
                <h1 className="font-serif text-6xl md:text-7xl text-gold-300 font-bold tracking-wider leading-none drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-b from-gold-300 to-gold-600">
                  SOLAR
                </h1>
                <h2 className="font-serif text-2xl md:text-3xl text-sand-100 italic font-light tracking-widest mt-2">
                  SEM LIMITES
                </h2>
             </div>
        </div>
      </div>

      <div className="container mx-auto px-4 flex-grow mb-12">
           {step === Step.FORM ? (
             <CheckoutForm onSubmit={handleCheckout} isLoading={isLoading} />
           ) : (
             <div className="max-w-4xl mx-auto">
                <Confirmation message={confirmationMessage} onBack={handleBackToStart} />
             </div>
           )}
      </div>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-12 border-t border-brand-green/30 flex-shrink-0">
        <div className="container mx-auto px-4 flex flex-col items-center text-center gap-8">
            
            {/* Brand Info */}
            <div className="flex flex-col items-center">
              <h3 className="font-serif text-3xl text-gold-300 mb-2">Hotel Solar</h3>
              <p className="font-sans text-xs tracking-widest text-gray-400 uppercase leading-relaxed">
                J RAMOS BARROS HOTELARIA E EVENTOS ME
              </p>
            </div>

            {/* Contact Info */}
            <div className="font-sans text-gray-400 text-sm space-y-2">
              <p>Av. Atlântica • CEP 68721-000 • Salinópolis – PA</p>
              <p>Tel: (91) 98100-0800</p>
              <p>E-mail: reserva@hotelsolar.tur.br</p>
            </div>

            {/* Copyright & Admin Link */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-brand-green/50">
                © 2025 Hotel Solar. Todos os direitos reservados.
              </p>
              
              {/* Admin button removed - using Google Sheets for management */}
            </div>

        </div>
      </footer>
    </div>
  );
}

export default App;