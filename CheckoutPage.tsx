import React, { useState, useEffect, useRef } from 'react';
import { CheckoutForm } from './Checkout-Solar-sem-Limites/components/CheckoutForm';
import { sendOrderToErp } from './Checkout-Solar-sem-Limites/services/solarErpService';
import { VERSAO_DO_REGULAMENTO } from './versaoDoRegulamento';
import { CustomerData } from './Checkout-Solar-sem-Limites/types';
import { indicacaoDaVisita } from './codigoDeIndicacao';
import { UNIT_PRICE, CREDIT_CARD_SURCHARGE, formatCurrency } from './Checkout-Solar-sem-Limites/constants';
import { nextCampaignOrder, type CampaignOrderIdentity } from './identidadePedidoNovembro';
import { executarCheckoutComTeste, testeManualCheckoutAtivo, testeRealCheckoutAtivo } from './testeManualCheckout';
import { NOME_DO_PACOTE, TITULO_DO_PACOTE } from './nomeDoPacote';
import { ContatosDoHotel, EMAIL_RESERVAS, MENSAGEM_CHECKOUT, MENSAGEM_DUVIDA, MENSAGEM_PAGAMENTO } from './contatosDoHotel';

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

export default function CheckoutPage({ quantidadeInicial = 1 }: { quantidadeInicial?: 1 | 2 }) {
  const modoTeste = testeManualCheckoutAtivo();
  const testeReal = testeRealCheckoutAtivo();
  const [liberacao, setLiberacao] = useState<{ token: string; email: string; phoneFinal: string; expiresAt: string } | null>(null);
  const [erroTesteReal, setErroTesteReal] = useState('');
  const [testeConferido, setTesteConferido] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [concluido, setConcluido] = useState<Concluido | null>(null);
  const isSuccess = concluido !== null;
  const ultimoPedido = useRef<CustomerData | null>(null);
  // Repetir após falha mantém o ID. Mudar comprador/valor inicia outro pedido;
  // o comprovante de origem do pedido anterior não pode ser sobrescrito.
  const identidadeDoPedido = useRef<CampaignOrderIdentity | null>(null);
  const [status, setStatus] = useState<StatusCarrinho | null>(null);
  const [fechouAgora, setFechouAgora] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Finalizar compra | ${TITULO_DO_PACOTE}`;
  }, []);

  useEffect(() => {
    // O CTA pode estar no rodapé da página de vendas: começar pelos dados,
    // não herdar a rolagem e cair direto no botão de finalizar.
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [quantidadeInicial]);

  useEffect(() => {
    if (!testeReal) return;
    let ativo = true;
    fetch('/api/ssl26-teste-real/status', { cache: 'no-store' })
      .then(async r => { const d = await r.json(); if (!r.ok || !d?.success) throw new Error(); return d; })
      .then(d => { if (ativo) setLiberacao(d); })
      .catch(() => { if (ativo) setErroTesteReal('Liberação local indisponível ou encerrada. Nenhum pedido pode ser enviado por este teste.'); });
    return () => { ativo = false; };
  }, [testeReal]);

  // Prazo e contador vêm do ERP. Se a consulta falhar, o formulário continua
  // aparecendo: quem decide de verdade se o pedido entra é a rota de
  // ingestão, não esta tela.
  useEffect(() => {
    if (modoTeste || testeReal) return;
    fetch('/api/solar-status')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.success && setStatus(d))
      .catch(() => {});
  }, [modoTeste, testeReal]);

  const enviarPedidoReal = async (data: CustomerData) => {
    if (testeReal && !liberacao) return;
    setErroTesteReal('');
    setIsLoading(true);
    try {
      // Novembro é exclusivamente online. Uma falha na consulta de status
      // nunca pode fazer o formulário voltar a recolher cartão/CVV no hotel.
      const cartaoNaCielo = data.paymentMethod !== 'pix';
      identidadeDoPedido.current = nextCampaignOrder(identidadeDoPedido.current, data);
      const order: CustomerData = {
        ...data,
        id: identidadeDoPedido.current.id,
        createdAt: identidadeDoPedido.current.createdAt,
        paymentStatus: 'pending',
        // Vem do link de indicação aberto nesta visita, não de campo digitado.
        referral: testeReal ? undefined : indicacaoDaVisita() || undefined,
        // O formulário só envia com o aceite marcado; o ERP grava a hora.
        aceite: { versao: VERSAO_DO_REGULAMENTO },
        cartaoNaCielo: cartaoNaCielo || undefined,
        // Na Cielo o cartão é digitado lá; nada de cartão sai daqui.
        cardNumber: undefined, cardHolder: undefined, cardExpiryMonth: undefined,
        cardExpiryYear: undefined, cardCvv: undefined, installments: undefined,
      };
      ultimoPedido.current = data;

      // Só o ERP. A planilha do Google recebia nome, CPF e telefone num
      // endereço que parou de funcionar: dado pessoal indo para lugar nenhum.
      const resultadoErp = await sendOrderToErp(order, 'ssl26_novembro_2026',
        testeReal && liberacao ? { token: liberacao.token } : undefined);
      if (resultadoErp.carrinhoFechado) {
        // Fechou com a aba já aberta: não é erro de conexão, e mandar tentar
        // de novo só faria o cliente repetir em vão.
        setFechouAgora(resultadoErp.mensagem || 'As vendas foram encerradas.');
        return;
      }
      if (!resultadoErp.ok) {
        if (testeReal) {
          setErroTesteReal(resultadoErp.mensagem || 'O ERP não confirmou o pedido. Confira o PCDA antes de tentar novamente.');
          return;
        }
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

  const handleSubmit = (data: CustomerData) => executarCheckoutComTeste(
    modoTeste,
    () => { setTesteConferido(true); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    () => enviarPedidoReal(data),
  );

  const carrinhoFechado = !modoTeste && !testeReal && (fechouAgora || (status && !status.aberto));
  if (carrinhoFechado && !isSuccess) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg p-8 rounded-lg shadow-md text-center">
          <h2 className="text-3xl font-serif text-moss-800 mb-4">Vendas encerradas</h2>
          <p className="text-gray-600 mb-6 font-medium">
            {fechouAgora || 'As vendas deste lote foram encerradas.'}
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Fale com a gente para saber das próximas datas, ou escreva para {EMAIL_RESERVAS}.
          </p>
          <ContatosDoHotel evento="ssl26_checkout" origem="vendas_encerradas" mensagem={MENSAGEM_DUVIDA} />
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
          {testeReal && <p className="mb-5 rounded-lg bg-amber-100 p-4 text-sm text-amber-950">Teste real: pedido registrado no PCDA. Confira os e-mails do comprador e do hotel. Pagamento e aprovação não são simulados.</p>}
          <h2 className="text-3xl font-serif text-moss-800 mb-4">Pré-reserva Garantida!</h2>
          <p className="text-gray-600 mb-6 font-medium">
            Sua solicitação do pacote <strong>{NOME_DO_PACOTE}</strong> foi registrada com sucesso.
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

          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="mb-3 text-sm text-gray-500">Dúvidas sobre o pagamento? Fale com a gente:</p>
            <ContatosDoHotel evento="ssl26_checkout" origem="pedido_registrado" mensagem={MENSAGEM_PAGAMENTO} semRegistro={modoTeste || testeReal} />
          </div>

          <a href="#/" className="mt-6 inline-block text-moss-800 font-bold py-3 px-6 hover:underline">
            Voltar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {testeReal && (
          <aside className="mb-6 rounded-xl border border-amber-300 bg-amber-100 p-5 text-sm leading-relaxed text-amber-950">
            <strong className="block">Teste real — finalizar cria pedido e envia e-mails</strong>
            {liberacao
              ? <p>Use {liberacao.email} e o WhatsApp final {liberacao.phoneFinal}. Liberado até {new Date(liberacao.expiresAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Belem', hour: '2-digit', minute: '2-digit' })} de hoje (Belém), para até seis pedidos.</p>
              : <p>{erroTesteReal ? 'Envio não liberado.' : 'Conferindo a liberação local…'}</p>}
            <p className="mt-2">Pix e cartão têm valores reais. No cartão, você conclui o pagamento na Cielo. Não há estorno automático.
              Este ensaio usa o fluxo operacional do PCDA; não valida a atribuição à campanha de novembro nem libera disparos comerciais.</p>
            <a href="#opcoes" className="mt-3 block w-fit font-bold underline underline-offset-4">Voltar às opções de pacote</a>
          </aside>
        )}
        {testeReal && erroTesteReal && <p role="alert" className="mb-6 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900">{erroTesteReal}</p>}
        {modoTeste && (
          <aside className="mb-6 rounded-xl border border-amber-300 bg-amber-100 p-5 text-sm leading-relaxed text-amber-950">
            <strong className="block">Teste local do checkout — sem compra real</strong>
            Use dados fictícios. Você pode conferir campos e valores; o teste não grava pedidos,
            não envia mensagens, não abre a Cielo e não gera cobrança. A consulta automática de CEP está desligada.
            <a href="#opcoes" className="mt-3 block w-fit font-bold underline underline-offset-4">Voltar às opções de pacote</a>
          </aside>
        )}
        {modoTeste && testeConferido && (
          <div role="status" className="mb-6 rounded-xl border border-green-300 bg-green-50 p-5 text-green-950">
            <strong>Teste de preenchimento concluído.</strong> Nenhum pedido foi enviado ou pagamento iniciado.
            Você pode alterar os campos e conferir novamente.
          </div>
        )}
        <div className="text-center mb-8">
          <p className="mb-2 text-sm font-semibold text-moss-800">{NOME_DO_PACOTE}</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-moss-900 mb-2">Finalize a sua Reserva</h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            No cartão, o pagamento é concluído na página da Cielo. Não pedimos número do cartão nem código de segurança aqui.
          </p>
          <div className="mt-5">
            <p className="mb-2 text-sm text-gray-500">Precisa de ajuda para finalizar?</p>
            <ContatosDoHotel evento="ssl26_checkout" origem="formulario" mensagem={MENSAGEM_CHECKOUT} semRegistro={modoTeste || testeReal} />
          </div>
          {status && status.pacotesVendidos > 0 && (
            <p className="mt-4 inline-block rounded-full border border-gold-500/40 bg-gold-50 px-4 py-1.5 text-sm font-semibold text-moss-800">
              {status.pacotesVendidos} pacotes já garantidos por outras famílias
            </p>
          )}
        </div>
        <CheckoutForm key={quantidadeInicial} onSubmit={handleSubmit} isLoading={isLoading || (testeReal && !liberacao)} cartaoPelaCielo quantidadeInicial={quantidadeInicial} modoTeste={modoTeste} />
      </div>
    </div>
  );
}
