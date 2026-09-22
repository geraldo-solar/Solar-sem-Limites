import React, { useEffect, useMemo, useState } from 'react';

// Página de vendas do lançamento de novembro de 2026 (VEN-01).
//
// Tudo que aparece aqui vem de três fontes, e de nenhuma outra:
//   - Definicoes_Comerciais_Lancamento_Novembro_2026.md (oferta aprovada em 16/09)
//   - Regulamento_SSL.html (o contrato: validade, bônus, cancelamento, garantias)
//   - docs/SSL26_Producao_e_Lancamento.md (matriz de liberação e criativo A7)
//
// Três regras que a página de julho quebrava e esta não pode quebrar:
//
// 1. Sem escassez. As 200 unidades são comunicação, não limite (decisão de
//    20/09). O A7 é explícito: "sem encerramento por esgotamento e sem promessa
//    de vagas restantes". Não existe contador de vagas restantes nesta página.
// 2. O bônus nunca aparece como diária livre. O regulamento restringe a baixa
//    temporada, fora de férias e feriados, e o A7 proíbe omitir isso.
// 3. A janela de venda é decidida pelo servidor, não por data no navegador.
//    Relógio de cliente é ajustável; a matriz de liberação exige encerramento
//    "no servidor, não apenas em contador visual".

type WindowStatus = {
  aberto: boolean;
  abreEm: string;
  fechaEm: string;
  pacotesVendidos: number;
};

const CHECKOUT_URL = '#/checkout';
const REGULAMENTO_URL = 'Regulamento_SSL.pdf';
const WHATSAPP = '(91) 98100-0800';
const EMAIL_RESERVAS = 'reserva@hotelsolar.tur.br';

