import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Download,
  Heart,
  Hotel,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

type LeadProfile = 'ja_hospedou' | 'conhece' | 'nao_conhece';
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const analyticsCampaign = 'ssl26_novembro_2026';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}${fileName.replace(/^\/+/, '')}`;

interface TrackingData {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  referral: string;
}

const profileOptions: Array<{
  value: LeadProfile;
  title: string;
  description: string;
}> = [
  {
    value: 'ja_hospedou',
    title: 'Já me hospedei no Hotel Solar',
    description: 'Quero voltar e viver novos dias em Salinas.',
  },
  {
    value: 'conhece',
    title: 'Conheço, mas nunca me hospedei',
    description: 'Quero entender melhor a experiência do hotel.',
  },
  {
    value: 'nao_conhece',
    title: 'Ainda não conheço o hotel',
    description: 'Quero descobrir Salinas e o Hotel Solar.',
  },
];

function getTrackingData(): TrackingData {
  const pageParams = new URLSearchParams(window.location.search);
  const hashQuery = window.location.hash.includes('?')
    ? window.location.hash.slice(window.location.hash.indexOf('?') + 1)
    : '';
  const hashParams = new URLSearchParams(hashQuery);
  const value = (key: string) => hashParams.get(key) || pageParams.get(key) || '';

  return {
    utmSource: value('utm_source'),
    utmMedium: value('utm_medium'),
    utmCampaign: value('utm_campaign'),
    utmContent: value('utm_content'),
    utmTerm: value('utm_term'),
    referral: value('ref'),
  };
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function analyticsParams(tracking: TrackingData) {
  return {
    campaign_name: tracking.utmCampaign || analyticsCampaign,
    source: tracking.utmSource || 'direct',
    medium: tracking.utmMedium || 'none',
    content: tracking.utmContent || 'not_set',
    referral_present: Boolean(tracking.referral),
  };
}

function trackEvent(eventName: string, params: Record<string, string | boolean> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
  window.gtag?.('event', eventName, params);
}

function trackLead(tracking: TrackingData) {
  const params = analyticsParams(tracking);
  trackEvent('generate_lead', params);
  window.fbq?.('track', 'Lead', {
    content_name: analyticsCampaign,
    content_category: params.source,
  });
}

export default function CapturaNovembro() {
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<LeadProfile | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [submissionId] = useState(() => `ssl26-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`);
  const tracking = useMemo(getTrackingData, []);
  const formStarted = useRef(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Guia Salinas em Família | Hotel Solar';
    trackEvent('ssl26_capture_view', analyticsParams(tracking));
    return () => {
      document.title = previousTitle;
    };
  }, [tracking]);

  function trackFormStart() {
    if (formStarted.current) return;
    formStarted.current = true;
    trackEvent('ssl26_form_start', analyticsParams(tracking));
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (!consent) {
      setStatus('error');
      setMessage('Confirme o consentimento para receber o guia e as novidades.');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture',
          firstName: firstName.trim(),
          phone,
          email: email.trim(),
          consent,
          website,
          leadId: submissionId,
          pageUrl: window.location.href,
          ...tracking,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível concluir o cadastro.');
      }

      setStatus('success');
      trackLead(tracking);
      window.setTimeout(() => {
        document.getElementById('cadastro-concluido')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 80);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Tente novamente em alguns instantes.');
    }
  }

  async function saveProfile(selectedProfile: LeadProfile) {
    setProfile(selectedProfile);
    setProfileSaved(true);

    try {
      const response = await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'profile',
          email: email.trim(),
          phone,
          profile: selectedProfile,
          consent,
          leadId: submissionId,
          pageUrl: window.location.href,
          ...tracking,
        }),
      });
      if (!response.ok) throw new Error('Não foi possível salvar o perfil.');
      trackEvent('ssl26_profile_saved', {
        ...analyticsParams(tracking),
        lead_profile: selectedProfile,
      });
    } catch {
      // O guia continua disponível mesmo se a etapa opcional de perfil falhar.
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f4ea] font-sans text-[#173a35] selection:bg-[#dfbd75] selection:text-[#173a35]">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <a href="#topo" aria-label="Hotel Solar — início" className="flex items-center gap-3">
            <img src={assetUrl('logoSOLAR2.png')} alt="Hotel Solar" className="h-11 w-auto brightness-0 invert sm:h-14" />
          </a>
          <a
            href="#guia"
            className="hidden items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20 sm:flex"
          >
            Conheça o guia <ChevronDown size={16} />
          </a>
        </div>
      </header>

      <main id="topo">
        <section className="relative isolate min-h-[880px] overflow-hidden bg-[#0d4037] lg:min-h-[760px]">
          <img
            src={assetUrl('hotel-panoramica-rio.jpg')}
            alt="Vista aérea do Hotel Solar às margens do rio em Salinópolis"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,37,32,.96)_0%,rgba(8,48,40,.87)_43%,rgba(8,38,34,.48)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(225,192,132,.22),transparent_34%)]" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-16 lg:px-12 lg:pb-20 lg:pt-32">
            <div className="max-w-2xl text-white">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e1c084]/40 bg-[#e1c084]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f1d9aa] backdrop-blur-sm sm:text-sm">
                <Sparkles size={15} /> Guia gratuito + Lista VIP
              </div>
              <h1 className="font-serif text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                Salinas começa antes da estrada.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/82 sm:text-xl">
                Planeje dias mais leves com o <strong className="text-white">Guia Salinas em Família</strong> e receba o convite para conhecer o Hotel Solar ao vivo — mesmo que você ainda nunca tenha vindo ao Pará.
              </p>

              <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
                {[
                  ['3 dias', 'de roteiro'],
                  ['Dicas', 'de maré e praias'],
                  ['24/11', 'encontro ao vivo'],
                ].map(([value, label]) => (
                  <div key={value} className="border-l border-[#e1c084]/60 pl-4">
                    <strong className="block font-serif text-2xl text-[#f1d9aa]">{value}</strong>
                    <span className="text-sm text-white/68">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:justify-self-end">
              <div className="relative mx-auto max-w-md rounded-[28px] border border-white/20 bg-white p-6 shadow-2xl shadow-black/25 sm:p-8 lg:mx-0">
                <div className="absolute -right-5 -top-5 hidden h-20 w-20 rounded-full border border-[#e1c084]/40 bg-[#e1c084]/10 backdrop-blur-md sm:block" />

                {status !== 'success' ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b18433]">Receba agora</p>
                    <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-[#173a35]">
                      Seu guia para viver Salinas em família
                    </h2>
                    <p className="mt-3 leading-relaxed text-slate-600">
                      Preencha seus dados e enviaremos o acesso gratuito para você.
                    </p>

                    <form className="mt-6 space-y-4" onSubmit={submitLead} onFocusCapture={trackFormStart}>
                      <div>
                        <label htmlFor="firstName" className="mb-1.5 block text-sm font-bold text-[#284f48]">Primeiro nome</label>
                        <input
                          id="firstName"
                          name="firstName"
                          autoComplete="given-name"
                          required
                          minLength={2}
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          className="w-full rounded-xl border border-[#cbd8d3] bg-[#fbfcfa] px-4 py-3.5 text-base text-[#173a35] outline-none transition placeholder:text-slate-400 focus:border-[#0f5c45] focus:ring-4 focus:ring-[#0f5c45]/10"
                          placeholder="Como podemos chamar você?"
                        />
                      </div>
                      <div>
                        <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-bold text-[#284f48]">WhatsApp</label>
                        <input
                          id="whatsapp"
                          name="whatsapp"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          required
                          minLength={14}
                          value={phone}
                          onChange={(event) => setPhone(formatPhone(event.target.value))}
                          className="w-full rounded-xl border border-[#cbd8d3] bg-[#fbfcfa] px-4 py-3.5 text-base text-[#173a35] outline-none transition placeholder:text-slate-400 focus:border-[#0f5c45] focus:ring-4 focus:ring-[#0f5c45]/10"
                          placeholder="(91) 99999-9999"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-[#284f48]">E-mail</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="w-full rounded-xl border border-[#cbd8d3] bg-[#fbfcfa] px-4 py-3.5 text-base text-[#173a35] outline-none transition placeholder:text-slate-400 focus:border-[#0f5c45] focus:ring-4 focus:ring-[#0f5c45]/10"
                          placeholder="voce@email.com"
                        />
                      </div>
                      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                        <label htmlFor="website">Website</label>
                        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
                      </div>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#f4f7f3] p-3.5 text-sm leading-relaxed text-slate-600">
                        <input
                          type="checkbox"
                          required
                          checked={consent}
                          onChange={(event) => setConsent(event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0f5c45]"
                        />
                        <span>Concordo em receber o guia e comunicações do Hotel Solar por e-mail e WhatsApp. Posso cancelar quando quiser.</span>
                      </label>

                      {message && (
                        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</p>
                      )}

                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5c45] px-5 py-4 text-base font-bold text-white shadow-lg shadow-[#0f5c45]/20 transition hover:-translate-y-0.5 hover:bg-[#0b4d3a] disabled:cursor-wait disabled:opacity-70"
                      >
                        {status === 'loading' ? 'Preparando seu acesso...' : 'Quero receber o guia gratuito'}
                        {status !== 'loading' && <ArrowRight size={19} />}
                      </button>
                    </form>
                    <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
                      <LockKeyhole size={13} /> Seus dados são tratados com segurança e respeito.
                    </p>
                  </>
                ) : (
                  <div id="cadastro-concluido" className="py-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f5ec] text-[#0f6a48]">
                      <Check size={25} strokeWidth={3} />
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#b18433]">Cadastro concluído</p>
                    <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight">Pronto, {firstName.split(' ')[0]}!</h2>
                    <p className="mt-3 leading-relaxed text-slate-600">
                      Seu guia já está liberado. Também enviamos o acesso para o seu e-mail.
                    </p>
                    <a
                      href={assetUrl('guia-salinas-em-familia.pdf')}
                      download
                      onClick={() => trackEvent('ssl26_guide_download', analyticsParams(tracking))}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5c45] px-5 py-4 font-bold text-white transition hover:bg-[#0b4d3a]"
                    >
                      <Download size={19} /> Baixar o guia agora
                    </a>

                    <div className="my-6 h-px bg-slate-200" />

                    {!profileSaved ? (
                      <>
                        <h3 className="font-bold text-[#173a35]">Antes de ir: qual é a sua relação com o Hotel Solar?</h3>
                        <p className="mt-1 text-sm text-slate-500">Leva menos de 10 segundos e ajuda a personalizar os próximos conteúdos.</p>
                        <div className="mt-4 space-y-2.5">
                          {profileOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => saveProfile(option.value)}
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-[#0f5c45] hover:bg-[#f4f8f6]"
                            >
                              <strong className="block text-sm text-[#173a35]">{option.title}</strong>
                              <span className="mt-0.5 block text-xs text-slate-500">{option.description}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-2xl bg-[#f4f8f6] p-5 text-center">
                        <Heart className="mx-auto text-[#b18433]" size={25} />
                        <strong className="mt-2 block">Obrigado por contar para nós.</strong>
                        <p className="mt-1 text-sm text-slate-600">Você receberá conteúdos pensados para o seu momento.</p>
                        {profile && <span className="sr-only">Perfil salvo: {profile}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="guia" className="relative py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="grid items-center gap-14 lg:grid-cols-[.92fr_1.08fr] lg:gap-20">
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute -left-4 -top-4 h-full w-full rounded-[32px] border border-[#d7bd86]" />
                <div className="relative overflow-hidden rounded-[32px] bg-[#0b3d2e] shadow-xl">
                  <img src={assetUrl('hotel-cafe-manha.jpg')} alt="Café da manhã servido no Hotel Solar" className="h-[470px] w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#072c25] via-[#072c25]/75 to-transparent p-8 pt-24 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e7c887]">Guia Salinas em Família</p>
                    <p className="mt-2 font-serif text-3xl font-semibold">Menos improviso. Mais tempo juntos.</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a87825]">Um roteiro que cabe na vida real</p>
                <h2 className="mt-4 max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                  Tudo o que você precisa para começar a imaginar sua próxima viagem.
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                  O guia reúne uma sugestão prática de três dias, cuidados importantes com a maré e formas de equilibrar praia, descanso e experiências para diferentes idades.
                </p>

                <div className="mt-9 grid gap-4 sm:grid-cols-2">
                  {[
                    [Compass, 'Roteiro de 3 dias', 'Maçarico, Corvina, Atalaia, ilhas e manguezais em um ritmo possível.'],
                    [ShieldCheck, 'Cuidados de viagem', 'Orientações simples para aproveitar praias e marés com mais tranquilidade.'],
                    [Users, 'Pensado para famílias', 'Sugestões que respeitam crianças, adultos e o tempo de descanso.'],
                    [Hotel, 'Uma base em Salinas', 'Conheça o Hotel Solar e entenda como ele pode fazer parte da experiência.'],
                  ].map(([Icon, title, text]) => {
                    const CardIcon = Icon as typeof Compass;
                    return (
                      <div key={title as string} className="rounded-2xl border border-[#ded8ca] bg-white/70 p-5">
                        <CardIcon size={23} className="text-[#0f5c45]" />
                        <strong className="mt-3 block text-[#173a35]">{title as string}</strong>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text as string}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#e9eee8] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-20">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a87825]">Para quem ainda não conhece</p>
                <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
                  Um hotel com história para ser a sua casa em Salinas.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  O Hotel Solar recebe gerações de famílias desde 1973. Às margens do rio e perto dos principais passeios, combina a hospitalidade paraense com a liberdade de viver Salinas no seu ritmo.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {['Café da manhã', 'Piscina', 'Recepção 24h', 'Estacionamento', 'Ambiente familiar'].map((item) => (
                    <span key={item} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#31554e] shadow-sm">
                      <Check size={15} className="text-[#b18433]" /> {item}
                    </span>
                  ))}
                </div>
                <div className="mt-9 flex items-center gap-4 rounded-2xl border-l-4 border-[#d2a958] bg-white/75 p-5">
                  <Star className="shrink-0 fill-[#d2a958] text-[#d2a958]" size={24} />
                  <p className="leading-relaxed text-[#31554e]">
                    <strong>Já conhece o Solar?</strong> Então este convite também é para você: volte a olhar Salinas com novos planos e acompanhe primeiro o que estamos preparando.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-3 rotate-2 rounded-[34px] bg-[#d7bd86]/45" />
                <img
                  src={assetUrl('hotel-piscina.jpg')}
                  alt="Área de piscina do Hotel Solar em Salinópolis"
                  className="relative h-[500px] w-full rounded-[30px] object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0b3d2e] py-20 text-white sm:py-24">
          <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full border border-[#e1c084]/20" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full border border-[#e1c084]/15" />
          <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e1c084] text-[#173a35]">
              <CalendarDays size={28} />
            </div>
            <p className="mt-7 text-sm font-bold uppercase tracking-[0.22em] text-[#e7c887]">Encontro online e gratuito</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Conheça o Hotel Solar ao vivo.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              No dia <strong className="text-white">24 de novembro, às 19h</strong>, faremos uma visita guiada online para mostrar o hotel, responder perguntas e apresentar uma novidade para quem deseja voltar mais vezes a Salinas.
            </p>
            <a
              href="#topo"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[#e1c084] px-7 py-4 font-bold text-[#173a35] transition hover:-translate-y-0.5 hover:bg-[#efcf8c]"
            >
              Entrar na lista e receber o convite <ArrowRight size={19} />
            </a>
            <p className="mt-4 text-sm text-white/50">A participação na lista é gratuita e não obriga nenhuma compra.</p>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-5xl gap-8 px-5 sm:grid-cols-3 sm:px-8">
            {[
              [Download, 'Guia imediato', 'Baixe assim que concluir seu cadastro.'],
              [Mail, 'Lembretes úteis', 'Receba o acesso ao encontro e conteúdos de preparação.'],
              [MessageCircle, 'Canal direto', 'Escolha acompanhar também pelo WhatsApp.'],
            ].map(([Icon, title, text]) => {
              const ItemIcon = Icon as typeof Download;
              return (
                <div key={title as string} className="text-center">
                  <ItemIcon className="mx-auto text-[#b18433]" size={27} />
                  <strong className="mt-4 block text-lg text-[#173a35]">{title as string}</strong>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text as string}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#082f28] py-9 text-white/65">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 text-center text-sm sm:px-8 md:flex-row md:text-left lg:px-12">
          <div>
            <strong className="block text-white">Hotel Solar</strong>
            <span>Salinópolis, Pará · Desde 1973</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={15} /> Av. Atlântica, s/n — Salinópolis/PA
          </div>
          <p>© 2026 Hotel Solar. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
