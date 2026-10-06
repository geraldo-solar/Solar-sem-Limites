import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AVISO_DE_PRIVACIDADE_URL } from './avisoDePrivacidade';
import { registrarIndicacaoDaUrl } from './codigoDeIndicacao';
import VideoVendas from './VideoVendas';
import { VIDEO_APRESENTACAO, VIDEO_EXPLICACAO, VIDEOS_DEPOIMENTOS } from './videosVendas';
import { testeManualCheckoutAtivo, testeRealCheckoutAtivo } from './testeManualCheckout';
import { NOME_DO_PACOTE, TITULO_DO_PACOTE } from './nomeDoPacote';
import {
  EMAIL_RESERVAS, IconeTelefone, IconeWhatsApp, linkWhatsApp, MENSAGEM_DUVIDA, TELEFONE_HOTEL, TELEFONE_LINK,
  WHATSAPP_ATENDIMENTO,
} from './contatosDoHotel';

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
// Telefones, WhatsApp e ícones vêm de contatosDoHotel.tsx, compartilhado com
// o checkout e o retorno do pagamento. Na página de vendas o clique no WhatsApp
// não conta como conversão do Google Ads (configurado no index.html publicado).
const WHATSAPP_LINK = linkWhatsApp(MENSAGEM_DUVIDA);

