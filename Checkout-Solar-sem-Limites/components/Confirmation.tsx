import React from 'react';
import { Icons } from '../constants';

interface ConfirmationProps {
  message: string;
  onBack: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({ message, onBack }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 md:p-12 bg-white text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-moss-800 mb-6 shadow-sm">
        <Icons.Check />
      </div>

      <h2 className="font-serif text-4xl text-moss-800 mb-4">Pedido Confirmado!</h2>
      
      <div className="w-16 h-1 bg-gold-500 mb-8 mx-auto"></div>

      <div className="bg-sand-100 p-8 rounded-xl border border-sand-200 max-w-md w-full shadow-sm relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gold-400/10 rounded-bl-full"></div>
        
        <p className="text-lg text-gray-700 leading-relaxed font-light italic">
          "{message}"
        </p>
      </div>
      
      <div className="mt-8 space-y-4 max-w-lg mx-auto">
         <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Próximos Passos</p>
         <div className="flex flex-col gap-4 text-gray-600 text-sm text-left">
            <div className="flex gap-3">
                <span className="font-bold text-moss-800 text-base">1.</span>
                <span>Se você efetuou a compra via PIX, enviar comprovante para nosso e-mail <strong className="text-moss-900">reserva@hotelsolar.tur.br</strong> ou para nosso Whatsapp <strong className="text-moss-900">91-98100-0800</strong></span>
            </div>
            <div className="flex gap-3">
                <span className="font-bold text-moss-800 text-base">2.</span>
                <span>Se efetuou a compra via cartão, aguarde a confirmação no seu e-mail ou Whatsapp, pois estamos processando a sua compra.</span>
            </div>
         </div>
      </div>
      
      <button 
        onClick={onBack}
        className="mt-12 text-moss-800 font-bold hover:text-gold-600 underline decoration-gold-500 decoration-2 underline-offset-4 transition-colors"
      >
        Voltar para o início
      </button>
    </div>
  );
};