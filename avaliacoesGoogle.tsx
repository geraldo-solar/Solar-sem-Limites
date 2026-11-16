import React from 'react';

// Nota do Hotel Solar no Google, pedida por Geraldo em 16/11/2026 no lugar das logos
// pequenas do Google e do Booking (o Booking saiu da página).
// Fonte: Google Places, ficha "Hotel Solar" (Av. Atlântica, 634–672, Salinópolis),
// consultada em 16/11/2026: 4,6 de 5, com 1.076 avaliações. A página não busca a nota
// sozinha: quando ela mudar no Google, atualizar NOTA, TOTAL e CONSULTA juntos.
export const AVALIACOES_GOOGLE = {
  nota: 4.6,
  total: 1076,
  consulta: '16/11/2026',
  // Abre a lista de avaliações da ficha do hotel no Google.
  link: 'https://search.google.com/local/reviews?placeid=ChIJxxkGvlJGpQARBBsm-2gBI7k',
};

const formatarNota = (nota: number) => nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const formatarTotal = (total: number) => total.toLocaleString('pt-BR');

function Estrelas({ nota }: { nota: number }) {
  return (
    <span aria-hidden="true" className="flex gap-1">
      {[0, 1, 2, 3, 4].map((i) => {
        const cheio = Math.max(0, Math.min(1, nota - i));
        return (
          <span key={i} className="relative inline-block h-7 w-7 sm:h-8 sm:w-8">
            <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full text-[#e3e0d8]" fill="currentColor">
              <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${cheio * 100}%` }}>
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#fbbc04] sm:h-8 sm:w-8" fill="currentColor">
                <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

type Props = { logo: string; aoAbrir?: () => void };

export default function AvaliacoesGoogle({ logo, aoAbrir }: Props) {
  const { nota, total, consulta, link } = AVALIACOES_GOOGLE;
  const notaTexto = formatarNota(nota);
  return (
    <div
      id="avaliacoes-google"
      className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#e0ded7] bg-white px-6 py-7 text-center shadow-sm sm:mt-10 sm:px-10"
    >
      <img src={logo} alt="Google Reviews" className="mx-auto h-16 w-auto sm:h-20" loading="lazy" />
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
        <p className="font-serif text-6xl font-semibold leading-none text-[#173a35]">
          {notaTexto}
          <span className="ml-1 align-baseline text-2xl font-normal text-[#74817d]">/5</span>
        </p>
        <Estrelas nota={nota} />
      </div>
      <p className="mt-3 text-base font-semibold text-[#284f48]">
        Nota {notaTexto} de 5 em {formatarTotal(total)} avaliações no Google
      </p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={aoAbrir}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0f5c45] px-6 py-3 text-base font-bold text-[#0f5c45] transition hover:bg-[#0f5c45] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#0f5c45]/25"
      >
        Ver as avaliações no Google
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 4h8v8M16 4L5 15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">(abre em outra aba)</span>
      </a>
      <p className="mt-3 text-xs text-[#74817d]">Nota consultada em {consulta}.</p>
    </div>
  );
}