// Data anunciada de encerramento. Serve só para o que a página escreve na
// tela. Quem autoriza a compra é sempre o servidor, nunca esta constante nem o
// relógio do visitante. Desde 06/10/2026 a página não anuncia mais data de
// abertura: o botão de compra fica ativo sempre que o servidor confirma.
const FECHAMENTO_TEXTO = '1º de dezembro, às 23h59';
const FECHAMENTO_ISO = '2026-12-01T23:59:59-03:00';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}${fileName.replace(/^\/+/, '')}`;

const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Valor redondo, sem centavos, para espaços curtos como a barra do celular.
const brlInteiro = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

// Preço-base no Pix/transferência/depósito. O cartão recebe acréscimo de 10%
// sobre o valor processado, em até 12x — decisão 7 do registro comercial.
const PRECO_BASE_CENTAVOS = 310_000;
const ACRESCIMO_CARTAO = 0.1;
const PARCELAS_MAX = 12;

const precoCartao = (pacotes: number) =>
  Math.round(PRECO_BASE_CENTAVOS * pacotes * (1 + ACRESCIMO_CARTAO));

const parcelaCartao = (pacotes: number) => Math.round(precoCartao(pacotes) / PARCELAS_MAX);

// Dois pacotes vêm primeiro, no celular e no computador. A decisão 8 do
// registro comercial pede maior destaque visual para essa opção, e empilhada em
// segundo lugar ela só recebia o selo — quem decidisse no primeiro cartão nem
// chegava a vê-la.
const OPCOES = [
  {
    pacotes: 2,
    titulo: 'Dois pacotes',
    diarias: '12 diárias',
    composicao: '10 diárias regulares + 2 diárias bônus',
    validade: 'Validade de 2 anos a partir da compra',
    destaque: true,
  },
  {
    pacotes: 1,
    titulo: 'Um pacote',
    diarias: '6 diárias',
    composicao: '5 diárias regulares + 1 diária bônus',
    validade: 'Validade de 1 ano a partir da compra',
    destaque: false,
  },
] as const;

// Fotos reais do hotel, já usadas e autorizadas nas peças da campanha.
const GALERIA = [
  { arquivo: 'quarto-hotel-solar.jpg', legenda: 'Apartamento quádruplo' },
  { arquivo: 'hotel-piscina.jpg', legenda: 'Área da piscina' },
  { arquivo: 'hotel-cafe-manha.jpg', legenda: 'Café da manhã regional' },
  { arquivo: 'blog-espadarte.png', legenda: 'Praia Ponta do Espadarte' },
  { arquivo: 'hotel-capela.jpg', legenda: 'Capela histórica' },
  { arquivo: 'hotel-playground-criancas.jpg', legenda: 'Parque infantil' },
  { arquivo: 'hotel-area-jogos.jpg', legenda: 'Sala de jogos' },
  { arquivo: 'galeria-aerea.jpg', legenda: 'Salinópolis do alto' },
];

// Todos os números e distâncias abaixo saem do conteúdo publicado pelo próprio
// hotel em hotelsolar.tur.br, mais a contagem de apartamentos das definições
// comerciais. Nada aqui é estimativa.
const FATOS = [
  { numero: '1973', rotulo: 'ano em que o hotel abriu' },
  { numero: '54', rotulo: 'apartamentos' },
  { numero: '220 km', rotulo: 'de Belém, 3 a 4 horas de carro' },
  { numero: '800 m', rotulo: 'até a praia do Maçarico' },
];

const ESTRUTURA = [
  'Piscina e bar da piscina',
  'Restaurante e trapiche sobre a água',
  'Café da manhã regional incluso',
  'Sala de jogos e quadra poliesportiva',
  'Parque infantil e hidromassagem',
  'Capela histórica',
  'Recepção 24 horas e Wi-Fi',
  'Acesso a uma faixa de praia tranquila',
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
    texto: `A reserva é garantida desde que haja vaga na data solicitada. O pedido é feito pelo WhatsApp ${TELEFONE_HOTEL} ou por ${EMAIL_RESERVAS}.`,
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
// prometia crédito vitalício, que o contrato não dá: são 360 dias.
//
// O reembolso após o primeiro check-in era o inverso — o regulamento dizia
// "valor integral" e o texto aceito no checkout dizia "proporcional". Geraldo
// decidiu em 22/09 que o proporcional é a regra, e os três foram alinhados.
const GARANTIAS = [
  {
    titulo: '30 dias para desistir',
    texto: 'Cancelou dentro de 30 dias após a compra? Devolvemos 100% do valor do pacote, sem perguntas e sem burocracia. No cartão, o acréscimo de 10% da operadora não é devolvido.',
  },
  {
    titulo: 'Arrependimento no primeiro check-in',
    texto: 'Em caso de arrependimento imediatamente após o primeiro check-in, cancelamos a compra e devolvemos o valor proporcional às diárias não utilizadas.',
  },
  {
    titulo: 'Crédito por 360 dias',
    texto: 'Terminada a vigência, o valor das diárias não utilizadas fica como crédito para reservas futuras por 360 dias.',
  },
];

const FAQ = [
  {
    pergunta: 'Como se chega ao Hotel Solar?',
    resposta: 'O hotel fica em Salinópolis, no Pará, a cerca de 220 km de Belém — de 3 a 4 horas de carro. Fica na parte alta da cidade, a 800 metros da praia do Maçarico e a 15 minutos da praia do Atalaia.',
  },
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
  const testeReal = testeRealCheckoutAtivo();
  const modoTeste = testeManualCheckoutAtivo() || testeReal;
  const [status, setStatus] = useState<WindowStatus | null>(null);
  const [statusIndisponivel, setStatusIndisponivel] = useState(false);
  const [faqAberta, setFaqAberta] = useState<number | null>(null);
  const [mostrarBarra, setMostrarBarra] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const opcoesRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLElement>(null);

  // Barra fixa do celular: aparece depois do topo e some quando os cartões com
  // os botões de compra ou o botão final já estão na tela, para não repetir o
  // que se vê.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const visiveis = new Set<Element>();
    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) visiveis.add(entrada.target);
        else visiveis.delete(entrada.target);
      }
      setMostrarBarra(visiveis.size === 0);
    });
    for (const ref of [heroRef, opcoesRef, finalRef]) if (ref.current) observador.observe(ref.current);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (modoTeste) return;
    const anterior = document.title;
    document.title = TITULO_DO_PACOTE;
    // Guarda o código de indicação do link antes de qualquer navegação: o
    // visitante pode ir direto ao checkout sem passar por mais nada.
    const indicacao = registrarIndicacaoDaUrl();
    trackEvent('ssl26_vendas_view', indicacao ? { indicacao_presente: true } : {});
    window.fbq?.('track', 'ViewContent', {
      content_name: 'ssl26_novembro_2026',
      content_category: 'pagina_de_vendas',
    });
    return () => {
      document.title = anterior;
    };
  }, [modoTeste]);

  useEffect(() => {
    if (modoTeste) return;
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
  }, [modoTeste]);

  // Se o encerramento anunciado já passou, segundo o relógio do visitante.
  const passouDoFechamento = useMemo(() => Date.now() > new Date(FECHAMENTO_ISO).getTime(), []);

  // Decisão de 06/10/2026: o botão de compra fica ativo antes de 25/11, para
  // testes e venda antecipada. Vale a resposta do servidor (o ERP responde
  // "aberto" o ano inteiro) até o encerramento anunciado.
  //
  // O relógio do visitante entra apenas para SEGURAR a oferta depois do
  // fechamento, nunca para liberá-la. Adiantar o relógio não abre o carrinho —
  // e a ingestão do ERP recusa pedido fora do prazo de qualquer forma.
  const podeComprar = status?.aberto === true && !passouDoFechamento;
  const encerrado = (status?.aberto === false && Boolean(status?.fechaEm) && new Date(status.fechaEm) < new Date())
    || passouDoFechamento;

  const avisoJanela = useMemo(() => {
    // No teste local o status não é consultado; a faixa mostra o que o visitante veria.
    if (podeComprar || modoTeste) return { tom: 'aberto' as const, texto: `As vendas estão abertas até ${FECHAMENTO_TEXTO}.` };
    if (encerrado) return { tom: 'encerrado' as const, texto: 'As vendas desta edição foram encerradas.' };
    if (statusIndisponivel) {
      return { tom: 'espera' as const, texto: 'As vendas estão no ar, mas não conseguimos confirmar agora. Recarregue em instantes ou fale com a gente.' };
    }
    // O servidor ainda não respondeu ou não confirma abertura.
    if (status) {
      return { tom: 'espera' as const, texto: `As vendas não estão disponíveis neste momento. Fale com a gente pelo WhatsApp ${WHATSAPP_ATENDIMENTO} ou ligue para ${TELEFONE_HOTEL}.` };
    }
    return { tom: 'espera' as const, texto: 'Consultando a disponibilidade das vendas…' };
  }, [podeComprar, modoTeste, encerrado, statusIndisponivel, status]);

  function registrarClique(origem: string, vaiParaCheckout: boolean) {
    if (modoTeste) return;
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

  function registrarWhatsApp(origem: string) {
    if (modoTeste) return;
    trackEvent('ssl26_vendas_whatsapp', { origem });
  }

  function registrarLigacao(origem: string) {
    if (modoTeste) return;
    trackEvent('ssl26_vendas_ligacao', { origem });
  }

  const LinkLigacao = ({
    origem,
    children,
    className,
    rotulo,
  }: {
    origem: string;
    children: React.ReactNode;
    className?: string;
    rotulo?: string;
  }) => (
    <a href={TELEFONE_LINK} aria-label={rotulo} onClick={() => registrarLigacao(origem)} className={className}>
      {children}
    </a>
  );

  const LinkWhatsApp = ({
    origem,
    children,
    className,
    rotulo,
  }: {
    origem: string;
    children: React.ReactNode;
    className?: string;
    rotulo?: string;
  }) => (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={rotulo}
      onClick={() => registrarWhatsApp(origem)}
      className={className}
    >
      {children}
    </a>
  );

  // Pergunta aberta logo depois de onde surgem as objeções (regras, perguntas).
  // Mensagem pelo WhatsApp do ManyChat; quem prefere ouvir alguém liga para o
  // telefone do hotel, porque o número do ManyChat não recebe ligações.
  const DuvidaNoWhatsApp = ({ origem }: { origem: string }) => (
    <p className="mt-8 text-center text-sm leading-relaxed text-[#52625e]">
      Ficou alguma dúvida?{' '}
      <LinkWhatsApp origem={origem} className="font-semibold text-[#0f5c45] underline">
        Fale com a gente no WhatsApp
      </LinkWhatsApp>{' '}
      ou ligue para{' '}
      <LinkLigacao origem={origem} className="whitespace-nowrap font-semibold text-[#0f5c45] underline">
        {TELEFONE_HOTEL}
      </LinkLigacao>
      .
    </p>
  );

  const Cta = ({
    origem,
    children,
    destino = CHECKOUT_URL,
    claro = false,
  }: {
    origem: string;
    children: React.ReactNode;
    destino?: string;
    claro?: boolean;
  }) => {
    if (!podeComprar && !modoTeste) {
      const texto = avisoJanela.tom === 'encerrado'
        ? `As vendas foram encerradas. Fale com a gente pelo WhatsApp ${WHATSAPP_ATENDIMENTO} ou ligue para ${TELEFONE_HOTEL} para saber das próximas datas.`
        : avisoJanela.texto;
      return (
        <div className="rounded-xl border border-[#cbd8d3] bg-[#f4f8f6] px-5 py-4 text-center text-sm leading-relaxed text-[#284f48]">
          {texto}
        </div>
      );
    }
    return (
      <a
        href={destino}
        onClick={() => registrarClique(origem, destino.split('?')[0] === CHECKOUT_URL)}
        className={`block w-full rounded-xl px-6 py-4 text-center text-base font-bold transition focus:outline-none focus:ring-4 ${
          claro
            ? 'bg-[#e1c084] text-[#0b3d2e] hover:bg-[#d6ad5b] focus:ring-[#e1c084]/30'
            : 'bg-[#0f5c45] text-white hover:bg-[#0b3d2e] focus:ring-[#0f5c45]/20'
        }`}
      >
        {children}
      </a>
    );
  };

  return (
    <div className={`min-h-screen bg-[#faf7f0] font-sans text-[#173a35] ${podeComprar || modoTeste ? 'pb-20 sm:pb-0' : ''}`}>
      {modoTeste && (
        <aside className="border-b border-amber-300 bg-amber-100 px-4 py-4 text-center text-sm leading-relaxed text-amber-950">
          <strong className="block">{testeReal ? 'Teste real local — pedido, e-mails e pagamento ativos' : 'Modo de teste local — botões ativos'}</strong>
          {testeReal
            ? 'Ao finalizar, o pedido entra no ERP e envia e-mails reais. Pix e Cielo usam valores reais. Restrito ao cadastro autorizado, sem abrir o carrinho público.'
            : 'Você pode navegar, preencher e conferir os valores. Nenhum pedido, e-mail ou cobrança será gerado.'}
        </aside>
      )}
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

      <header ref={heroRef} className="relative overflow-hidden">
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
            {NOME_DO_PACOTE} · Salinópolis, Pará
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

      {/* O hotel.
          A maior parte de quem chega aqui vem de anúncio e nunca ouviu falar do
          Solar — são 3.500 leads previstos de tráfego pago, decidindo R$ 3.100
          antecipados num lugar que nunca viram. Esta seção existe para responder
          o que essa pessoa precisa saber antes de olhar preço: onde fica, o que
          tem, e há quanto tempo o hotel existe. */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
          Primeiro, o hotel
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#52625e]">
          O Hotel Solar recebe hóspedes em Salinópolis, no Pará, <strong>desde 1973</strong>.
          Fica na parte alta da cidade, com vista para o mar, a 800 metros da praia do
          Maçarico e a 15 minutos da praia do Atalaia — e com acesso a uma faixa de praia
          tranquila, longe do movimento das mais cheias.
        </p>

        <div className="mt-8 sm:mt-10">
          <VideoVendas conteudo={VIDEO_APRESENTACAO} destaque />
        </div>

        <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 text-center sm:grid-cols-4">
          {FATOS.map((fato) => (
            <div key={fato.rotulo} className="rounded-xl bg-white px-2 py-5 shadow-sm">
              <dt className="sr-only">{fato.rotulo}</dt>
              <dd>
                <span className="block font-serif text-2xl font-semibold text-[#0f5c45] sm:text-3xl">
                  {fato.numero}
                </span>
                <span className="mt-1 block text-xs leading-snug text-[#74817d]">{fato.rotulo}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {GALERIA.map((foto) => (
            <figure key={foto.arquivo} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <img
                src={assetUrl(foto.arquivo)}
                alt={foto.legenda}
                loading="lazy"
                className="h-32 w-full object-cover sm:h-36"
              />
              <figcaption className="px-3 py-2 text-xs leading-snug text-[#74817d]">
                {foto.legenda}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[#e0ded7] bg-white p-6 sm:p-7">
          <h3 className="font-serif text-lg font-semibold sm:text-xl">O que tem no hotel</h3>
          <ul className="mt-4 grid gap-x-6 gap-y-2 text-sm leading-relaxed text-[#284f48] sm:grid-cols-2">
            {ESTRUTURA.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-[#0f5c45]">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-[#e0ded7] bg-[#f4f8f6] p-6 sm:p-7">
          <h3 className="font-serif text-lg font-semibold sm:text-xl">
            O passeio de barco que já vem incluído
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[#52625e]">
            Um passeio pelos manguezais do Rio Arapepó, conduzido por uma associação local
            de pescadores, terminando com banho na Praia Ponta do Espadarte. Ele não é um
            extra a comprar: está incluído nas diárias do pacote, junto com o café da manhã
            e as bicicletas.
          </p>
        </div>
      </section>

      {/* A oferta. Dois pacotes recebem maior destaque visual, sem desconto
          novo — decisão 8 do registro comercial. */}
      <section id="opcoes" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 sm:mb-12">
            <VideoVendas conteudo={VIDEO_EXPLICACAO} destaque />
          </div>
          <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
            As duas opções
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#52625e]">
            A diferença entre elas é a quantidade de diárias e o prazo para usar. Não há
            desconto adicional na opção de dois pacotes: o preço por pacote é o mesmo.
          </p>

          <div ref={opcoesRef} className="mt-10 grid gap-6 md:grid-cols-2">
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
                  <Cta origem={`opcao_${opcao.pacotes}`} destino={`${CHECKOUT_URL}?pacotes=${opcao.pacotes}`}>
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

      {/* Os vídeos têm espaços próprios; os relatos confirmados em texto
          continuam disponíveis e não são atribuídos às gravações futuras. */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="text-center font-serif text-2xl font-semibold sm:text-3xl">
          Quem já usou
        </h2>
        <div className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-2">
          {VIDEOS_DEPOIMENTOS.map((video) => (
            <div key={video.id} className="min-w-0">
              <VideoVendas conteudo={video} />
            </div>
          ))}
        </div>
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
        <div className="mx-auto mt-10 max-w-sm">
          <Cta origem="apos_depoimentos" destino="#opcoes">
            Escolher meu pacote
          </Cta>
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
          <div className="mx-auto mt-8 max-w-sm">
            <Cta origem="apos_garantias" destino="#opcoes" claro>
              Escolher meu pacote
            </Cta>
          </div>
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
        <DuvidaNoWhatsApp origem="apos_regras" />
      </section>

      {/* Indicação: o incentivo é declarado, não escondido. */}
      <section className="bg-[#f3e8d2] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Programa de indicação</h2>
          <p className="mt-4 leading-relaxed text-[#5c4a22]">
            Quem compra recebe um link individual e ganha 1 diária adicional de baixa
            temporada a cada novo comprador que comprar por ele com pagamento aprovado,
            limitado a 5 diárias por CPF. A diária é liberada 30 dias após a compra do
            indicado, com a validade do seu pacote mais recente. Condições no regulamento.
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
        <DuvidaNoWhatsApp origem="apos_perguntas" />
      </section>

      <section ref={finalRef} className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
            {podeComprar ? 'Garanta suas diárias' : NOME_DO_PACOTE}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#52625e]">
            {encerrado
              ? 'As vendas desta edição foram encerradas.'
              : `As vendas vão até ${FECHAMENTO_TEXTO}, horário de Belém.`}
          </p>
          <div className="mt-6">
            <Cta origem="rodape">Ir para o checkout</Cta>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-[#74817d]">
            Dúvidas?{' '}
            <LinkWhatsApp origem="rodape" className="whitespace-nowrap font-semibold text-[#0f5c45] underline">
              WhatsApp {WHATSAPP_ATENDIMENTO}
            </LinkWhatsApp>
            , ligação{' '}
            <LinkLigacao origem="rodape" className="whitespace-nowrap font-semibold text-[#0f5c45] underline">
              {TELEFONE_HOTEL}
            </LinkLigacao>{' '}
            ou{' '}
            <a href={`mailto:${EMAIL_RESERVAS}`} className="underline">
              {EMAIL_RESERVAS}
            </a>
            .
          </p>
        </div>
      </section>

      <footer className="bg-[#0b3d2e] px-4 py-10 text-center text-sm text-[#a9c2ba] sm:px-6">
        <p>Hotel Solar · Av. Atlântica, 634–672, Salinópolis – PA</p>
        <p className="mt-2">
          <a href={assetUrl(REGULAMENTO_URL)} target="_blank" rel="noopener noreferrer" className="underline">
            Regulamento Solar Sem Limites
          </a>
          {' · '}
          <a href={AVISO_DE_PRIVACIDADE_URL} target="_blank" rel="noopener noreferrer" className="underline">
            Aviso de Privacidade
          </a>
        </p>
        <p className="mt-4 text-xs leading-relaxed text-[#7e968f]">
          Reservas sujeitas à disponibilidade na data solicitada, conforme o regulamento.
          A diária bônus é cortesia válida em baixa temporada, fora de férias e feriados.
        </p>
      </footer>

      {/* Celular: barra fixa com o caminho de compra e o WhatsApp lado a lado.
          Só existe quando o servidor confirma vendas abertas, como os botões. */}
      {(podeComprar || modoTeste) && (
        <div
          inert={!mostrarBarra}
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#d9e3df] bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-300 sm:hidden ${
            mostrarBarra ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <p className="min-w-0 flex-1 text-xs leading-tight text-[#52625e]">
              a partir de
              <strong className="block text-sm text-[#173a35]">{brlInteiro(PRECO_BASE_CENTAVOS)} no Pix</strong>
            </p>
            <LinkLigacao
              origem="barra_celular"
              rotulo={`Ligar para o hotel, ${TELEFONE_HOTEL}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#cbd8d3] bg-white text-[#0f5c45]"
            >
              <IconeTelefone />
            </LinkLigacao>
            <LinkWhatsApp
              origem="barra_celular"
              rotulo="Tirar dúvidas no WhatsApp"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white"
            >
              <IconeWhatsApp />
            </LinkWhatsApp>
            <a
              href="#opcoes"
              onClick={() => registrarClique('barra_celular', false)}
              className="shrink-0 rounded-xl bg-[#0f5c45] px-4 py-3 text-sm font-bold text-white"
            >
              Ver opções
            </a>
          </div>
        </div>
      )}

      {/* Computador: WhatsApp e telefone flutuantes. No celular eles vivem na barra. */}
      <div className="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-2 sm:flex">
        <LinkWhatsApp
          origem="flutuante"
          className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1ebe5a]"
        >
          <IconeWhatsApp />
          Dúvidas? WhatsApp
        </LinkWhatsApp>
        <LinkLigacao
          origem="flutuante"
          className="flex items-center gap-2 rounded-full border border-[#cbd8d3] bg-white px-4 py-2 text-sm font-semibold text-[#0f5c45] shadow-md transition hover:bg-[#f4f8f6]"
        >
          <IconeTelefone />
          Prefere ligar? {TELEFONE_HOTEL}
        </LinkLigacao>
      </div>
    </div>
  );
}
