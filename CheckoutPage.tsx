import React, { useState, useEffect, useRef } from 'react';
import { CheckoutForm } from './Checkout-Solar-sem-Limites/components/CheckoutForm';
import { sendOrderToErp } from './Checkout-Solar-sem-Limites/services/solarErpService';
import { CustomerData } from './Checkout-Solar-sem-Limites/types';
import { indicacaoDaVisita } from './codigoDeIndicacao';
import { UNIT_PRICE, CREDIT_CARD_SURCHARGE, formatCurrency } from './Checkout-Solar-sem-Limites/constants';

interface StatusCarrinho {
  aberto: boolean;
  fechaEm: string;
  abreEm: string;
  pacotesVendidos: number;
  /** O ERP diz que o cartão é pago na página da Cielo. */
  cartaoPelaCielo?: boolean;
}

// Depois de gravado, o que o cliente ainda precisa fazer.
type Concluido =
  | { tipo: 'pix' }
  | { tipo: 'cartao_na_cielo'; url: string; entradaPix: boolean }
  | { tipo: 'cielo_indisponivel' };

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [concluido, setConcluido] = useState<Concluido | null>(null);
  const isSuccess = concluido !== null;
  const ultimoPedido = useRef<CustomerData | null>(null);
  // Um número de pedido por visita: tentar de novo depois de um erro manda o
  // MESMO pedido, e o ERP atualiza em vez de criar outro.
  const idDoPedido = useRef<string>(crypto.randomUUID());
  const criadoEm = useRef<string>(new Date().toISOString());
  const [status, setStatus] = useState<StatusCarrinho | null>(null);
  const [fechouAgora, setFechouAgora] = useState<string | null>(null);

  // Prazo e contador vêm do ERP. Se a consulta falhar, o formulário continua
  // aparecendo: quem decide de verdade se o pedido entra é a rota de
  // ingestão, não esta tela.
  useEffect(() => {
    fetch('/api/solar-status')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.success && setStatus(d))
      .catch(() => {});
  }, []);

  const handleSubmit = async (data: CustomerData) => {
    setIsLoading(true);
    try {
      const cartaoNaCielo = status?.cartaoPelaCielo === true && data.paymentMethod !== 'pix';
      const order: CustomerData = {
        ...data,
        id: idDoPedido.current,
        createdAt: criadoEm.current,
        paymentStatus: 'pending',
        // Vem do link de indicação aberto nesta visita, não de campo digitado.
        referral: indicacaoDaVisita() || undefined,
        cartaoNaCielo: cartaoNaCielo || undefined,
        // Na Cielo o cartão é digitado lá; nada de cartão sai daqui.
        ...(cartaoNaCielo ? {
          cardNumber: undefined, cardHolder: undefined, cardExpiryMonth: undefined,
          cardExpiryYear: undefined, cardCvv: undefined, installments: undefined,
        } : {}),
      };
      ultimoPedido.current = data;

      // Só o ERP. A planilha do Google recebia nome, CPF e telefone num
      // endereço que parou de funcionar: dado pessoal indo para lugar nenhum.
      const resultadoErp = await sendOrderToErp(order);
      if (resultadoErp.carrinhoFechado) {
        // Fechou com a aba já aberta: não é erro de conexão, e mandar tentar
        // de novo só faria o cliente repetir em vão.
        setFechouAgora(resultadoErp.mensagem || 'As vendas foram encerradas.');
        return;
      }
      if (!resultadoErp.ok) {
        throw new Error('O pedido nao foi sincronizado com o ERP.');
      }

      // O e-mail de confirmação sai do ERP, ao gravar o pedido. Não daqui:
      // uma rota que o navegador chama, qualquer um chama.
      if (!cartaoNaCielo) {
        setConcluido({ tipo: 'pix' });
      } else if (!resultadoErp.checkoutUrl) {
        setConcluido({ tipo: 'cielo_indisponivel' });
      } else if (data.paymentMethod === 'credit_card') {
        // Só cartão: segue direto para a Cielo, sem tela no meio.
        window.location.assign(resultadoErp.checkoutUrl);
        return;
      } else {
        // Pix + cartão: primeiro mostra o Pix da entrada, depois o botão da Cielo.
        setConcluido({ tipo: 'cartao_na_cielo', url: resultadoErp.checkoutUrl, entradaPix: true });
      }
    } catch (error) {
      console.error(error);
      alert('Ops! Tivemos um problema de conexão. Por favor, tente novamente ou fale com a recepção.');
    } finally {
      setIsLoading(false);
    }
  };

  const carrinhoFechado = fechouAgora || (status && !status.aberto);
  if (carrinhoFechado && !isSuccess) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg p-8 rounded-lg shadow-md text-center">
          <h2 className="text-3xl font-serif text-moss-800 mb-4">Vendas encerradas</h2>
          <p className="text-gray-600 mb-6 font-medium">
            {fechouAgora || 'As vendas deste lote foram encerradas.'}
          </p>
          <p className="text-gray-500 text-sm">
            Fale com a gente pelo WhatsApp (91) 98100-0800 ou por reserva@hotelsolar.tur.br
            para saber das próximas datas.
          </p>
          <a href="#/" className="mt-8 inline-block bg-moss-800 text-white font-bold py-3 px-6 rounded hover:bg-moss-900 transition-colors">
            Voltar
          </a>
        </div>
      </div>
    );
  }

  if (concluido) {
    const pedido = ultimoPedido.current;
    const base = (pedido?.quantity || 1) * UNIT_PRICE;
    const entrada = base * ((pedido?.splitPercent ?? 30) / 100);
    const restante = (base - entrada) * (1 + CREDIT_CARD_SURCHARGE);
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg p-8 rounded-lg shadow-md text-center">
          <h2 className="text-3xl font-serif text-moss-800 mb-4">Pré-reserva Garantida!</h2>
          <p className="text-gray-600 mb-6 font-medium">
            Sua solicitação do pacote <strong>Solar Sem Limites VIP</strong> foi registrada com sucesso.
          </p>

          {concluido.tipo === 'pix' && (
            <p className="text-gray-500 text-sm">
              Recebemos os seus dados e nossa equipe já foi notificada. Assim que o pagamento
              for processado, você recebe a confirmação no seu e-mail.
            </p>
          )}

          {concluido.tipo === 'cartao_na_cielo' && (
            <div className="text-left space-y-5">
              <div>
                <p className="font-bold text-moss-800 mb-2">1. Pague a entrada de {formatCurrency(entrada)} no Pix</p>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-700 space-y-1 font-mono">
                  <p>Chave Pix: <span className="font-bold">91981000800</span> (Celular)</p>
                  <p>Favorecido: J Ramos Barros Hotelaria e Eventos Me</p>
                  <p>CNPJ: 97.519.659/0001-90</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Envie o comprovante para reserva@hotelsolar.tur.br.</p>
              </div>
              <div>
                <p className="font-bold text-moss-800 mb-2">2. Pague o restante de {formatCurrency(restante)} no cartão</p>
                <a
                  href={concluido.url}
                  className="block text-center bg-success-500 hover:bg-success-600 text-white font-bold py-4 px-6 rounded shadow-sm uppercase tracking-wide"
                >
                  Pagar no cartão pela Cielo
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  Página segura da Cielo, em até 12x. O link também foi para o seu e-mail.
                </p>
              </div>
            </div>
          )}

          {concluido.tipo === 'cielo_indisponivel' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Não conseguimos abrir a página de pagamento no cartão agora. Seu pedido está
                guardado: tente de novo em instantes, ou aguarde nossa equipe enviar o link.
              </p>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => { if (ultimoPedido.current) void handleSubmit(ultimoPedido.current); }}
                className="bg-moss-800 text-white font-bold py-3 px-6 rounded hover:bg-moss-900 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Abrindo…' : 'Tentar abrir o pagamento'}
              </button>
            </div>
          )}

          <a href="#/" className="mt-8 inline-block text-moss-800 font-bold py-3 px-6 hover:underline">
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
          {status && status.pacotesVendidos > 0 && (
            <p className="mt-4 inline-block rounded-full border border-gold-500/40 bg-gold-50 px-4 py-1.5 text-sm font-semibold text-moss-800">
              {status.pacotesVendidos} pacotes já garantidos por outras famílias
            </p>
          )}
        </div>
        <CheckoutForm onSubmit={handleSubmit} isLoading={isLoading} cartaoPelaCielo={status?.cartaoPelaCielo === true} />
      </div>
    </div>
  );
}
