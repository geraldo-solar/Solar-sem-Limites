import { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { Section } from './components/Section';
import {
  IconCalendar, IconCoffee, IconStar, IconUsers,
  IconShip, IconTransfer, IconShield, IconCheck, IconX,
  IconChevronDown, IconChevronUp, IconClock, IconPlay, IconWhatsApp,
  IconGoogle, IconBooking, IconTripAdvisor, IconHeart, IconBan
} from './components/Icons';

// FAQ Data
const faqData = [
  { question: "Posso usar nos feriados?", answer: "Sim! O pacote Solar Sem Limites oferece datas totalmente flexíveis, incluindo feriados e alta temporada, sujeito apenas à disponibilidade do hotel no momento da reserva." },
  { question: "Posso usar mais de um apartamento?", answer: "Sim. Se você viajar com um grupo maior, pode utilizar seus créditos de diárias para reservar múltiplos apartamentos simultaneamente na baixa temporada." },
  { question: "Posso presentear alguém com as diárias?", answer: "Com certeza. O pacote permite a transferência parcial ou total das diárias para terceiros, tornando-o um presente inesquecível." },
  { question: "O que acontece se não houver disponibilidade?", answer: "Trabalhamos com prioridade para membros Solar Sem Limites. Caso a data exata esteja lotada, nossa equipe oferecerá as datas mais próximas ou upgrades disponíveis." },
  { question: "É seguro comprar antecipado?", answer: "Totalmente. O Hotel Solar tem 52 anos de tradição. Além disso, oferecemos uma garantia incondicional de 30 dias para devolução do seu dinheiro." },
  { question: "Como funciona o passeio incluso?", answer: "Você ganha um voucher para um passeio de barco exclusivo pela orla de Salinópolis. Basta agendar na recepção durante sua estadia." }
];

const App: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Countdown timer - 48 hours rolling
  useEffect(() => {
    // Check if we already have a target date in localStorage
    const savedDate = localStorage.getItem('solarSemLimitesTargetDate');
    let targetDate: number;

    if (savedDate) {
      targetDate = parseInt(savedDate, 10);
    } else {
      // Set to 48 hours from now
      targetDate = new Date().getTime() + 48 * 60 * 60 * 1000;
      localStorage.setItem('solarSemLimitesTargetDate', targetDate.toString());
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const goToCheckout = () => {
    window.location.href = 'https://checkout-solar-sem-limites.vercel.app';
  };

  return (
    <div className="font-sans antialiased text-solar-deep selection:bg-solar-gold selection:text-solar-deep relative pb-24 md:pb-0">

      {/* STICKY URGENCY BANNER */}
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white z-50 text-center py-2 px-4 shadow-xl border-b border-red-800 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 animate-slide-down">
        <span className="font-bold flex items-center shadow-text">
          <span className="animate-pulse mr-2">⚠️</span>
          CARRINHO REABERTO: ÚLTIMAS VAGAS DISPONÍVEIS
        </span>
        <div className="flex items-center space-x-2 bg-red-800/50 px-3 py-1 rounded-full text-sm font-mono tracking-widest">
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <header className="relative min-h-screen flex items-center justify-center bg-solar-deep overflow-hidden pt-12 md:pt-0">
        {/* Abstract Background Texture */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-solar-deep/90 z-0"></div>

        {/* Background Image Suggestion - darkened */}
        <img
          src="https://picsum.photos/1920/1080?image=1039"
          alt="Hotel Solar Luxury Pool"
          className="absolute inset-0 w-full h-full object-cover opacity-30 z-[-1]"
        />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-8 animate-fade-in-up flex flex-col items-center">

          {/* Logo Hotel Solar */}
          <div className="mb-6">
            <img
              src="/logoSOLAR2.png"
              alt="Hotel Solar"
              className="h-20 md:h-24 w-auto drop-shadow-lg opacity-95"
            />
          </div>

          {/* LOGO SECTION - TEXT BASED */}
          <div className="relative w-full mb-4 animate-float">
            {/* Elegant Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-solar-gold/10 blur-[60px] rounded-full z-0"></div>

            <h1 className="relative z-10 flex flex-col items-center justify-center leading-none">
              <span className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#F9E8C9] via-solar-gold to-[#B88A44] drop-shadow-lg tracking-wide">
                SOLAR
              </span>
              <span className="font-serif text-3xl md:text-5xl lg:text-6xl font-light italic text-solar-beige tracking-widest mt-2 drop-shadow-md">
                SEM LIMITES
              </span>
            </h1>
          </div>

          <h2 className="font-serif text-xl md:text-3xl text-solar-beige/90 font-light leading-relaxed max-w-3xl">
            A Pedidos: Última chance para entrar no <span className="text-white font-semibold italic">Grupo Seleto de Hóspedes VIP</span>.
          </h2>
          <p className="text-base md:text-lg text-solar-cream/70 tracking-widest uppercase border-t border-b border-solar-gold/30 py-4 inline-block">
            Reabrimos poucas vagas por tempo limitadíssimo
          </p>
          <div className="pt-8">
            <Button onClick={goToCheckout} className="text-lg md:text-xl px-12 md:px-16 py-5 md:py-6 shadow-2xl shadow-solar-gold/20 animate-heartbeat">
              Garantir minha vaga remanescente agora
            </Button>
          </div>
        </div>
      </header>

      {/* 1.5 AWARDS / AUTHORITY BAR */}
      <div className="bg-gradient-to-b from-white to-solar-beige/20 border-b border-solar-gold/30 shadow-lg relative z-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-center text-solar-amazon/70 text-sm uppercase tracking-widest mb-8 font-bold">
            🏆 Excelência Reconhecida Pelos Hóspedes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center justify-items-center">

            {/* Google */}
            <div className="flex flex-col items-center justify-center w-full p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <img src="/google-reviews-logo.png" alt="Google Reviews" className="w-64 h-auto object-contain mb-3" />
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconStar key={star} className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : star === 5 ? 'text-yellow-400 fill-yellow-400 opacity-60' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-2xl font-bold text-solar-deep">4.6</span>
              </div>
            </div>

            {/* Booking */}
            <div className="flex flex-col items-center justify-center w-full p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="bg-white p-4 rounded-lg mb-3">
                <img src="/booking-logo.png" alt="Booking.com" className="w-64 h-auto object-contain" />
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#003580] text-white px-3 py-1 rounded font-bold text-xl">8.7</div>
                <span className="text-sm font-semibold text-solar-deep">Fabuloso</span>
              </div>
            </div>

            {/* TripAdvisor */}
            <div className="flex items-center justify-center w-full p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <img src="/tripadvisor-logo.png" alt="TripAdvisor Certificado de Excelência 2019" className="w-64 h-auto object-contain" />
            </div>

          </div>
        </div>
      </div>

      {/* 2. STORYTELLING & JUSTIFICATIVA DE REABERTURA */}
      <Section className="bg-solar-beige bg-fiber-texture">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <h3 className="font-serif text-4xl text-solar-deep mb-6 relative inline-block">
              Por que estamos <span className="text-solar-amazon italic text-red-700">Reabrindo?</span>
              <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-solar-gold"></span>
            </h3>

            <div className="bg-white/60 p-8 border-l-4 border-solar-gold shadow-sm mb-8 rounded-r-lg">
              <p className="font-sans text-lg text-solar-deep/90 leading-relaxed font-medium">
                "Inacreditável. O lote esgotou em poucas horas na nossa abertura oficial..."
              </p>
            </div>

            <div className="font-sans text-lg text-solar-deep/80 space-y-6 leading-relaxed text-justify">
              <p>
                Como muitas pessoas da nossa lista tentaram comprar mas tiveram <strong>problemas com o limite do cartão de crédito ou boletos que acabaram não sendo pagos</strong>, o sistema cancelou automaticamente as reservas não confirmadas.
              </p>
              <p>
                Nós recebemos dezenas de mensagens no WhatsApp de clientes fiéis pedindo uma segunda chance para garantir o pacote com o preço de lançamento.
              </p>
              <p className="font-semibold text-solar-amazon">
                Por isso, decidimos reunir esses poucos acessos que voltaram e reabrir os convites por exatas 48 horas (ou até eles esgotarem novamente). Esta é a sua oportunidade exclusiva de garantir o status de Membro VIP e viajar pagando muito menos.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. INCLUSIONS */}
      <Section className="bg-white">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* List Content */}
          <div className="lg:col-span-7 space-y-10">
            <div className="mb-12">
              <h3 className="font-serif text-4xl text-solar-deep mb-2">O Que o Pacote Inclui</h3>
              <p className="text-solar-amazon font-light">Uma curadoria de benefícios exclusivos para você.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: IconCalendar, text: "5 diárias + 1 diária bônus" },
                { icon: IconCoffee, text: "Café da manhã incluso" },
                { icon: IconStar, text: "Upgrade gratuito de categoria" },
                { icon: IconClock, text: "Datas totalmente flexíveis (inclusive feriados)" },
                { icon: IconUsers, text: "Pode usar múltiplos aptos na baixa temporada" },
                { icon: IconTransfer, text: "Transferência parcial de diárias" },
                { icon: IconShip, text: "1 passeio de barco incluso" },
                { icon: IconUsers, text: "Apartamento para até 4 pessoas" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-4 border border-solar-beige rounded-lg hover:border-solar-gold transition-colors duration-300">
                  <item.icon className="w-8 h-8 text-solar-gold flex-shrink-0" />
                  <span className="font-sans font-medium text-solar-deep text-lg">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Image */}
          <div className="lg:col-span-5 relative h-full min-h-[400px]">
            <img
              src="/familia-piscina.jpg"
              alt="Família aproveitando a piscina do Hotel Solar"
              className="w-full h-full object-cover rounded-sm shadow-xl border-4 border-solar-gold/20"
            />
            <div className="absolute bottom-8 -left-8 bg-solar-deep p-6 text-solar-gold max-w-xs shadow-2xl hidden md:block">
              <p className="font-serif italic text-xl">"Conforto é ter o tempo a seu favor."</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 3.5 COMPARISON TABLE */}
      <Section className="bg-solar-cream/50">
        <div className="text-center mb-12">
          <h3 className="font-serif text-3xl md:text-5xl text-solar-deep mb-4">
            Quem compara não perde essa oportunidade
          </h3>
          <p className="text-solar-amazon text-lg font-light">
            Veja a matemática da sua economia diária para 4 pessoas
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <img
            src="/economia-comparacao.jpg"
            alt="Economia Real - Solar Sem Limites: até 75% de economia comparado à diária comum"
            className="w-full h-auto rounded-xl shadow-2xl"
          />

          <div className="text-center mt-12 animate-float">
            <p className="font-serif text-xl md:text-2xl text-solar-amazon italic">
              "Viajar com conforto pagando preço de oportunidade."
            </p>
          </div>
        </div>
      </Section>

      {/* 3.5 RESUMO DA OFERTA (ANCORAGEM) */}
      <Section className="bg-gradient-to-b from-solar-gold/10 to-solar-beige">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="font-serif text-4xl text-solar-deep mb-4">Resumo da Oferta</h3>
            <div className="w-24 h-1 bg-solar-gold mx-auto"></div>
            <p className="text-solar-deep/70 mt-6 font-sans text-lg">
              Veja tudo que você leva com o pacote Solar Sem Limites
            </p>
          </div>

          <div className="bg-white p-12 md:p-16 border border-solar-gold/40 rounded-sm shadow-sm relative overflow-hidden">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-solar-gold/30"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-solar-gold/30"></div>

            <div className="relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  "6 diárias com validade de 1 ano (2 anos a partir de 2 pacotes)",
                  "Flexibilidade para usar em qualquer época (exceto réveillon)",
                  "Preço fixado sem aumento nos próximos anos",
                  "Prioridade em eventos da família Solar",
                  "Tripla Garantia (risco zero)",
                  "Suporte direto com time de reservas"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-solar-gold to-solar-gold/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <IconCheck className="w-5 h-5 text-white font-bold stroke-[3]" />
                      </div>
                    </div>
                    <p className="text-solar-deep/90 font-sans text-base md:text-lg leading-relaxed font-medium">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t border-solar-gold/20">
                <div className="text-center space-y-4">
                  <p className="text-solar-deep/60 text-sm font-sans uppercase tracking-wider mb-2">
                    Investimento Único
                  </p>

                  {/* Ancoragem de Preço Visual */}
                  <div className="flex flex-col items-center justify-center space-y-1 mb-6">
                    <p className="text-solar-deep/50 text-xl font-sans line-through decoration-red-500/70 decoration-2">
                      Preço de Balcão: R$ 6.000,00
                    </p>
                    <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Você economiza R$ 3.200,00 reais agora
                    </div>
                  </div>

                  <p className="text-solar-gold font-bold text-4xl md:text-5xl font-serif">
                    R$ 2.800,00
                  </p>
                  <p className="text-solar-deep/70 text-lg font-sans">
                    ou <span className="font-bold text-solar-deep">6x de R$ 513,33</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. PARA QUEM É / PARA QUEM NÃO É */}
      <Section className="bg-solar-cream">
        <div className="text-center mb-16">
          <h3 className="font-serif text-4xl text-solar-deep">Este Pacote é Para Você?</h3>
          <div className="w-24 h-1 bg-solar-gold mx-auto mt-4"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Foto à Esquerda */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="relative rounded-lg overflow-hidden border-4 border-solar-gold/40 shadow-2xl">
              <img
                src="/hotel-hidromassagem.jpg"
                alt="Casal relaxando na hidromassagem do Hotel Solar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <p className="text-white text-lg md:text-xl font-serif italic drop-shadow-lg">
                  "Momentos assim merecem ser vividos sem preocupação com preços"
                </p>
              </div>
            </div>
          </div>

          {/* Quadros à Direita */}
          <div className="space-y-8">
            {/* Para Quem É */}
            <div className="bg-white p-8 border border-solar-gold/40 rounded-sm shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-solar-beige rounded-full flex items-center justify-center mr-4 group-hover:bg-solar-gold transition-colors duration-300">
                  <IconHeart className="w-8 h-8 text-solar-deep" />
                </div>
                <h4 className="font-serif text-2xl text-solar-deep">Para Quem É</h4>
              </div>
              <ul className="space-y-4 flex-grow">
                <li className="flex items-start">
                  <span className="text-solar-gold mr-3 mt-1 text-lg">→</span>
                  <span className="text-solar-deep/70 leading-relaxed font-sans">Famílias que viajam todos os anos para Salinas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-solar-gold mr-3 mt-1 text-lg">→</span>
                  <span className="text-solar-deep/70 leading-relaxed font-sans">Casais que gostam de conforto e previsibilidade</span>
                </li>
                <li className="flex items-start">
                  <span className="text-solar-gold mr-3 mt-1 text-lg">→</span>
                  <span className="text-solar-deep/70 leading-relaxed font-sans">Pessoas que querem pagar menos usando inteligência financeira</span>
                </li>
                <li className="flex items-start">
                  <span className="text-solar-gold mr-3 mt-1 text-lg">→</span>
                  <span className="text-solar-deep/70 leading-relaxed font-sans">Quem deseja escolher datas com flexibilidade</span>
                </li>
                <li className="flex items-start">
                  <span className="text-solar-gold mr-3 mt-1 text-lg">→</span>
                  <span className="text-solar-deep/70 leading-relaxed font-sans">Quem já ama o Hotel Solar e quer garantir presença nos próximos anos</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-solar-gold/20">
                <p className="text-solar-deep/60 text-sm italic text-center font-sans">
                  Se você se identificou com pelo menos 2 itens acima, este pacote foi feito para você!
                </p>
              </div>
            </div>

            {/* Para Quem NÃO É */}
            <div className="bg-white p-8 border border-solar-gold/40 rounded-sm shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-solar-beige rounded-full flex items-center justify-center mr-4 group-hover:bg-solar-gold transition-colors duration-300">
                  <IconBan className="w-8 h-8 text-solar-deep" />
                </div>
                <h4 className="font-serif text-2xl text-solar-deep">Para Quem Não É</h4>
              </div>
              <ul className="space-y-4 flex-grow">
                <li className="flex items-start">
                  <span className="text-solar-deep/40 mr-3 mt-1 text-lg">×</span>
                  <span className="text-solar-deep/70 leading-relaxed font-sans">Pessoas que só viajam no Réveillon</span>
                </li>
                <li className="flex items-start">
                  <span className="text-solar-deep/40 mr-3 mt-1 text-lg">×</span>
                  <span className="text-solar-deep/70 leading-relaxed font-sans">Quem não consegue planejar minimamente suas viagens</span>
                </li>
                <li className="flex items-start">
                  <span className="text-solar-deep/40 mr-3 mt-1 text-lg">×</span>
                  <span className="text-solar-deep/70 leading-relaxed font-sans">Quem quer apenas uma diária avulsa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-solar-deep/40 mr-3 mt-1 text-lg">×</span>
                  <span className="text-solar-deep/70 leading-relaxed font-sans">Quem não gosta de viajar para praia</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-solar-gold/20">
                <p className="text-solar-deep/60 text-sm italic text-center font-sans">
                  Se este é o seu caso, talvez uma reserva tradicional seja mais adequada para você.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-solar-deep/70 font-sans text-lg leading-relaxed max-w-3xl mx-auto">
            Este pacote foi criado para quem valoriza <span className="text-solar-gold font-bold">economia inteligente</span> e <span className="text-solar-gold font-bold">experiências inesquecíveis</span>.
          </p>
        </div>
      </Section>

      {/* 5. PRICING OFFER */}
      <Section id="offer" className="bg-solar-amazon relative overflow-hidden py-24">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-solar-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-solar-deep/50 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          {/* Imagem dos Passeios */}
          <div className="relative rounded-sm shadow-2xl border-4 border-solar-gold/30 bg-solar-deep/20 flex items-center justify-center">
            <img
              src="/passeios-salinopolis.jpg"
              alt="Passeios de barco em Salinópolis"
              className="w-full h-auto object-contain rounded-sm"
            />
          </div>

          {/* Conteúdo de Preço */}
          <div className="text-center border border-solar-gold/30 bg-solar-deep/40 backdrop-blur-sm p-8 md:p-12 rounded-sm">
            <h3 className="font-serif text-3xl md:text-4xl text-white mb-4">
              PREÇO ESPECIAL DE LANÇAMENTO <br />
              <span className="text-solar-gold text-xl tracking-widest uppercase block mt-2 border-b border-solar-gold/50 inline-block pb-2">Por Tempo Limitado</span>
            </h3>

            {/* Contador Regressivo */}
            <div className="mb-8">
              <p className="text-solar-beige/80 text-sm mb-4">Vagas exclusivas reservadas por 48H para quem estava na lista.</p>
              <div className="flex justify-center gap-3 md:gap-6">
                <div className="bg-solar-gold/20 border border-solar-gold/40 rounded-lg p-3 md:p-4 min-w-[70px] md:min-w-[90px]">
                  <div className="text-3xl md:text-5xl font-serif text-solar-gold font-bold">{timeLeft.days}</div>
                  <div className="text-xs md:text-sm text-solar-beige/60 uppercase tracking-wider mt-1">Dias</div>
                </div>
                <div className="bg-solar-gold/20 border border-solar-gold/40 rounded-lg p-3 md:p-4 min-w-[70px] md:min-w-[90px]">
                  <div className="text-3xl md:text-5xl font-serif text-solar-gold font-bold">{timeLeft.hours}</div>
                  <div className="text-xs md:text-sm text-solar-beige/60 uppercase tracking-wider mt-1">Horas</div>
                </div>
                <div className="bg-solar-gold/20 border border-solar-gold/40 rounded-lg p-3 md:p-4 min-w-[70px] md:min-w-[90px]">
                  <div className="text-3xl md:text-5xl font-serif text-solar-gold font-bold">{timeLeft.minutes}</div>
                  <div className="text-xs md:text-sm text-solar-beige/60 uppercase tracking-wider mt-1">Min</div>
                </div>
                <div className="bg-solar-gold/20 border border-solar-gold/40 rounded-lg p-3 md:p-4 min-w-[70px] md:min-w-[90px]">
                  <div className="text-3xl md:text-5xl font-serif text-solar-gold font-bold animate-pulse">{timeLeft.seconds}</div>
                  <div className="text-xs md:text-sm text-solar-beige/60 uppercase tracking-wider mt-1">Seg</div>
                </div>
              </div>
            </div>

            {/* Destaque 5+1 */}
            <div className="bg-gradient-to-r from-solar-gold/30 to-solar-gold/20 border-2 border-solar-gold rounded-lg p-6 mb-8 max-w-md mx-auto">
              <p className="text-white font-bold text-2xl mb-2">5 Diárias + 1 Bônus</p>
              <p className="text-solar-gold text-xl font-semibold">= 6 Diárias Totais</p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
              <div className="text-center">
                <span className="block text-sm text-white/50 line-through mb-1">De R$ 6.000,00</span>
                <div className="text-5xl md:text-7xl font-serif text-solar-gold leading-none">R$ 2.800</div>
                <span className="text-white font-sans text-sm tracking-wide bg-solar-gold/20 px-3 py-1 rounded-full mt-2 inline-block">NO PIX À VISTA</span>
              </div>
              <div className="hidden md:block w-px h-24 bg-solar-gold/30"></div>
              <div className="text-center">
                <span className="block text-xl text-white font-light">ou</span>
                <span className="block text-3xl font-serif text-white">6x de R$ 513,33</span>
                <span className="block text-solar-beige/80 text-sm">no cartão de crédito</span>
              </div>
            </div>

            <Button onClick={goToCheckout} className="w-full md:w-auto text-xl px-16 py-5 shadow-2xl shadow-black/30 animate-heartbeat mt-6">
              QUERO MEU SOLAR SEM LIMITES
            </Button>
          </div>
        </div>
      </Section>

      {/* 5. COMO FUNCIONA PASSO A PASSO */}
      <Section className="bg-solar-deep text-solar-cream">
        <div className="text-center mb-16">
          <h3 className="font-serif text-4xl text-solar-gold">Como Funciona Passo a Passo</h3>
          <div className="w-24 h-1 bg-solar-gold mx-auto mt-4"></div>
          <p className="text-solar-cream/80 mt-6 max-w-2xl mx-auto font-sans">
            Simples, rápido e sem complicações. Veja como é fácil garantir suas férias no Hotel Solar.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto relative">
          {[
            {
              step: "1",
              icon: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
              title: "Garanta seu acesso",
              desc: "Receba o status de Membro Solar Sem Limites"
            },
            {
              step: "2",
              icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
              title: "Receba seu código",
              desc: "Imediatamente por e-mail"
            },
            {
              step: "3",
              icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
              title: "Escolha suas datas",
              desc: "Quando quiser, com flexibilidade total"
            },
            {
              step: "4",
              icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
              title: "Confirme sua reserva",
              desc: "Fale com nosso time de atendimento"
            },
            {
              step: "5",
              icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
              title: "Viva a experiência",
              desc: "Aproveite o Hotel Solar"
            },
            {
              step: "6",
              icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
              title: "Repita quando quiser",
              desc: "Use todas as diárias do seu pacote"
            }
          ].map((item, idx) => (
            <div key={idx} className="relative">
              {/* Seta conectora (apenas desktop e não no último item de cada linha) */}
              {idx < 5 && idx !== 2 && (
                <div className="hidden md:block absolute top-24 -right-6 lg:-right-8 z-0">
                  <svg className="w-12 h-12 lg:w-16 lg:h-16 text-solar-gold/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}

              <div className="bg-gradient-to-br from-white/10 to-white/5 p-8 border-2 border-solar-gold/30 rounded-lg hover:border-solar-gold hover:shadow-2xl hover:shadow-solar-gold/20 transition-all duration-300 flex flex-col items-center text-center group relative z-10">
                {/* Número do passo em destaque */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-solar-gold to-solar-gold/80 rounded-full flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform duration-300 border-4 border-solar-deep">
                    <span className="text-solar-deep text-xl font-bold font-serif">{item.step}</span>
                  </div>
                </div>

                {/* Ícone SVG */}
                <div className="mt-4 mb-6">
                  <svg className="w-16 h-16 text-solar-gold group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>

                {/* Título e descrição */}
                <h4 className="font-serif text-xl text-solar-gold mb-2 leading-tight">{item.title}</h4>
                <p className="text-solar-cream/70 text-sm font-sans">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-solar-gold font-bold text-lg font-sans">
            ✓ Processo 100% digital e sem burocracia
          </p>
        </div>
      </Section>

      {/* 5.5 CONHEÇA O HOTEL SOLAR */}
      <Section className="bg-gradient-to-b from-solar-beige to-solar-cream">
        <div className="text-center mb-12">
          <h3 className="font-serif text-4xl md:text-5xl text-solar-deep">Conheça o Hotel Solar</h3>
          <div className="w-24 h-1 bg-solar-gold mx-auto mt-4"></div>
          <p className="text-solar-deep/70 mt-6 max-w-2xl mx-auto font-sans text-lg">
            Estrutura completa para você e sua família aproveitarem cada momento
          </p>
        </div>

        {/* Foto Panorâmica do Restaurante sobre o Rio */}
        <div className="mb-16 max-w-7xl mx-auto">
          <div className="relative w-full overflow-hidden rounded-lg border-4 border-solar-gold/30 shadow-2xl">
            <img
              src="/hotel-panoramica-rio.jpg"
              alt="Vista panorâmica do restaurante sobre o rio em Salinópolis"
              className="w-full h-auto object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Grid de Fotos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
          {/* Foto 1 - Vista Aérea (destaque maior) */}
          <div className="col-span-2 md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-lg border-4 border-solar-gold/30 hover:border-solar-gold transition-all duration-500 h-64 md:h-auto">
            <img
              src="/hotel-vista-aerea.jpg"
              alt="Vista aérea do Hotel Solar com piscina e área de lazer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="font-serif text-2xl font-bold mb-2">Vista Aérea</h4>
              <p className="text-sm">Estrutura completa com piscina, área de lazer e energia solar</p>
            </div>
          </div>

          {/* Foto 2 - Café da Manhã */}
          <div className="relative group overflow-hidden rounded-lg border-4 border-solar-gold/30 hover:border-solar-gold transition-all duration-500 h-64 md:h-auto">
            <img
              src="/hotel-cafe-manha.jpg"
              alt="Café da manhã farto e delicioso"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="font-serif text-lg font-bold mb-1">Café da Manhã</h4>
              <p className="text-xs">Buffet completo e delicioso</p>
            </div>
          </div>

          {/* Foto 3 - Fachada */}
          <div className="relative group overflow-hidden rounded-lg border-4 border-solar-gold/30 hover:border-solar-gold transition-all duration-500 h-64 md:h-auto">
            <img
              src="/hotel-fachada.jpg"
              alt="Fachada do Hotel Solar"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="font-serif text-lg font-bold mb-1">Fachada</h4>
              <p className="text-xs">Arquitetura charmosa e acolhedora</p>
            </div>
          </div>

          {/* Foto 4 - Piscina */}
          <div className="relative group overflow-hidden rounded-lg border-4 border-solar-gold/30 hover:border-solar-gold transition-all duration-500 h-64 md:h-auto">
            <img
              src="/hotel-piscina.jpg"
              alt="Área da piscina"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="font-serif text-lg font-bold mb-1">Área de Lazer</h4>
              <p className="text-xs">Piscina e espaço para relaxar</p>
            </div>
          </div>

          {/* Foto 5 - Bicicletas */}
          <div className="relative group overflow-hidden rounded-lg border-4 border-solar-gold/30 hover:border-solar-gold transition-all duration-500 h-64 md:h-auto">
            <img
              src="/hotel-bicicletas.jpg"
              alt="Passeio de bicicleta na orla"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="font-serif text-lg font-bold mb-1">Lazer em Família</h4>
              <p className="text-xs">Bicicletas e passeios na orla</p>
            </div>
          </div>

          {/* Foto 6 - Capela */}
          <div className="relative group overflow-hidden rounded-lg border-4 border-solar-gold/30 hover:border-solar-gold transition-all duration-500 h-64 md:h-auto">
            <img
              src="/hotel-capela.jpg"
              alt="Capela do Hotel Solar"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="font-serif text-lg font-bold mb-1">Capela</h4>
              <p className="text-xs">Espaço para momentos especiais</p>
            </div>
          </div>

          {/* Foto 7 - Área de Jogos */}
          <div className="relative group overflow-hidden rounded-lg border-4 border-solar-gold/30 hover:border-solar-gold transition-all duration-500 h-64 md:h-auto">
            <img
              src="/hotel-area-jogos.jpg"
              alt="Área de jogos com pebolim, sinuca e ping-pong"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="font-serif text-lg font-bold mb-1">Área de Jogos</h4>
              <p className="text-xs">Pebolim, sinuca e ping-pong</p>
            </div>
          </div>

          {/* Foto 8 - Quadra de Esportes */}
          <div className="relative group overflow-hidden rounded-lg border-4 border-solar-gold/30 hover:border-solar-gold transition-all duration-500 h-64 md:h-auto">
            <img
              src="/hotel-quadra-esportes.jpg"
              alt="Quadra de vôlei e esportes"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="font-serif text-lg font-bold mb-1">Quadra de Esportes</h4>
              <p className="text-xs">Vôlei e atividades ao ar livre</p>
            </div>
          </div>

          {/* Foto 9 - Playground */}
          <div className="relative group overflow-hidden rounded-lg border-4 border-solar-gold/30 hover:border-solar-gold transition-all duration-500 h-64 md:h-auto">
            <img
              src="/hotel-playground-criancas.jpg"
              alt="Crianças brincando no playground"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h4 className="font-serif text-lg font-bold mb-1">Playground</h4>
              <p className="text-xs">Diversão garantida para as crianças</p>
            </div>
          </div>
        </div>

        {/* CTA após fotos */}
        <div className="text-center mt-16">
          <p className="text-solar-deep/80 font-sans text-lg mb-6">
            🌴 Tudo isso te esperando em Salinópolis, o paraíso paraense
          </p>
          <Button onClick={goToCheckout} className="text-lg px-12 py-4 shadow-xl">
            QUERO CONHECER O HOTEL SOLAR
          </Button>
        </div>
      </Section>

      {/* 6. GUARANTEES */}
      <Section className="bg-solar-cream">
        <div className="text-center mb-12">
          <h3 className="font-serif text-4xl md:text-5xl text-solar-deep">Tripla Garantia de Risco Zero</h3>
          <div className="w-24 h-1 bg-solar-gold mx-auto mt-4"></div>
          <p className="text-solar-deep/70 mt-6 max-w-2xl mx-auto font-sans text-lg">
            Sua compra está 100% protegida. Você não corre nenhum risco.
          </p>
        </div>

        {/* Destaque Risco Zero */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-solar-gold/20 via-solar-gold/10 to-solar-gold/20 border-2 border-solar-gold rounded-lg p-6 md:p-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-solar-gold rounded-full flex items-center justify-center shadow-lg">
                <IconShield className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h4 className="font-serif text-2xl md:text-3xl text-solar-deep font-bold">RISCO ZERO</h4>
                <p className="text-solar-deep/70 text-sm md:text-base">Seu investimento está completamente protegido</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Garantia Incondicional",
              days: "30 Dias",
              desc: "Cancelou dentro de 30 dias após a compra? Devolvemos 100% do seu valor sem perguntas e sem burocracia.",
              icon: "shield"
            },
            {
              title: "Garantia Pós-Primeira Diária",
              days: "Satisfação",
              desc: "Usou a primeira diária e sentiu que não era para você? Reembolsamos o valor restante proporcionalmente.",
              icon: "check"
            },
            {
              title: "Garantia de Crédito",
              days: "Vitalício",
              desc: "Não conseguiu usar tudo no prazo estipulado? O valor pago vira crédito integral para abater em diárias futuras.",
              icon: "star"
            }
          ].map((card, idx) => (
            <div key={idx} className="bg-white p-6 md:p-8 border-2 border-solar-gold/30 rounded-lg shadow-md hover:shadow-2xl hover:border-solar-gold transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-solar-gold to-solar-gold/70 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                {card.icon === 'shield' && <IconShield className="w-12 h-12 md:w-14 md:h-14 text-white" />}
                {card.icon === 'check' && <IconCheck className="w-12 h-12 md:w-14 md:h-14 text-white" />}
                {card.icon === 'star' && <IconStar className="w-12 h-12 md:w-14 md:h-14 text-white" />}
              </div>
              <span className="text-xs md:text-sm font-bold tracking-widest text-solar-gold uppercase mb-3 bg-solar-gold/10 px-4 py-1 rounded-full">{card.days}</span>
              <h4 className="font-serif text-xl md:text-2xl text-solar-deep mb-4 font-bold">{card.title}</h4>
              <p className="text-solar-deep/70 leading-relaxed font-sans text-sm md:text-base">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA após Tripla Garantia */}
        <div className="text-center mt-16">
          <Button onClick={goToCheckout} className="px-10 py-4 text-base shadow-lg">
            Quero solicitar meu convite VIP agora
          </Button>
        </div>
      </Section>

      {/* 6. SOCIAL PROOF */}
      <Section className="bg-solar-deep text-solar-cream">
        <div className="text-center mb-12">
          <h3 className="font-serif text-3xl md:text-4xl text-solar-gold">Quem já viveu a experiência</h3>
        </div>

        {/* Layout de duas colunas: Foto + Depoimentos */}
        <div className="grid lg:grid-cols-2 gap-8 items-start mb-16">
          {/* Foto de Cliente */}
          <div className="relative">
            <img
              src="/experiencia-cliente.jpg"
              alt="Cliente aproveitando o Hotel Solar"
              className="w-full h-auto rounded-sm shadow-2xl border-4 border-solar-gold/30 sticky top-8"
            />
          </div>

          {/* Testimonial Cards */}
          <div className="space-y-6">
            {[
              { quote: "Economizei mais de R$ 1.200 na alta temporada. O atendimento foi impecável do check-in ao check-out.", author: "Ana Paula", location: "Belém, PA" },
              { quote: "Usei no feriado de julho sem pagar nada a mais. Foi a melhor decisão para nossas férias em família.", author: "Lucas & Camila", location: "Castanhal, PA" },
              { quote: "Ainda ganhamos o passeio de barco. Valeu demais! A estrutura do hotel é fantástica.", author: "Família Souza", location: "Macapá, AP" },
              { quote: "Sempre que o Solar lança esse pacote de diárias antecipadas eu compro. O melhor investimento que fiz para lazer da família!", author: "Roberto Silva", location: "Santarém, PA" },
            ].map((testi, idx) => (
              <div key={idx} className="bg-white/5 p-6 md:p-8 rounded border border-solar-gold/20 relative hover:bg-white/10 transition-colors duration-300">
                <span className="absolute top-4 left-6 text-6xl font-serif text-solar-gold/20">"</span>
                <p className="font-sans text-base md:text-lg italic mb-6 relative z-10">{testi.quote}</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-solar-gold rounded-full flex items-center justify-center text-solar-deep font-bold font-serif">
                    {testi.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-solar-gold">{testi.author}</p>
                    <p className="text-xs text-solar-beige/60">{testi.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA após Depoimentos */}
        <div className="text-center mt-12 mb-16">
          <Button onClick={goToCheckout} className="px-10 py-4 text-base shadow-lg">
            Quero solicitar meu convite VIP agora
          </Button>
        </div>

        {/* Video Testimonials */}
        <div className="relative">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-solar-gold/20 z-0"></div>
          <h4 className="relative z-10 inline-block bg-solar-deep px-6 font-serif text-2xl text-solar-gold mb-8">
            Histórias Reais em Vídeo
          </h4>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Video 1 - YouTube Embed */}
          <div className="relative group rounded-sm overflow-hidden border border-solar-gold/30 shadow-2xl bg-black aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/WutD_39reDc"
              title="Depoimento Hotel Solar"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pointer-events-none">
              <div className="flex items-center space-x-2">
                <p className="text-white font-serif text-sm drop-shadow-md font-bold">Fafá de Belém</p>
              </div>
            </div>
          </div>

          {/* Video 2 - Gretchen e Esdras */}
          <div className="relative group rounded-sm overflow-hidden border border-solar-gold/30 shadow-2xl bg-black aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/6tAWZwan-Fw"
              title="Depoimento Gretchen e Esdras"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pointer-events-none">
              <div className="flex items-center space-x-2">
                <p className="text-white font-serif text-sm drop-shadow-md font-bold">Gretchen e Esdras</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA após Histórias Reais */}
        <div className="text-center mt-16">
          <Button onClick={goToCheckout} className="px-10 py-4 text-base shadow-lg">
            Quero solicitar meu convite VIP agora
          </Button>
        </div>

      </Section>

      {/* 7. GALLERY */}
      <Section className="bg-white">
        {/* Adjusted layout strategy: Remove fixed height on container, apply fixed height to columns on desktop to force proper flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto">
          <div className="md:col-span-2 relative h-72 md:h-[500px] group overflow-hidden rounded-sm">
            <img
              src="/hotel-noturno.jpg"
              alt="Hotel Solar iluminado à noite"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
              <span className="text-white font-serif text-2xl">Hotel Solar à noite</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-6 h-48 md:h-[500px]">
            <div className="relative group overflow-hidden h-full rounded-sm">
              <img
                src="/galeria-aerea.jpg"
                alt="Vista aérea de Salinópolis"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </div>
            <div className="relative group overflow-hidden h-full rounded-sm">
              <img
                src="/quarto-hotel-solar.jpg"
                alt="Quarto confortável do Hotel Solar"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
        <div className="text-center mt-20 md:mt-16 mb-4">
          <p className="font-serif text-3xl md:text-4xl text-solar-deep leading-relaxed px-4">
            “Imagine viver tudo isso pagando <span className="text-solar-amazon font-bold decoration-solar-gold underline decoration-2 underline-offset-4">menos</span> e com datas flexíveis.”
          </p>
        </div>

        {/* CTA após Galeria */}
        <div className="text-center mt-16">
          <Button onClick={goToCheckout} className="px-10 py-4 text-base shadow-lg">
            Quero solicitar meu convite VIP agora
          </Button>
        </div>
      </Section>

      {/* 8. FAQ */}
      <Section className="bg-solar-beige bg-fiber-texture">
        <h3 className="font-serif text-4xl text-center text-solar-deep mb-12">Perguntas Frequentes</h3>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Imagem de Salinópolis */}
          <div className="relative">
            <img
              src="/faq-salinas-colagem.jpg"
              alt="Belezas de Salinópolis - Praia, Barracas e Restaurante"
              className="w-full h-auto rounded-sm shadow-2xl border-4 border-solar-gold/30 sticky top-8"
            />
          </div>

          {/* Perguntas e Respostas */}
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div key={index} className="bg-white border border-solar-gold/30 rounded-sm overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none bg-white hover:bg-solar-cream transition-colors"
                >
                  <span className="font-serif text-lg font-bold text-solar-deep">{item.question}</span>
                  {openFaq === index ? <IconChevronUp className="text-solar-gold" /> : <IconChevronDown className="text-solar-gold" />}
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="p-6 pt-0 text-solar-deep/80 leading-relaxed bg-white border-t border-dashed border-solar-beige">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA após FAQ */}
        <div className="text-center mt-16">
          <Button onClick={goToCheckout} className="px-10 py-4 text-base shadow-lg">
            Quero solicitar meu convite VIP agora
          </Button>
        </div>
      </Section>

      {/* 9. URGENCY & CTA */}
      <Section className="bg-solar-deep text-center py-24 border-t border-solar-gold">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="font-serif text-4xl md:text-5xl text-white">
            Não deixe essa oportunidade escapar
          </h2>

          <div className="grid gap-4 text-solar-beige/80 text-lg">
            <div className="flex items-center justify-center space-x-2">
              <IconCheck className="w-5 h-5 text-solar-gold" />
              <span>Preço pode subir a qualquer momento</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <IconCheck className="w-5 h-5 text-solar-gold" />
              <span>Garantias válidas apenas enquanto o lote estiver ativo</span>
            </div>
          </div>

          <div className="pt-8">
            <Button onClick={goToCheckout} className="w-full md:w-auto text-xl px-16 py-6 font-bold shadow-2xl shadow-solar-gold/20 animate-heartbeat">
              GARANTIR MEU ACESSO VIP AGORA
            </Button>
            <p className="text-xs text-solar-beige/40 mt-4 tracking-widest uppercase">Oferta exclusiva e limitada. Garantias ativas por tempo reduzido.</p>
          </div>
        </div>
      </Section>

      {/* Urgência Final com Contador */}
      <Section className="bg-gradient-to-b from-solar-deep to-[#051F17] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-serif text-3xl md:text-5xl text-solar-gold mb-4">
            ⚡ Últimas Horas da Oferta!
          </h3>
          <p className="text-solar-beige/80 text-lg mb-8">
            Não perca essa oportunidade única. A oferta encerra em:
          </p>

          {/* Contador Regressivo Grande */}
          <div className="bg-solar-deep/60 border-2 border-solar-gold/40 rounded-lg p-8 mb-8">
            <p className="text-solar-gold text-sm md:text-base mb-6 tracking-widest uppercase">Oferta válida por apenas 48 horas (ou até encerrarem as vagas limpas)</p>
            <div className="flex justify-center gap-4 md:gap-8">
              <div className="bg-gradient-to-b from-solar-gold/30 to-solar-gold/10 border-2 border-solar-gold rounded-xl p-4 md:p-6 min-w-[80px] md:min-w-[120px] shadow-lg">
                <div className="text-4xl md:text-6xl font-serif text-solar-gold font-bold">{timeLeft.days}</div>
                <div className="text-xs md:text-base text-white uppercase tracking-widest mt-2">Dias</div>
              </div>
              <div className="bg-gradient-to-b from-solar-gold/30 to-solar-gold/10 border-2 border-solar-gold rounded-xl p-4 md:p-6 min-w-[80px] md:min-w-[120px] shadow-lg">
                <div className="text-4xl md:text-6xl font-serif text-solar-gold font-bold">{timeLeft.hours}</div>
                <div className="text-xs md:text-base text-white uppercase tracking-widest mt-2">Horas</div>
              </div>
              <div className="bg-gradient-to-b from-solar-gold/30 to-solar-gold/10 border-2 border-solar-gold rounded-xl p-4 md:p-6 min-w-[80px] md:min-w-[120px] shadow-lg">
                <div className="text-4xl md:text-6xl font-serif text-solar-gold font-bold">{timeLeft.minutes}</div>
                <div className="text-xs md:text-base text-white uppercase tracking-widest mt-2">Min</div>
              </div>
              <div className="bg-gradient-to-b from-solar-gold/30 to-solar-gold/10 border-2 border-solar-gold rounded-xl p-4 md:p-6 min-w-[80px] md:min-w-[120px] shadow-lg animate-pulse">
                <div className="text-4xl md:text-6xl font-serif text-solar-gold font-bold">{timeLeft.seconds}</div>
                <div className="text-xs md:text-base text-white uppercase tracking-widest mt-2">Seg</div>
              </div>
            </div>
          </div>

          <Button onClick={goToCheckout} className="text-xl px-12 py-5 shadow-2xl shadow-black/50 animate-heartbeat">
            GARANTIR MINHA VAGA AGORA
          </Button>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="bg-[#051F17] text-solar-beige/60 py-12 px-6 border-t border-solar-deep">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
          <div>
            <h4 className="font-serif text-2xl text-solar-gold mb-2">Hotel Solar</h4>
            <p className="text-sm uppercase tracking-wider">J Ramos Barros Hotelaria e Eventos ME</p>
          </div>
          <div className="space-y-2 text-sm">
            <p>Av. Atlântica • CEP 68721-000 • Salinópolis – PA</p>
            <p>Tel: (91) 98100-0800</p>
            <p>E-mail: reserva@hotelsolar.tur.br</p>
          </div>
          <div className="text-xs text-solar-deep/40">
            &copy; {new Date().getFullYear()} Hotel Solar. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5591981229825?text=Dúvidas%20pacote%20Solar%20sem%20Limites"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-[#25D366] rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 group hover:shadow-[0_0_20px_rgba(37,211,102,0.6)]"
        aria-label="Falar no WhatsApp"
      >
        {/* Message Bubble - visible on desktop, hidden on mobile */}
        <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-100 hidden md:block group-hover:block transition-all duration-300">
          <p className="text-solar-deep font-bold text-sm">Está com dúvidas? Chame aqui</p>
          <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white transform -translate-y-1/2 rotate-45 border-r border-t border-gray-100"></div>
        </div>
        <IconWhatsApp className="w-8 h-8 text-white" />
      </a>

      {/* Floating CTA Button (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 md:hidden animate-slide-up flex justify-center items-center">
        <Button onClick={goToCheckout} className="w-full text-base py-4 shadow-xl animate-pulse-slow">
          GARANTIR MINHA VAGA AGORA
        </Button>
      </div>
    </div>
  );
};

export default App;