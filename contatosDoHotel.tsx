import React from 'react';
import { NOME_DO_PACOTE } from './nomeDoPacote';

// Contatos de atendimento do Solar Sem Limites, usados na página de vendas, no
// checkout e no retorno do pagamento (decisões de 06/10/2026).
//
// - Telefone do hotel: recebe ligações e também tem WhatsApp. É o canal de
//   reservas citado no regulamento (item 7) e aceito no checkout; não trocar
//   sem nova versão do regulamento. Quem prefere ouvir alguém liga aqui.
// - WhatsApp de atendimento: número oficial conectado ao ManyChat, o mesmo do
//   botão do site principal. Não recebe ligações; nunca vira link de telefone.
export const TELEFONE_HOTEL = '(91) 98100-0800';
export const TELEFONE_LINK = 'tel:+5591981000800';
export const WHATSAPP_ATENDIMENTO = '(91) 98122-9825';
export const EMAIL_RESERVAS = 'reserva@hotelsolar.tur.br';

// Mensagens naturais, já escritas, conforme a etapa. Nenhuma é a frase exata da
// entrada do lançamento no ManyChat.
export const MENSAGEM_DUVIDA = `Olá! Tenho uma dúvida sobre o ${NOME_DO_PACOTE}.`;
export const MENSAGEM_CHECKOUT = `Olá! Estou finalizando a compra do ${NOME_DO_PACOTE} e tenho uma dúvida.`;
export const MENSAGEM_PAGAMENTO = `Olá! Tenho uma dúvida sobre o pagamento do ${NOME_DO_PACOTE}.`;

export const linkWhatsApp = (mensagem: string) =>
  `https://wa.me/5591981229825?text=${encodeURIComponent(mensagem)}`;

export const IconeTelefone = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const IconeWhatsApp = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 fill-current">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.21-3.6.94.96-3.5-.23-.36a9.46 9.46 0 0 1-1.45-5.05c0-5.24 4.27-9.5 9.52-9.5 2.54 0 4.93.99 6.72 2.79a9.43 9.43 0 0 1 2.78 6.72c0 5.24-4.27 9.5-9.5 9.5zm8.08-17.58A11.35 11.35 0 0 0 12.05.5C5.76.5.64 5.62.64 11.9c0 2.01.52 3.97 1.52 5.7L.54 23.5l6.04-1.58a11.4 11.4 0 0 0 5.46 1.39h.01c6.29 0 11.41-5.12 11.41-11.41 0-3.05-1.19-5.91-3.33-8.07z" />
  </svg>
);

function registrar(evento: string, origem: string) {
  const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: evento, origem });
  w.gtag?.('event', evento, { origem });
}

/**
 * Os dois caminhos lado a lado: mensagem pelo WhatsApp do ManyChat e ligação
 * para o telefone do hotel. `evento` prefixa o registro no Analytics (por
 * exemplo, ssl26_checkout → ssl26_checkout_whatsapp / ssl26_checkout_ligacao).
 */
export function ContatosDoHotel({
  evento,
  origem,
  mensagem,
  semRegistro = false,
}: {
  evento: string;
  origem: string;
  mensagem: string;
  semRegistro?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <a
        href={linkWhatsApp(mensagem)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => { if (!semRegistro) registrar(`${evento}_whatsapp`, origem); }}
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1ebe5a]"
      >
        <IconeWhatsApp />
        WhatsApp {WHATSAPP_ATENDIMENTO}
      </a>
      <a
        href={TELEFONE_LINK}
        onClick={() => { if (!semRegistro) registrar(`${evento}_ligacao`, origem); }}
        className="inline-flex items-center gap-2 rounded-full border border-[#cbd8d3] bg-white px-4 py-2 text-sm font-semibold text-[#0f5c45] transition hover:bg-[#f4f8f6]"
      >
        <IconeTelefone />
        Ligar {TELEFONE_HOTEL}
      </a>
    </div>
  );
}
