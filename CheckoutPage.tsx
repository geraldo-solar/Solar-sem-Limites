import React, { useState } from 'react';
import { CheckoutForm } from './Checkout-Solar-sem-Limites/components/CheckoutForm';
import { sendOrderToGoogleSheets } from './Checkout-Solar-sem-Limites/services/googleSheetsService';
import { addContactAndSendEmail } from './Checkout-Solar-sem-Limites/services/brevoService';
import { CustomerData } from './Checkout-Solar-sem-Limites/types';

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (data: CustomerData) => {
    setIsLoading(true);
    try {
      await sendOrderToGoogleSheets(data);
      
      // 3. ADD CONTACT TO BREVO AND SEND CONFIRMATION EMAIL (Omitted await to not block UI)
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
        cpf: data.cpf,
        comments: data.comments
      }).catch(err => console.error("Brevo Error:", err));

      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Ops! Tivemos um problema de conexão. Por favor, tente novamente ou fale com a recepção.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg p-8 rounded-lg shadow-md text-center">
          <h2 className="text-3xl font-serif text-moss-800 mb-4">Pré-reserva Garantida!</h2>
          <p className="text-gray-600 mb-6 font-medium">
            Sua solicitação do pacote <strong>Solar Sem Limites VIP</strong> foi registrada com sucesso.
          </p>
          <p className="text-gray-500 text-sm">
            Recebemos os seus dados e nossa equipe já foi notificada. Assim que o pagamento
            for processado, você recebe a confirmação no seu e-mail.
          </p>
          <a href="#/" className="mt-8 inline-block bg-moss-800 text-white font-bold py-3 px-6 rounded hover:bg-moss-900 transition-colors">
            Voltar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-moss-900 mb-2">Finalize a sua Reserva</h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Garantia de segurança máxima. Seus dados estão protegidos por criptografia de ponta a ponta.
          </p>
        </div>
        <CheckoutForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
