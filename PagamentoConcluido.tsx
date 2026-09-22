import React from 'react';

// Para onde a Cielo devolve o cliente depois da página de pagamento. A Cielo
// manda para cá quem pagou e quem desistiu, sem dizer qual: por isso a tela
// não afirma que o pagamento foi aprovado. Quem confirma é o hotel, por e-mail.
export default function PagamentoConcluido() {
  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg p-8 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-serif text-moss-800 mb-4">Obrigado!</h2>
        <p className="text-gray-600 mb-4 font-medium">
          Se você concluiu o pagamento na Cielo, nossa equipe confere e você recebe a
          confirmação da compra no seu e-mail.
        </p>
        <p className="text-gray-500 text-sm">
          Se não concluiu, o link para pagar está no e-mail de pedido recebido. Dúvidas:
          WhatsApp (91) 98100-0800 ou reserva@hotelsolar.tur.br.
        </p>
        <a href="#/" className="mt-8 inline-block bg-moss-800 text-white font-bold py-3 px-6 rounded hover:bg-moss-900 transition-colors">
          Voltar
        </a>
      </div>
    </div>
  );
}
