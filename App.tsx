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

  // Countdown timer
  useEffect(() => {
    const targetDate = new Date('2025-12-23T23:59:59').getTime();
    
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
    <div className="font-sans antialiased text-solar-deep selection:bg-solar-gold selection:text-solar-deep relative">
      
      {/* 1. HERO SECTION */}
      <header className="relative min-h-screen flex items-center justify-center bg-solar-deep overflow-hidden">
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
            Hospede-se quando quiser, pagando <span className="text-white font-semibold italic">MUITO menos</span>, com garantia total e datas flexíveis — inclusive feriados.
          </h2>
          <p className="text-base md:text-lg text-solar-cream/70 tracking-widest uppercase border-t border-b border-solar-gold/30 py-4 inline-block">
            A forma mais inteligente e segura de viajar para Salinópolis o ano inteiro
          </p>
          <div className="pt-8">
            <Button onClick={goToCheckout} className="text-lg md:text-xl px-12 md:px-16 py-5 md:py-6 shadow-2xl shadow-solar-gold/20 animate-heartbeat">
              Quero garantir minhas diárias com desconto agora
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
            <div className="flex items-center justify-center w-full p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
               <img src="/google-reviews-logo.png" alt="Google Reviews" className="w-64 h-auto object-contain" />
            </div>

            {/* Booking */}
            <div className="flex items-center justify-center w-full p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
               <div className="bg-white p-4 rounded-lg">
                 <img src="/booking-logo.png" alt="Booking.com" className="w-64 h-auto object-contain" />
               </div>
            </div>

            {/* TripAdvisor */}
            <div className="flex items-center justify-center w-full p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
               <img src="/tripadvisor-logo.png" alt="TripAdvisor Certificado de Excelência 2019" className="w-64 h-auto object-contain" />
            </div>

          </div>
        </div>
      </div>

      {/* 2. STORYTELLING */}
      <Section className="bg-solar-beige bg-fiber-texture">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="font-serif text-4xl text-solar-deep mb-6 relative inline-block">
              A Origem do <span className="text-solar-amazon italic">Privilégio</span>
              <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-solar-gold"></span>
            </h3>
            <div className="font-sans text-lg text-solar-deep/80 space-y-6 leading-relaxed text-justify">
              <p>
                <span className="text-4xl float-left mr-2 font-serif text-solar-gold leading-none">D</span>epois de 52 anos recebendo milhares de famílias em Salinópolis, percebemos que muita gente queria viajar com flexibilidade, sem depender de datas fixas, preços altos e disponibilidade limitada.
              </p>
              <p>
                Nossos hóspedes mais exigentes buscavam mais do que uma hospedagem; buscavam liberdade. Liberdade para decidir viajar na última hora, liberdade para aproveitar um feriado sem pagar o dobro por isso.
              </p>
              <p className="font-semibold text-solar-amazon">
                Por isso criamos o Solar Sem Limites — para quem quer liberdade, economia real e a experiência completa do Hotel Solar.
              </p>
            </div>
          </div>
          <div className="relative h-96 md:h-[500px] w-full group">
             <div className="absolute inset-0 border-2 border-solar-gold transform translate-x-4 translate-y-4 transition-transform duration-500 group-hover:translate-x-6 group-hover:translate-y-6"></div>
             <img 
               src="https://picsum.photos/800/1000?image=433" 
               alt="História do Hotel" 
               className="w-full h-full object-cover shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
             />
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

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 items-end">
            
            {/* Card 1: Alta Temporada */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-300">
              <div className="bg-[#1e3a8a] py-4 text-center">
                <h4 className="text-white font-bold tracking-wider text-sm uppercase">Alta Temporada</h4>
                <p className="text-blue-200 text-xs">(Julho/Feriados)</p>
              </div>
              <div className="p-8 text-center space-y-4">
                <p className="text-gray-500 text-sm">Valor da diária</p>
                <div className="text-4xl font-serif text-gray-700">R$ 1.833</div>
                <div className="w-full h-px bg-gray-100 my-4"></div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Por dia até 4 pessoas</p>
              </div>
            </div>

            {/* Card 2: Baixa Temporada */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-300">
              <div className="bg-[#0d9488] py-4 text-center">
                <h4 className="text-white font-bold tracking-wider text-sm uppercase">Baixa Temporada</h4>
                <p className="text-teal-100 text-xs">(Dias comuns)</p>
              </div>
              <div className="p-8 text-center space-y-4">
                <p className="text-gray-500 text-sm">Valor da diária</p>
                <div className="text-4xl font-serif text-gray-700">R$ 809</div>
                <div className="w-full h-px bg-gray-100 my-4"></div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Por dia até 4 pessoas</p>
              </div>
            </div>

            {/* Card 3: Solar Sem Limites (Winner) */}
            <div className="bg-white rounded-lg shadow-2xl border-2 border-solar-gold overflow-hidden transform md:-translate-y-4 relative z-10 group">
              {/* Badge */}
              <div className="absolute top-0 right-0 bg-green-500 text-white font-bold text-xs px-3 py-1 rounded-bl-lg z-20 shadow-sm">
                MELHOR ESCOLHA
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-solar-gold/10"></div>
                <h4 className="text-white font-bold tracking-wider text-lg uppercase relative z-10 drop-shadow-md">Solar Sem Limites</h4>
              </div>
              
              <div className="p-8 text-center space-y-2 bg-gradient-to-b from-green-50 to-white relative">
                <p className="text-solar-amazon font-semibold text-sm">Valor da diária no pacote</p>
                <div className="text-6xl font-serif text-solar-deep font-bold tracking-tight">R$ 467</div>
                
                {/* Discount Tag */}
                <div className="inline-flex items-center justify-center bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold mt-2 border border-green-200">
                   ECONOMIA DE 75%
                </div>

                <div className="w-full h-px bg-solar-gold/20 my-6"></div>
                
                {/* Destaque 5+1 */}
                <div className="bg-gradient-to-r from-solar-gold/20 to-solar-gold/10 border-2 border-solar-gold/40 rounded-lg p-4 mb-4">
                  <p className="text-solar-deep font-bold text-lg mb-1">5 Diárias + 1 Bônus</p>
                  <p className="text-solar-amazon text-sm font-semibold">= 6 Diárias Totais</p>
                </div>
                
                <p className="text-xs text-solar-amazon/60 uppercase tracking-wide font-bold">Por dia até 4 pessoas</p>
                <p className="text-xs text-solar-amazon/60 italic mt-1">Válido para qualquer data*</p>
              </div>
              
              <div className="bg-solar-deep text-solar-gold text-center py-2 text-xs font-bold tracking-widest uppercase">
                Garantia de Menor Preço
              </div>
            </div>

          </div>

          <div className="text-center mt-12 animate-float">
              <p className="font-serif text-xl md:text-2xl text-solar-amazon italic">
                "Viajar com conforto pagando preço de oportunidade."
              </p>
          </div>
        </div>
      </Section>

      {/* 3.5 RESUMO DA OFERTA */}
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
                  "6 diárias com validade de 1 ano",
                  "Flexibilidade para usar em qualquer época (exceto réveillon)",
                  "Preço fixado sem aumento nos próximos anos",
                  "Prioridade em eventos da família Solar",
                  "Tripla Garantia (risco zero)",
                  "Suporte direto com time de reservas"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 bg-solar-beige rounded-full flex items-center justify-center group-hover:bg-solar-gold transition-colors duration-300">
                        <IconCheck className="w-4 h-4 text-solar-deep" />
                      </div>
                    </div>
                    <p className="text-solar-deep/80 font-sans text-base leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t border-solar-gold/20">
                <div className="text-center space-y-4">
                  <p className="text-solar-deep/60 text-sm font-sans uppercase tracking-wider">
                    Investimento
                  </p>
                  <p className="text-solar-gold font-bold text-3xl md:text-4xl font-serif">
                    R$ 2.800,00
                  </p>
                  <p className="text-solar-deep/70 text-lg font-sans">
                    ou <span className="font-bold text-solar-deep">6x de R$ 513,33</span>
                  </p>
                  <p className="text-solar-amazon text-sm font-sans italic mt-6">
                    Economia de mais de 50% comparado à tarifa tradicional
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

        <div className="grid md:grid-cols-2 gap-8">
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
            PREÇO ESPECIAL DE LANÇAMENTO <br/>
            <span className="text-solar-gold text-xl tracking-widest uppercase block mt-2 border-b border-solar-gold/50 inline-block pb-2">Por Tempo Limitado</span>
          </h3>
          
          {/* Contador Regressivo */}
          <div className="mb-8">
            <p className="text-solar-beige/80 text-sm mb-4">Oferta válida até 23/12/2025 às 23h59</p>
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
               <span className="block text-solar-beige/60 text-lg line-through mb-1">De R$ 4.200,00</span>
               <div className="text-5xl md:text-7xl font-serif text-solar-gold">R$ 2.800</div>
               <span className="text-white font-sans text-sm tracking-wide bg-solar-gold/20 px-3 py-1 rounded-full mt-2 inline-block">NO PIX À VISTA</span>
            </div>
            <div className="hidden md:block w-px h-24 bg-solar-gold/30"></div>
            <div className="text-center">
              <span className="block text-xl text-white font-light">ou</span>
              <span className="block text-3xl font-serif text-white">6x de R$ 513,33</span>
              <span className="block text-solar-beige/80 text-sm">no cartão de crédito</span>
            </div>
          </div>

          <p className="text-solar-cream/80 italic mb-10">Somente enquanto durar o lote atual.</p>

          <Button onClick={goToCheckout} className="w-full md:w-auto text-xl px-16 py-5 shadow-2xl shadow-black/30 animate-heartbeat">
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

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              step: "1",
              title: "Compre seu pacote Solar Sem Limites"
            },
            {
              step: "2",
              title: "Receba imediatamente seu código de uso por e-mail"
            },
            {
              step: "3",
              title: "Escolha suas datas quando quiser"
            },
            {
              step: "4",
              title: "Fale com nosso time de reservas e confirme sua hospedagem"
            },
            {
              step: "5",
              title: "Viva sua experiência no Hotel Solar"
            },
            {
              step: "6",
              title: "Repita quantas vezes quiser dentro do seu pacote"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/5 p-8 border border-solar-gold/20 rounded-sm hover:bg-white/10 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-solar-gold rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-solar-deep text-2xl font-bold font-serif">{item.step}</span>
              </div>
              <h4 className="font-serif text-lg text-solar-gold leading-relaxed">{item.title}</h4>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-solar-gold font-bold text-lg font-sans">
            ✓ Processo 100% digital e sem burocracia
          </p>
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
            Quero garantir minhas diárias com desconto agora
          </Button>
        </div>
      </Section>

      {/* 6. SOCIAL PROOF */}
      <Section className="bg-solar-deep text-solar-cream">
        <div className="text-center mb-12">
           <h3 className="font-serif text-3xl md:text-4xl text-solar-gold">Quem já viveu a experiência</h3>
        </div>
        
        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { quote: "Economizei mais de R$ 1.200 na alta temporada. O atendimento foi impecável do check-in ao check-out.", author: "Ana Paula", location: "Belém, PA" },
            { quote: "Usei no feriado de julho sem pagar nada a mais. Foi a melhor decisão para nossas férias em família.", author: "Lucas & Camila", location: "Castanhal, PA" },
            { quote: "Ainda ganhamos o passeio de barco. Valeu demais! A estrutura do hotel é fantástica.", author: "Família Souza", location: "Macapá, AP" },
          ].map((testi, idx) => (
            <div key={idx} className="bg-white/5 p-8 rounded border border-solar-gold/20 relative">
              <span className="absolute top-4 left-6 text-6xl font-serif text-solar-gold/20">"</span>
              <p className="font-sans text-lg italic mb-6 relative z-10">{testi.quote}</p>
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
        
        {/* CTA após Depoimentos */}
        <div className="text-center mt-12 mb-16">
          <Button onClick={goToCheckout} className="px-10 py-4 text-base shadow-lg">
            Quero garantir minhas diárias com desconto agora
          </Button>
        </div>

        {/* Galeria de Fotos */}
        <div className="relative mb-16">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-solar-gold/20 z-0"></div>
          <h4 className="relative z-10 inline-block bg-solar-deep px-6 font-serif text-2xl text-solar-gold mb-8">
            Momentos Inesquecíveis
          </h4>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          <div className="relative group overflow-hidden rounded-sm shadow-2xl border-4 border-solar-gold/30">
            <img 
              src="/experiencia-1.jpg" 
              alt="Pier e restaurante sobre o mar" 
              className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="relative group overflow-hidden rounded-sm shadow-2xl border-4 border-solar-gold/30">
            <img 
              src="/experiencia-2.jpg" 
              alt="Praia de Salinópolis" 
              className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="relative group overflow-hidden rounded-sm shadow-2xl border-4 border-solar-gold/30">
            <img 
              src="/experiencia-3.jpg" 
              alt="Restaurante palafita" 
              className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
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
            Quero garantir minhas diárias com desconto agora
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
                src="/bicicletas-salinopolis.jpg" 
                alt="Passeio de bicicleta em Salinópolis" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            </div>
            <div className="relative group overflow-hidden h-full rounded-sm">
               <img 
                src="/quarto-hotel.jpg" 
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
            Quero garantir minhas diárias com desconto agora
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
              src="/faq-salinopolis.jpg" 
              alt="Belezas de Salinópolis" 
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
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
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
            Quero garantir minhas diárias com desconto agora
          </Button>
        </div>
      </Section>

      {/* 9. URGENCY & CTA */}
      <Section className="bg-solar-deep text-center py-24 border-t border-solar-gold">
        <div className="max-w-2xl mx-auto space-y-8">
           <div className="inline-flex items-center space-x-2 bg-red-900/30 border border-red-500/30 px-4 py-2 rounded text-red-100 mb-4 animate-pulse">
             <span className="w-2 h-2 bg-red-500 rounded-full"></span>
             <span className="text-sm font-bold tracking-wider uppercase">Últimas unidades do lote atual</span>
           </div>
           
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
                GARANTIR MEU PACOTE COM DESCONTO
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
            <p className="text-solar-gold text-sm md:text-base mb-6 tracking-widest uppercase">Oferta válida até 23/12/2025 às 23h59</p>
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
        <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-100 hidden md:block">
          <p className="text-solar-deep font-bold text-sm">Está com dúvidas? Chame aqui</p>
          <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white transform -translate-y-1/2 rotate-45 border-r border-t border-gray-100"></div>
        </div>
        <IconWhatsApp className="w-8 h-8 text-white" />
      </a>
    </div>
  );
};

export default App;