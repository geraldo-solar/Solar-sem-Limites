import React from 'react';

export type VideoVendasConteudo = {
  id: string;
  categoria: string;
  titulo: string;
  descricao: string;
  formato: 'vertical' | 'horizontal';
  capa?: string;
  // Preencher somente depois da aprovação do vídeo e da autorização de imagem.
  // Os caminhos são relativos a public/; nenhum player é criado sem a mídia.
  midia?: {
    arquivo: string;
    legendas: string;
    transcricao: string;
  };
};

type Props = {
  conteudo: VideoVendasConteudo;
  destaque?: boolean;
};

const assetUrl = (arquivo: string) => `${import.meta.env.BASE_URL}${arquivo.replace(/^\/+/, '')}`;

export default function VideoVendas({ conteudo, destaque = false }: Props) {
  const tituloId = `${conteudo.id}-titulo`;
  const descricaoId = `${conteudo.id}-descricao`;
  const [indisponivel, setIndisponivel] = React.useState(false);
  const midia = conteudo.midia;
  const vertical = conteudo.formato === 'vertical';
  const layoutDestaque = vertical
    ? 'sm:grid sm:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]'
    : 'lg:grid lg:grid-cols-[1.4fr_1fr]';

  return (
    <figure
      id={conteudo.id}
      aria-labelledby={tituloId}
      aria-describedby={descricaoId}
      className={`flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#d6ded9] bg-white shadow-sm ${
        destaque ? layoutDestaque : ''
      }`}
    >
      <div className={vertical ? 'flex min-w-0 items-center justify-center bg-[#edf2ed] p-4 sm:p-5' : 'min-w-0'}>
        <div
          data-video-formato={conteudo.formato}
          className={`relative w-full shrink-0 overflow-hidden bg-[#0b3d2e] ${
            vertical ? 'aspect-[9/16] max-w-[15rem] rounded-xl shadow-sm' : 'aspect-video'
          }`}
        >
      {midia && !indisponivel ? (
        <video
          key={midia.arquivo}
          controls
          playsInline
          preload="none"
          poster={conteudo.capa ? assetUrl(conteudo.capa) : undefined}
          src={assetUrl(midia.arquivo)}
          aria-labelledby={tituloId}
          aria-describedby={descricaoId}
          onError={() => setIndisponivel(true)}
          className="absolute inset-0 h-full w-full bg-[#0b3d2e] object-contain"
        >
          <track
            kind="captions"
            src={assetUrl(midia.legendas)}
            srcLang="pt-BR"
            label="Português"
            default
          />
          Seu navegador não suporta este vídeo. A transcrição está disponível abaixo.
        </video>
      ) : (
        <div className="absolute inset-0 flex min-w-0 items-center justify-center overflow-hidden bg-[#0b3d2e] px-5 py-6 text-center text-white">
          {conteudo.capa ? (
            <>
              <img
                src={assetUrl(conteudo.capa)}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[#082d24]/75" />
            </>
          ) : (
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#245b4d] via-[#0b3d2e] to-[#06281e]" />
          )}
          <div className="relative max-w-xs">
            <svg
              aria-hidden="true"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto mb-3 h-9 w-9 text-[#e1c084]"
            >
              <rect x="4" y="6" width="24" height="20" rx="3" />
              <path d="M10 6v20M22 6v20M4 12h6M4 20h6M22 12h6M22 20h6" />
            </svg>
            <p className="text-sm font-semibold tracking-wide text-[#f3e8d2]">
              {indisponivel ? 'Vídeo indisponível no momento' : 'Espaço reservado para vídeo'}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#dbe8e4]">
              {indisponivel ? 'Continue pelas informações da página ou leia a transcrição.' : conteudo.categoria}
            </p>
            {!midia && (
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#e1c084]">
                {vertical ? 'Vertical · 9:16' : 'Horizontal · 16:9'}
              </p>
            )}
          </div>
        </div>
      )}
        </div>
      </div>

      <figcaption className={`flex min-w-0 flex-1 flex-col p-5 sm:p-6 ${destaque ? 'justify-center lg:p-8' : ''}`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#56736a]">
          {conteudo.categoria}
        </p>
        <p id={tituloId} className="mt-2 font-serif text-xl font-semibold leading-snug text-[#173a35] sm:text-2xl">
          {conteudo.titulo}
        </p>
        <p id={descricaoId} className="mt-3 text-sm leading-relaxed text-[#52625e]">
          {conteudo.descricao}
        </p>
        {midia ? (
          <details className="mt-4 text-sm text-[#284f48]">
            <summary className="w-fit cursor-pointer rounded font-semibold underline decoration-[#b5c8bf] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0f5c45]">
              Ler transcrição do vídeo
            </summary>
            <p className="mt-3 whitespace-pre-line leading-relaxed">{midia.transcricao}</p>
          </details>
        ) : (
          <span className="mt-4 w-fit rounded-full border border-[#e4d5b5] bg-[#faf5e9] px-3 py-1 text-xs font-semibold text-[#756037]">
            Vídeo em preparação
          </span>
        )}
      </figcaption>
    </figure>
  );
}