// Datas anunciadas. Servem só para o que a página escreve na tela: informar
// quando as vendas abrem e fecham. Quem autoriza a compra é sempre o servidor,
// nunca estas constantes nem o relógio do visitante.
const ABERTURA_TEXTO = '25 de novembro, às 8h';
const FECHAMENTO_TEXTO = '1º de dezembro, às 23h59';
const ABERTURA_ISO = '2026-11-25T08:00:00-03:00';
const FECHAMENTO_ISO = '2026-12-01T23:59:59-03:00';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}${fileName.replace(/^\/+/, '')}`;

const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Preço-base no Pix/transferência/depósito. O cartão recebe acréscimo de 10%
// sobre o valor processado, em até 12x — decisão 7 do registro comercial.
const PRECO_BASE_CENTAVOS = 310_000;
const ACRESCIMO_CARTAO = 0.1;
const PARCELAS_MAX = 12;

const precoCartao = (pacotes: number) =>
  Math.round(PRECO_BASE_CENTAVOS * pacotes * (1 + ACRESCIMO_CARTAO));

const parcelaCartao = (pacotes: number) => Math.round(precoCartao(pacotes) / PARCELAS_MAX);

const OPCOES = [
  {
    pacotes: 1,
    titulo: 'Um pacote',
    diarias: '6 diárias',
    composicao: '5 diárias regulares + 1 diária bônus',
    validade: 'Validade de 1 ano a partir da compra',
    destaque: false,
  },
  {
    pacotes: 2,
    titulo: 'Dois pacotes',
    diarias: '12 diárias',
    composicao: '10 diárias regulares + 2 diárias bônus',
    validade: 'Validade de 2 anos a partir da compra',
    destaque: true,
  },
] as const;

// Fotos reais do hotel, já usadas e autorizadas nas peças da campanha.
const GALERIA = [
  { arquivo: 'hotel-piscina.jpg', legenda: 'Piscina' },
  { arquivo: 'hotel-cafe-manha.jpg', legenda: 'Café da manhã colonial' },
  { arquivo: 'hotel-panoramica-rio.jpg', legenda: 'Vista do rio' },
  { arquivo: 'hotel-fachada.jpg', legenda: 'Fachada' },
  { arquivo: 'hotel-bicicletas.jpg', legenda: 'Bicicletas à disposição' },
  { arquivo: 'galeria-aerea.jpg', legenda: 'Salinópolis do alto' },
];

// Depoimentos confirmados por Geraldo como de clientes reais (21/09/2026).
// Serão substituídos por vídeo conforme os clientes forem gravando; até lá,
// ficam aqui. Não acrescentar depoimento sem confirmação de origem.
const DEPOIMENTOS = [
  {
    texto: 'Economizei mais de R$ 1.200 na alta temporada. O atendimento foi impecável do check-in ao check-out.',
    autor: 'Ana Paula',
    cidade: 'Belém, PA',
  },
  {
    texto: 'Usei no feriado de julho sem pagar nada a mais. Foi a melhor decisão para nossas férias em família.',
    autor: 'Lucas & Camila',
    cidade: 'Castanhal, PA',
  },
  {
    texto: 'Ainda ganhamos o passeio de barco. Valeu demais! A estrutura do hotel é fantástica.',
    autor: 'Família Souza',
    cidade: 'Macapá, AP',
  },
  {
    texto: 'Sempre que o Solar abre as vagas desse programa eu garanto o meu. O melhor investimento que fiz para lazer!',
    autor: 'Roberto Silva',
    cidade: 'Santarém, PA',
  },
];

// Cada regra abaixo tem origem num item do regulamento. Ao mexer aqui, conferir
// o contrato: prometer a mais vira passivo, prometer a menos prejudica o hotel.
const REGRAS = [
  {
    titulo: 'O que vem em cada pacote',
    texto: '5 diárias regulares mais 1 diária bônus, para um apartamento do tipo quádruplo, com até 4 pessoas. As diárias incluem café da manhã, passeios de barco e bicicletas à disposição.',
  },
  {
    titulo: 'Validade',
    texto: 'Um pacote vale por 1 ano corrido a partir da compra. A partir de dois pacotes, 2 anos corridos. O período do pacote de Réveillon é exceção e não entra.',
  },
  {
    titulo: 'A diária bônus tem restrição',
    texto: 'A diária bônus é cortesia e vale apenas em datas de baixa temporada, fora de férias e feriados. As 5 diárias regulares podem ser usadas em qualquer data, exceto no período do pacote de Réveillon.',
  },
  {
    titulo: 'Reservas dependem de disponibilidade',
    texto: `A reserva é garantida desde que haja vaga na data solicitada. O pedido é feito pelo WhatsApp ${WHATSAPP} ou por ${EMAIL_RESERVAS}.`,
  },
  {
    titulo: 'Cancelamento de uma reserva',
    texto: 'O prazo para cancelar uma reserva é de 7 dias antes do check-in. Cancelar com menos de 7 dias desconta 1 diária do pacote.',
  },
  {
    titulo: 'Transferência',
    texto: 'O pacote pode ser transferido para outra pessoa, mediante aviso prévio do titular por e-mail, no ato da reserva.',
  },
];

// Garantias exatamente como estão no item 7 do regulamento. A página de julho
// prometia crédito vitalício (o contrato dá 360 dias) e reembolso proporcional
// após o primeiro check-in (o contrato devolve o valor integral).
const GARANTIAS = [
  {
    titulo: '30 dias para desistir',
    texto: 'Cancelou dentro de 30 dias após a compra? Devolvemos 100% do valor, sem perguntas e sem burocracia.',
  },
  {
    titulo: 'Arrependimento no primeiro check-in',
    texto: 'Em caso de arrependimento imediatamente após o primeiro check-in, cancelamos a compra e devolvemos o valor integral recebido.',
  },
  {
    titulo: 'Crédito por 360 dias',
    texto: 'Terminada a vigência, o valor das diárias não utilizadas fica como crédito para reservas futuras por 360 dias.',
  },
];

const FAQ = [
  {
    pergunta: 'Preciso escolher as datas agora?',
    resposta: 'Não. Você compra as diárias e escolhe quando usar dentro da validade, conforme a disponibilidade na data que pedir. A reserva é solicitada pelo WhatsApp ou por e-mail.',
  },
  {
    pergunta: 'Posso usar em feriado ou nas férias?',
    resposta: 'As 5 diárias regulares de cada pacote podem ser usadas em qualquer data, com exceção do período do pacote de Réveillon. A diária bônus é diferente: vale só em baixa temporada, fora de férias e feriados.',
  },
  {
    pergunta: 'Como funciona o pagamento no cartão?',
    resposta: `No Pix, transferência ou depósito você paga o preço-base. No cartão há acréscimo de 10% sobre o valor processado, em até ${PARCELAS_MAX} vezes. Também é possível combinar: uma entrada no Pix e o saldo no cartão, com o acréscimo incidindo apenas sobre a parte financiada.`,
  },
  {
    pergunta: 'Quantas pessoas cabem no apartamento?',
    resposta: 'Até 4 pessoas, no apartamento do tipo quádruplo, conforme o regulamento.',
  },
  {
    pergunta: 'Posso dar o pacote de presente?',
    resposta: 'Pode. O pacote é transferível para terceiros, com aviso prévio do titular por e-mail no ato da reserva.',
  },
  {
    pergunta: 'E se eu não conseguir usar tudo no prazo?',
    resposta: 'Terminada a vigência, o valor das diárias não utilizadas vira crédito para reservas futuras por 360 dias.',
  },
];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function trackEvent(nome: string, params: Record<string, string | number | boolean> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: nome, ...params });
  window.gtag?.('event', nome, params);
}

export default function VendasNovembro() {
  const [status, setStatus] = useState<WindowStatus | null>(null);
  const [statusIndisponivel, setStatusIndisponivel] = useState(false);
  const [faqAberta, setFaqAberta] = useState<number | null>(null);

  useEffect(() => {
    const anterior = document.title;
    document.title = 'Solar Sem Limites 2026 | Hotel Solar';
    trackEvent('ssl26_vendas_view');
    window.fbq?.('track', 'ViewContent', {
      content_name: 'ssl26_novembro_2026',
      content_category: 'pagina_de_vendas',
    });
    return () => {
      document.title = anterior;
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    fetch('/api/solar-status')
      .then((resposta) => (resposta.ok ? resposta.json() : Promise.reject(resposta.status)))
      .then((dados: WindowStatus) => {
        if (ativo) setStatus(dados);
      })
      .catch(() => {
        // Sem resposta do servidor a página continua informando o programa e as
        // datas anunciadas, mas não oferece compra: só o servidor sabe se a
        // janela está aberta, e supor que sim seria aceitar pedido fora do prazo.
        if (ativo) setStatusIndisponivel(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const podeComprar = status?.aberto === true;
  const encerrado = status?.aberto === false && Boolean(status?.fechaEm) && new Date(status.fechaEm) < new Date();

  // Sem resposta do servidor, a página ainda sabe as datas anunciadas — e
  // informá-las é mais útil e mais honesto que exibir um alarme. O relógio do
  // visitante decide apenas qual frase escrever; nunca se a compra é permitida.
  const faseAnunciada = useMemo(() => {
    const agora = Date.now();
    if (agora < new Date(ABERTURA_ISO).getTime()) return 'antes' as const;
    if (agora > new Date(FECHAMENTO_ISO).getTime()) return 'depois' as const;
    return 'durante' as const;
  }, []);

  const avisoJanela = useMemo(() => {
    if (podeComprar) return { tom: 'aberto' as const, texto: `As vendas estão abertas até ${FECHAMENTO_TEXTO}.` };
    if (encerrado) return { tom: 'encerrado' as const, texto: 'As vendas desta edição foram encerradas.' };
    if (statusIndisponivel) {
      if (faseAnunciada === 'durante') {
        return { tom: 'espera' as const, texto: 'As vendas estão no ar, mas não conseguimos confirmar agora. Recarregue em instantes ou fale com a gente.' };
      }
      if (faseAnunciada === 'depois') {
        return { tom: 'encerrado' as const, texto: 'As vendas desta edição foram encerradas.' };
      }
    }
    return { tom: 'espera' as const, texto: `As vendas abrem em ${ABERTURA_TEXTO}, horário de Belém.` };
  }, [podeComprar, encerrado, statusIndisponivel, faseAnunciada]);

  function registrarClique(origem: string, vaiParaCheckout: boolean) {
    trackEvent('ssl26_vendas_cta', { origem });
    // Rolar até as opções não é iniciar uma compra. Marcar como se fosse
    // encheria o funil da Meta de gente que só desceu a página.
    if (vaiParaCheckout) {
      window.fbq?.('track', 'InitiateCheckout', {
        content_name: 'ssl26_novembro_2026',
        content_category: origem,
      });
    }
  }

  const Cta = ({
    origem,
    children,
    destino = CHECKOUT_URL,
  }: {
    origem: string;
    children: React.ReactNode;
    destino?: string;
  }) => {
    if (!podeComprar) {
      // Três situações diferentes, e dizer a errada custa caro: afirmar a data
      // de abertura quando nem sabemos o estado atual soa confiante logo abaixo
      // de um aviso dizendo que não conseguimos confirmar nada.
      const texto = statusIndisponivel && faseAnunciada === 'durante'
        ? `As vendas estão no ar, mas não conseguimos confirmar agora. Recarregue em instantes ou fale pelo WhatsApp ${WHATSAPP}.`
        : avisoJanela.tom === 'encerrado'
        ? `As vendas foram encerradas. Fale com a gente pelo WhatsApp ${WHATSAPP} para saber das próximas datas.`
        : `As vendas abrem em ${ABERTURA_TEXTO}. Guarde esta página ou acompanhe pelo Canal VIP.`;
      return (
        <div className="rounded-xl border border-[#cbd8d3] bg-[#f4f8f6] px-5 py-4 text-center text-sm leading-relaxed text-[#284f48]">
          {texto}
        </div>
      );
    }
    return (
      <a
        href={destino}
        onClick={() => registrarClique(origem, destino === CHECKOUT_URL)}
        className="block w-full rounded-xl bg-[#0f5c45] px-6 py-4 text-center text-base font-bold text-white transition hover:bg-[#0b3d2e] focus:outline-none focus:ring-4 focus:ring-[#0f5c45]/20"
      >
        {children}
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf7f0] font-sans text-[#173a35]">
      {/* Estado da janela de vendas. Vem do servidor; nunca de data no cliente. */}
      <div
        role="status"
        className={`px-4 py-3 text-center text-sm font-semibold ${
          avisoJanela.tom === 'aberto'
            ? 'bg-[#0f5c45] text-white'
            : avisoJanela.tom === 'encerrado'
            ? 'bg-[#3f3a33] text-white'
            : 'bg-[#f3e8d2] text-[#5c4a22]'
        }`}
      >
        {avisoJanela.texto}
      </div>

      <header className="relative overflow-hidden">
        <img
          src={assetUrl('hotel-panoramica-rio.jpg')}
          alt="Vista panorâmica do Hotel Solar em Salinópolis"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b3d2e]/85 via-[#0b3d2e]/75 to-[#0b3d2e]/90" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center text-white sm:px-6 sm:py-24">
          <img
            src={assetUrl('logoSOLAR2.png')}
            alt="Hotel Solar"
            className="mx-auto mb-8 h-14 w-auto sm:h-16"
          />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e1c084]">
            Solar Sem Limites · Salinópolis, Pará
          </p>
          <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
            Planeje seus próximos dias no Hotel Solar.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#dbe8e4] sm:text-lg">
            Diárias compradas antecipadamente, para usar quando fizer sentido para a sua
            família — com café da manhã, passeio de barco e bicicletas incluídos.
          </p>
          <div className="mx-auto mt-8 max-w-sm">
            <Cta origem="hero" destino="#opcoes">
              Ver as opções
            </Cta>
          </div>
        </div>
      </header>

      {/* O hotel: boa parte de quem chega aqui nunca ouviu falar do Solar. */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
          Primeiro, o hotel
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#52625e]">
          O Hotel Solar fica em Salinópolis, no Pará, na faixa de litoral que chamam de
          Amazônia Atlântica. São 54 apartamentos, com piscina, capela, área de jogos e
          café da manhã colonial. O programa Solar Sem Limites existe desde 2025 e hoje
          tem mais de 50 famílias com diárias ativas.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {GALERIA.map((foto) => (
            <figure key={foto.arquivo} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <img
                src={assetUrl(foto.arquivo)}
                alt={foto.legenda}
                loading="lazy"
                className="h-32 w-full object-cover sm:h-40"
              />
              <figcaption className="px-3 py-2 text-xs text-[#74817d]">{foto.legenda}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* A oferta. Dois pacotes recebem maior destaque visual, sem desconto
          novo — decisão 8 do registro comercial. */}
      <section id="opcoes" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
            As duas opções
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#52625e]">
            A diferença entre elas é a quantidade de diárias e o prazo para usar. Não há
            desconto adicional na opção de dois pacotes: o preço por pacote é o mesmo.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {OPCOES.map((opcao) => (
              <article
                key={opcao.pacotes}
                className={`relative rounded-2xl border p-6 sm:p-7 ${
                  opcao.destaque
                    ? 'border-[#0f5c45] bg-[#f4f8f6] shadow-lg md:-mt-3 md:pb-10'
                    : 'border-[#e0ded7] bg-white'
                }`}
              >
                {opcao.destaque && (
                  <span className="absolute -top-3 left-6 rounded-full bg-[#0f5c45] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Mais tempo para usar
                  </span>
                )}
                <h3 className="font-serif text-xl font-semibold sm:text-2xl">{opcao.titulo}</h3>
                <p className="mt-1 text-sm font-semibold text-[#0f5c45]">{opcao.diarias}</p>

                <p className="mt-5 font-serif text-3xl font-semibold sm:text-4xl">
                  {brl(PRECO_BASE_CENTAVOS * opcao.pacotes)}
                </p>
                <p className="text-sm text-[#74817d]">no Pix, transferência ou depósito</p>

                <p className="mt-3 text-sm leading-relaxed text-[#52625e]">
                  No cartão: {brl(precoCartao(opcao.pacotes))} com o acréscimo de 10%, em até{' '}
                  {PARCELAS_MAX}x de {brl(parcelaCartao(opcao.pacotes))}.
                </p>

                <ul className="mt-6 space-y-2 text-sm leading-relaxed text-[#284f48]">
                  <li>{opcao.composicao}</li>
                  <li>{opcao.validade}</li>
                  <li>Até 4 pessoas no apartamento quádruplo</li>
                  <li>Café da manhã, passeio de barco e bicicletas inclusos</li>
                </ul>

                <p className="mt-4 text-xs leading-relaxed text-[#74817d]">
                  A diária bônus vale em baixa temporada, fora de férias e feriados.
                </p>

                <div className="mt-6">
                  <Cta origem={`opcao_${opcao.pacotes}`}>
                    {opcao.pacotes === 1 ? 'Quero um pacote' : 'Quero dois pacotes'}
                  </Cta>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-[#e0ded7] bg-[#faf9f6] p-5 text-sm leading-relaxed text-[#52625e]">
            <strong className="text-[#173a35]">Também dá para combinar:</strong> uma entrada
            no Pix e o saldo no cartão. O acréscimo de 10% incide apenas sobre a parte
            financiada no cartão.
          </div>
        </div>
      </section>

      {/* Prova social. Os depoimentos serão trocados por vídeo conforme os
          clientes gravarem; a estrutura já comporta os dois formatos. */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
          Quem já usou
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {DEPOIMENTOS.map((depoimento) => (
            <blockquote
              key={depoimento.autor}
              className="rounded-2xl border border-[#e0ded7] bg-white p-6 shadow-sm"
            >
              <p className="leading-relaxed text-[#284f48]">“{depoimento.texto}”</p>
              <footer className="mt-4 text-sm font-semibold text-[#0f5c45]">
                {depoimento.autor}
                <span className="ml-2 font-normal text-[#74817d]">{depoimento.cidade}</span>
              </footer>
            </blockquote>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-6 opacity-80">
          <img src={assetUrl('google-reviews-logo.png')} alt="Avaliações no Google" className="h-7 w-auto" loading="lazy" />
          <img src={assetUrl('booking-logo.png')} alt="Avaliações no Booking" className="h-6 w-auto" loading="lazy" />
        </div>
      </section>

      {/* Garantias, exatamente como no item 7 do regulamento. */}
      <section className="bg-[#0b3d2e] px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
            O que está garantido em contrato
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {GARANTIAS.map((garantia) => (
              <div key={garantia.titulo} className="rounded-2xl bg-white/10 p-6">
                <h3 className="font-serif text-lg font-semibold text-[#e1c084]">{garantia.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#dbe8e4]">{garantia.texto}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-[#a9c2ba]">
            Condições completas no{' '}
            <a href={assetUrl(REGULAMENTO_URL)} target="_blank" rel="noopener noreferrer" className="underline">
              regulamento
            </a>
            .
          </p>
        </div>
      </section>

      {/* Regras de uso, antes do FAQ: quem está decidindo precisa saber o que
          está comprando sem ter que procurar. */}
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
          Como funciona, sem letra miúda
        </h2>
        <div className="mt-10 space-y-5">
          {REGRAS.map((regra) => (
            <div key={regra.titulo} className="rounded-xl border-l-4 border-[#d6ad5b] bg-white p-5 shadow-sm">
              <h3 className="font-bold text-[#173a35]">{regra.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#52625e]">{regra.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Indicação: o incentivo é declarado, não escondido. */}
      <section className="bg-[#f3e8d2] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Programa de indicação</h2>
          <p className="mt-4 leading-relaxed text-[#5c4a22]">
            Quem compra recebe 1 diária adicional de baixa temporada a cada novo comprador
            indicado com pagamento aprovado, limitado a 2 diárias por CPF. O crédito é
            liberado somente depois que o pagamento do indicado for aprovado.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
          Perguntas frequentes
        </h2>
        <div className="mt-10 divide-y divide-[#e0ded7] overflow-hidden rounded-2xl border border-[#e0ded7] bg-white">
          {FAQ.map((item, indice) => {
            const aberta = faqAberta === indice;
            return (
              <div key={item.pergunta}>
                <button
                  type="button"
                  onClick={() => setFaqAberta(aberta ? null : indice)}
                  aria-expanded={aberta}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#faf9f6]"
                >
                  <span className="font-semibold text-[#173a35]">{item.pergunta}</span>
                  <span aria-hidden="true" className="shrink-0 text-xl text-[#0f5c45]">
                    {aberta ? '−' : '+'}
                  </span>
                </button>
                {aberta && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-[#52625e]">{item.resposta}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            {podeComprar ? 'Garanta suas diárias' : 'Solar Sem Limites 2026'}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#52625e]">
            {podeComprar
              ? `As vendas vão até ${FECHAMENTO_TEXTO}, horário de Belém.`
              : `Abertura em ${ABERTURA_TEXTO} e encerramento em ${FECHAMENTO_TEXTO}, horário de Belém.`}
          </p>
          <div className="mt-6">
            <Cta origem="rodape">Ir para o checkout</Cta>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-[#74817d]">
            Dúvidas? WhatsApp {WHATSAPP} ou {EMAIL_RESERVAS}.
          </p>
        </div>
      </section>

      <footer className="bg-[#0b3d2e] px-4 py-10 text-center text-sm text-[#a9c2ba] sm:px-6">
        <p>Hotel Solar · Av. Atlântica, 634–672, Salinópolis – PA</p>
        <p className="mt-2">
          <a href={assetUrl(REGULAMENTO_URL)} target="_blank" rel="noopener noreferrer" className="underline">
            Regulamento Solar Sem Limites
          </a>
        </p>
        <p className="mt-4 text-xs leading-relaxed text-[#7e968f]">
          Reservas sujeitas à disponibilidade na data solicitada, conforme o regulamento.
          A diária bônus é cortesia válida em baixa temporada, fora de férias e feriados.
        </p>
      </footer>
    </div>
  );
}
