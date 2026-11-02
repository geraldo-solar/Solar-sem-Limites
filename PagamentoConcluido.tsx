import React, { useEffect, useState } from 'react';
import { NOME_DO_PACOTE, TITULO_DO_PACOTE } from './nomeDoPacote';
import { ContatosDoHotel, EMAIL_RESERVAS, MENSAGEM_PAGAMENTO } from './contatosDoHotel';
import {
  consultarPagamentoDaCompra, desfechoDoPagamento, esquecerPedidoDaVolta, linkParaTentarDeNovo,
  type SituacaoDaCompra,
} from './pagamentoDaCompra';

// A Cielo pode demorar a registrar o pagamento que o cliente acabou de fazer.
const INTERVALO_MS = 4000;
const TENTATIVAS = 30; // ~2 minutos

type Etapa = 'conferindo' | 'pago' | 'recusado' | 'demorou' | 'erro';

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg p-8 rounded-lg shadow-md text-center">
        <p className="mb-3 text-sm font-semibold text-moss-800">{NOME_DO_PACOTE}</p>
        {children}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <p className="mb-3 text-sm text-gray-500">
            Dúvidas sobre o pagamento? Fale com a gente, ou escreva para {EMAIL_RESERVAS}.
          </p>
          <ContatosDoHotel evento="ssl26_retorno" origem="retorno_pagamento" mensagem={MENSAGEM_PAGAMENTO} />
        </div>
        <a href="#/" className="mt-8 inline-block bg-moss-800 text-white font-bold py-3 px-6 rounded hover:bg-moss-900 transition-colors">
          Voltar
        </a>
      </div>
    </div>
  );
}

// Para onde a Cielo devolve o cliente depois da página de pagamento. Com o id
// da compra, confere no ERP se a Cielo aprovou, como o Motor de Reservas faz.
// Sem ele (página de pagamento aberta antes de 02/11/2026), não sabe qual
// compra é e não afirma nada: quem confirma é o hotel, por e-mail.
export default function PagamentoConcluido({ pedido = null }: { pedido?: string | null }) {
  const [etapa, setEtapa] = useState<Etapa>('conferindo');
  const [situacao, setSituacao] = useState<SituacaoDaCompra | null>(null);

  useEffect(() => {
    document.title = `Retorno do pagamento | ${TITULO_DO_PACOTE}`;
  }, []);

  useEffect(() => {
    if (!pedido) return;
    let vivo = true;
    let tentativas = 0;
    let espera: ReturnType<typeof setTimeout> | undefined;
    const conferir = async () => {
      const s = await consultarPagamentoDaCompra(pedido);
      if (!vivo) return;
      if (s === 'erro') {
        // Uma falha de rede não condena o pagamento: segue tentando.
        if (++tentativas >= TENTATIVAS) setEtapa('erro');
        else espera = setTimeout(conferir, INTERVALO_MS);
        return;
      }
      setSituacao(s);
      const desfecho = desfechoDoPagamento(s);
      if (desfecho === 'pago') { esquecerPedidoDaVolta(); setEtapa('pago'); return; }
      if (desfecho === 'recusado') { setEtapa('recusado'); return; }
      if (++tentativas >= TENTATIVAS) { setEtapa('demorou'); return; }
      espera = setTimeout(conferir, INTERVALO_MS);
    };
    conferir();
    return () => { vivo = false; clearTimeout(espera); };
  }, [pedido]);

  if (!pedido) {
    return (
      <Moldura>
        <h2 className="text-3xl font-serif text-moss-800 mb-4">Obrigado!</h2>
        <p className="text-gray-600 mb-4 font-medium">
          Se você concluiu o pagamento na Cielo, nossa equipe confere e você recebe a
          confirmação da compra no seu e-mail.
        </p>
        <p className="text-gray-500 text-sm">
          Se não concluiu, o link para pagar está no e-mail de pedido recebido.
        </p>
      </Moldura>
    );
  }

  const numero = `#${pedido.slice(0, 8).toUpperCase()}`;
  const textoDaCielo = situacao?.pagamento?.texto;

  if (etapa === 'conferindo') {
    return (
      <Moldura>
        <div role="status" aria-live="polite">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-moss-800/20 border-t-moss-800" />
          <h2 className="text-3xl font-serif text-moss-800 mb-2">Confirmando seu pagamento</h2>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Não feche esta página</p>
          <p className="text-gray-600 font-medium">
            Estamos conferindo com a Cielo o pagamento do pedido {numero}. Leva só alguns segundos.
          </p>
          {textoDaCielo && <p className="mt-3 text-xs uppercase tracking-widest text-gray-400">{textoDaCielo}</p>}
        </div>
      </Moldura>
    );
  }

  if (etapa === 'pago') {
    const p = situacao?.pagamento;
    return (
      <Moldura>
        <h2 className="text-3xl font-serif text-moss-800 mb-4">Pagamento aprovado!</h2>
        <p className="text-gray-600 mb-4 font-medium">
          {situacao?.compraAprovada
            ? <>Sua compra do pedido {numero} está confirmada. Os detalhes estão no seu e-mail.</>
            : <>A Cielo aprovou o pagamento do pedido {numero}. Nossa equipe confere a compra e você recebe a confirmação no seu e-mail.</>}
        </p>
        {p?.bandeira && p.final && (
          <p className="text-gray-500 text-sm">
            Cartão {p.bandeira} final {p.final}{p.parcelas ? `, em ${p.parcelas}x` : ''}.
          </p>
        )}
        {situacao?.entradaNoPix && !situacao.compraAprovada && (
          <p className="mt-4 rounded bg-sand-50 p-4 text-left text-sm text-gray-700">
            Falta a entrada no Pix: se ainda não pagou, a chave e os valores estão no e-mail de
            pedido recebido. Envie o comprovante para {EMAIL_RESERVAS}.
          </p>
        )}
      </Moldura>
    );
  }

  const recusado = etapa === 'recusado';
  const titulo = recusado ? 'Pagamento não concluído'
    : etapa === 'erro' ? 'Não conseguimos conferir agora' : 'Pagamento ainda em análise';
  const explicacao = recusado
    ? 'A Cielo não aprovou este pagamento, então a compra ainda não está garantida. Nada foi cobrado: você pode tentar de novo agora.'
    : etapa === 'erro'
      ? 'Não conseguimos falar com a Cielo para confirmar. Se você pagou, não pague de novo: fale com a gente que conferimos para você.'
      : 'A Cielo ainda não finalizou a análise deste pagamento. Se você pagou, não pague de novo: assim que for aprovado, você recebe a confirmação no seu e-mail.';
  return (
    <Moldura>
      <h2 className="text-3xl font-serif text-moss-800 mb-2">{titulo}</h2>
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Pedido {numero} registrado · pagamento pendente</p>
      <p className="text-gray-600 mb-4 font-medium">{explicacao}</p>
      {textoDaCielo && <p className="mb-4 text-xs uppercase tracking-widest text-gray-400">{textoDaCielo}</p>}
      {recusado && situacao?.pagamento?.podeTentarDeNovo && (
        <a
          href={linkParaTentarDeNovo(pedido)}
          className="block text-center bg-success-500 hover:bg-success-600 text-white font-bold py-4 px-6 rounded shadow-sm uppercase tracking-wide"
        >
          Tentar o pagamento de novo
        </a>
      )}
    </Moldura>
  );
}
