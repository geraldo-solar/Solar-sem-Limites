import React from 'react';
import { ShieldCheck, Anchor, Coffee, Star, CreditCard, Clock, CheckCircle } from 'lucide-react';

export default function JulhoLP() {
  // @ts-ignore
  const base = import.meta.env.BASE_URL;

  const handleCheckoutClick = () => {
    window.location.hash = '#/checkout';
    window.scrollTo(0, 0);
  };

  // Vagas restantes do lote atual.
  // Altere apenas este número para ajustar o contador do topo da página.
  const VAGAS_RESTANTES = 5;

  const remainingPackages = VAGAS_RESTANTES;
  const percentageSold = ((50 - remainingPackages) / 50) * 100;


  return (
    <div className="min-h-screen bg-[#06140b] text-white font-sans selection:bg-yellow-600/30">
      
      {/* V.I.P. ETIQUETA E ESCASSEZ DINÂMICA */}
      <div className="bg-[#D4AF37] text-black text-center py-2 px-4 shadow-md relative overflow-hidden flex flex-col items-center justify-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 text-xs md:text-sm font-bold tracking-widest uppercase z-10 w-full mb-1">
          <span>CONVITE EXCLUSIVO PARA VOCÊ</span>
          <span className="hidden md:inline font-black text-black/50">•</span>
          <span className="text-[#8B7322] bg-[#f4df8d]/30 px-2 py-0.5 rounded shadow-sm border border-[#D4AF37]/20">
            ACESSO AO CÍRCULO SOLAR
          </span>
        </div>
        
        {/* Barra de Consumo de Estoque */}
        <div className="w-full max-w-sm z-10 flex flex-col items-center mt-1">
            <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden border border-black/10 relative">
              <div 
                className="bg-[#D4AF37] h-full transition-all duration-1000 ease-out relative"
                style={{ width: `${percentageSold}%` }}
              >
                <div className="absolute top-0 right-0 w-4 h-full bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <div className="text-[10px] md:text-xs font-bold text-black/80 w-full flex justify-between mt-1 tracking-wider uppercase">
              <span>{50 - remainingPackages} Concedidos</span>
              <span className="text-[#645012] drop-shadow-sm font-black flex items-center gap-1">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                {remainingPackages} Restantes
              </span>
            </div>
        </div>
      </div>

      {/* SESSÃO 1: THE HOOK (HERO) */}
      <section className="relative pt-20 md:pt-32 pb-32 px-6 overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img src={`${base}hero_hotel_real.jpg`} alt="Hotel Solar Panorâmica" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06140b]/60 via-[#06140b]/80 to-[#06140b]"></div>
        </div>
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* Logo do Hotel Solar */}
          <img 
            src={`${base}logoSOLAR2.png`} 
            alt="Hotel Solar Logo" 
            className="w-36 md:w-44 mx-auto opacity-90 mb-10 drop-shadow-lg" 
          />
          
          <span className="inline-flex items-center gap-2 px-4 py-2 border border-[#D4AF37]/30 rounded-full text-[#D4AF37] text-sm tracking-widest uppercase mb-8">
            <Star className="w-4 h-4 fill-current" />
            Benefício Confidencial
          </span>
          
          <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
            Sua experiência em Salinópolis <br className="hidden md:block" />
            <span className="italic text-[#D4AF37]">tem sido incrível, certo?</span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Pessoas inteligentes não vivem reféns das oscilações astronômicas da alta temporada para vivenciar o que amam. 
            E se você pudesse cristalizar essa magia e garantir seus próximos retornos com a prioridade e as condições de quem já é de casa?
          </p>
          
          <button 
            onClick={handleCheckoutClick}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-[#D4AF37] to-[#AA8B24] text-black font-bold uppercase tracking-wider rounded-lg overflow-hidden transition-transform hover:scale-105"
          >
            <span className="relative z-10">Desbloquear Meu Convite Exclusivo</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          </button>
          <p className="mt-6 text-sm text-neutral-500">*Acesso restrito: convite pessoal e intransferível, válido enquanto houver vagas no lote.</p>
          <p className="mt-2 text-[10px] text-[#bda036] font-normal tracking-widest uppercase inline-block">* Convites abertos restritos a 2 acessos semestrais por família física.</p>
        </div>
      </section>

      {/* SESSÃO 2: A MATEMÁTICA INVERTIDA */}
      <section className="py-24 px-6 bg-[#112d1b] border-y border-[#D4AF37]/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">A Matemática Invertida</h2>
          <p className="text-neutral-400 mb-16 font-light">
            O tarifário de alta temporada sobe todos os anos. 
            Ao ingressar no programa <span className="text-[#D4AF37] font-semibold">Solar Sem Limites</span>, você blinda a sua família da inflação.
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
            
            {/* Box Comum */}
            <div className="bg-[#06140b] border border-neutral-800 rounded-2xl p-8 opacity-70">
              <div className="text-neutral-500 uppercase tracking-widest text-sm mb-4">Mundo Real (Próximo Ano)</div>
              <div className="text-3xl font-serif text-neutral-400 mb-2 line-through decoration-red-900/50">R$ 1.833,00</div>
              <p className="text-neutral-600 text-sm">Valor de balcão previsto para diária de um quarto quádruplo em Julho.</p>
            </div>

            {/* Box Solar Sem Limites */}
            <div className="bg-gradient-to-b from-[#1a3d24] to-[#06140b] border border-[#D4AF37]/30 rounded-2xl p-10 transform md:scale-110 shadow-[0_0_50px_rgba(212,175,55,0.05)] relative">
              <div className="absolute top-0 right-0 bg-[#D4AF37] text-black font-light tracking-widest text-[9px] uppercase px-3 py-1 rounded-bl-lg rounded-tr-xl">
                CONDIÇÃO EXCLUSIVA
              </div>
              <div className="text-[#D4AF37] uppercase tracking-widest text-sm mb-4">Seu Acesso Institucional</div>
              <div className="text-5xl font-serif text-white mb-2">R$ 516<span className="text-2xl text-neutral-500">,66</span></div>
              <p className="text-neutral-400 text-sm">Valor congelado e cravado por diária (total R$ 3.100,00), pra você usar pelos próximos 12 meses (ou mais).</p>
            </div>

          </div>
        </div>
      </section>

      {/* SESSÃO DE INCLUSÕES RÁPIDAS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex flex-col">
              <h3 className="text-2xl font-serif mb-6 text-[#D4AF37]">O que está garantido em seu acesso?</h3>
              <div className="w-full h-56 md:h-64 rounded-xl overflow-hidden mb-8 border border-neutral-800 shadow-2xl relative">
                <img src={`${base}lux_boat_real.jpg`} alt="Passeio Exclusivo Lifestyle" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06140b] via-transparent to-transparent"></div>
              </div>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <strong className="block text-lg mb-1">Passe Privilégio de 6 Diárias Totais</strong>
                    <span className="text-neutral-400 text-sm leading-relaxed">Você compra 5 diárias luxuosas e nós te damos 1 noite adicional de presente (bônus).</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <Coffee className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <strong className="block text-lg mb-1">Nosso Famoso Café da Manhã</strong>
                    <span className="text-neutral-400 text-sm leading-relaxed">Estadia completa sempre incluindo o nosso farto café da manhã colonial.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <Anchor className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <strong className="block text-lg mb-1">Passeio de Barco Exclusivo</strong>
                    <span className="text-neutral-400 text-sm leading-relaxed">Como membro, ganhe 1 voucher de cortesia para um inesquecível passeio de barco na orla.</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#112d1b] p-8 rounded-2xl border border-neutral-800 flex flex-col justify-center text-center">
              <ShieldCheck className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
              <h4 className="text-xl mb-4 text-white">Segurança Flexível</h4>
              <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                Nós sabemos que a vida muda. Suas diárias podem ser passadas adiante, presenteadas para familiares ou até reserváveis em múltiplos quartos ao mesmo tempo para grupos (na baixa temporada).
              </p>
              
              <div className="text-center pt-6 border-t border-neutral-800">
                <div className="text-neutral-500 mb-2">Preço Final do Lote (6 noites)</div>
                <div className="text-3xl text-white font-serif mb-6">6x de R$ 568,33</div>
                
                <button 
                  onClick={handleCheckoutClick}
                  className="w-full inline-flex items-center justify-center py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-wider rounded transition-transform hover:-translate-y-1"
                >
                  Acessar o Benefício
                </button>
                <div className="mt-4 text-[10px] text-neutral-500 font-light tracking-widest uppercase inline-block">* Sujeito à verificação para o máximo de 2 adesões por família</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SESSÃO 2.5: PROVA SOCIAL */}
      <section className="py-24 px-6 bg-[#06140b] border-t border-[#D4AF37]/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-[#D4AF37] mb-4">Quem já viveu a experiência</h2>
            <p className="text-neutral-400 font-light max-w-2xl mx-auto">Ouvir de quem já aproveitou o modelo inteligente de férias sempre traz paz de espírito.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { quote: "Economizei mais de R$ 1.200 na alta temporada. O atendimento foi impecável do check-in ao check-out.", author: "Ana Paula", location: "Belém, PA" },
              { quote: "Usei no feriado de julho sem pagar nada a mais. Foi a melhor decisão para nossas férias em família.", author: "Lucas & Camila", location: "Castanhal, PA" },
              { quote: "Ainda ganhamos o passeio de barco. Valeu demais! A estrutura do hotel é fantástica.", author: "Família Souza", location: "Macapá, AP" },
              { quote: "Sempre que o Solar abre as vagas desse programa eu garanto o meu. O melhor investimento que fiz para lazer!", author: "Roberto Silva", location: "Santarém, PA" },
            ].map((testi, idx) => (
              <div key={idx} className="bg-[#112d1b] p-8 rounded-xl border border-neutral-800 relative hover:border-[#D4AF37]/50 transition-colors duration-300">
                <span className="absolute top-4 left-6 text-5xl font-serif text-[#D4AF37]/20">"</span>
                <p className="font-light text-neutral-300 text-lg italic mb-6 relative z-10 leading-relaxed">{testi.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-full flex items-center justify-center text-[#D4AF37] font-bold font-serif border border-[#D4AF37]/30">
                    {testi.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#D4AF37]">{testi.author}</p>
                    <p className="text-xs text-neutral-500">{testi.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SESSÃO 2.6: TRIPLA GARANTIA */}
      <section className="py-24 px-6 bg-[#112d1b] border-t border-[#D4AF37]/10 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#D4AF37]/5 rounded-[100%] blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Tripla Garantia de Risco Zero</h2>
            <p className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm mb-6">Seu investimento está completamente protegido</p>
            <p className="text-neutral-400 font-light max-w-2xl mx-auto">A sua adesão está 100% protegida pelo mesmo código de defesa que rege as compras online. Você não corre nenhum risco.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Garantia Incondicional",
                days: "30 Dias",
                desc: "Cancelou dentro de 30 dias após a adesão? Devolvemos 100% do seu valor sem perguntas e sem burocracia.",
              },
              {
                title: "Garantia Pós-1ª Diária",
                days: "Satisfação",
                desc: "Usou a primeira diária e sentiu que não era para você? Reembolsamos o valor restante proporcionalmente.",
              },
              {
                title: "Garantia de Crédito",
                days: "Vitalício",
                desc: "Não conseguiu usar tudo no prazo de validade? O valor das diárias vira crédito integral para abater em viagens futuras.",
              }
            ].map((card, idx) => (
              <div key={idx} className="bg-[#06140b] p-8 border border-neutral-800 rounded-xl hover:border-[#D4AF37]/60 transition-colors duration-500 flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#142e1b] to-[#06140b] rounded-full flex items-center justify-center mb-6 border border-[#D4AF37]/20 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <span className="text-xs font-bold tracking-widest text-black uppercase mb-4 bg-[#D4AF37] px-4 py-1.5 rounded-full">{card.days}</span>
                <h4 className="font-serif text-xl text-white mb-4 font-bold">{card.title}</h4>
                <p className="text-neutral-400 font-light leading-relaxed text-sm">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button 
              onClick={handleCheckoutClick}
              className="px-12 py-5 border-2 border-[#D4AF37] text-[#D4AF37] font-bold uppercase tracking-widest rounded-lg hover:bg-[#D4AF37] hover:text-black transition-colors shadow-[0_0_20px_rgba(212,175,55,0.1)]"
            >
              Consolidar Acesso Seguro
            </button>
          </div>
        </div>
      </section>

      {/* SESSÃO 3: FAQ / PAGAMENTO (MULTIMAL/PIX+CARTÃO) */}
      <section className="py-24 px-6 bg-[#040e08]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-16"><span className="text-[#D4AF37]">Dúvidas Rápidas</span> de quem está aqui.</h2>
          
          <div className="space-y-4">
            <div className="bg-[#112d1b] p-6 rounded-lg border border-neutral-800">
              <h4 className="flex items-center gap-3 text-lg font-medium mb-3">
                <Clock className="text-[#D4AF37] w-5 h-5 shrink-0" />
                Mas e se eu quiser voltar no Círio? Ou em outro feriado?
              </h4>
              <p className="text-neutral-400 pl-8">
                Fique tranquilo(a)! O pacote permite agendamento livre, sujeito apenas à disponibilidade. Como membro SSL, você terá prioridade se agendar com antecedência.
              </p>
            </div>
            
            <div className="bg-[#112d1b] p-6 rounded-lg border border-neutral-800">
              <h4 className="flex items-center gap-3 text-lg font-medium mb-3">
                <CreditCard className="text-[#D4AF37] w-5 h-5 shrink-0" />
                Como o pagamento é feito? Meu limite estourou nesta viagem!
              </h4>
              <p className="text-neutral-400 pl-8 leading-relaxed">
                Nós sabemos que viagens comprometem o cartão. Por isso, no nosso checkout exclusivo, além de parcelamento normal, **VOCÊ PODE DIVIDIR O PAGAMENTO:** Dê um valor de entrada no PIX e parcele apenas a diferença no cartão. Assim, não bloqueia o seu retorno.
              </p>
            </div>
          </div>

          <div className="text-center mt-16 pb-12">
            <button 
              onClick={handleCheckoutClick}
              className="px-10 py-5 border border-[#D4AF37] text-[#D4AF37] font-bold uppercase tracking-widest rounded-lg hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              Assegurar Minha Condição Exclusiva
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
