import React, { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Check, Copy, Gift, LockKeyhole, Megaphone, Users } from 'lucide-react';
import { AVISO_DE_PRIVACIDADE_URL } from './avisoDePrivacidade';
import { registrarIndicacaoDaUrl } from './codigoDeIndicacao';
import { IconeWhatsApp, linkWhatsApp } from './contatosDoHotel';
import { formatarTelefoneBR } from './telefoneBR';

// Lista VIP Solar Sem Limites 2027, em hotelsolar.tur.br/vip (decisões de
// Geraldo em 06 e 10/10/2026; regulamento item 10, versão 2026-10-10).
//
// É o endereço do link pessoal de indicação. Até 25/11 às 8h, quem abre o
// link entra na Lista VIP e ganha o próprio link; a indicação fica gravada no
// cadastro (vale a primeira). A partir desse horário, o mesmo link leva direto
// à página de vendas, levando o ?ref= junto.

// Abertura das vendas ao público (definições comerciais). A hora vem do
// servidor, para um celular com relógio errado não mudar o destino.
export const ABERTURA_DAS_VENDAS = '2026-11-25T08:00:00-03:00';
const PAGINA_DE_VENDAS = '/solarsemlimites2027';
const REGULAMENTO_URL = '/solarsemlimites2026/Regulamento_SSL.pdf';
// Canal do lançamento no WhatsApp, "Solar Sem Limites | Canal VIP" (o mesmo
// link de antes; confirmado por Geraldo em 20/10/2026).
export const CANAL_DO_LANCAMENTO = 'https://whatsapp.com/channel/0029Vb8iEz73gvWjJea5rt3k';
export const MENSAGEM_ENTRAR_PELO_WHATSAPP = 'Quero entrar na Lista VIP Solar Sem Limites 2027';

type Etapa = 'verificando' | 'formulario' | 'enviando' | 'pronto';

export function destinoDoLink(agora: Date, codigo: string): string | null {
  if (agora.getTime() < new Date(ABERTURA_DAS_VENDAS).getTime()) return null;
  return codigo ? `${PAGINA_DE_VENDAS}?ref=${encodeURIComponent(codigo)}` : PAGINA_DE_VENDAS;
}

export function mensagemParaCompartilhar(link: string) {
  return `Vem comigo para a Lista VIP do Solar Sem Limites 2027, do Hotel Solar, em Salinas. Entre pelo meu link: ${link}`;
}

/** Mensagem pronta para entrar pelo WhatsApp, com o convite de quem indicou. */
export function mensagemDeEntrada(convite: string) {
  return convite ? `${MENSAGEM_ENTRAR_PELO_WHATSAPP} (convite ${convite})` : MENSAGEM_ENTRAR_PELO_WHATSAPP;
}

// Id do evento Lead: o mesmo vai no fbq do navegador e na Conversions API do
// servidor, para a Meta contar uma entrada só.
function novoIdDeEvento() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {
    // Sem crypto: segue para o id montado à mão.
  }
  return `vip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

async function horaDoServidor(): Promise<Date> {
  try {
    const resposta = await fetch('/api/solar-status', { cache: 'no-store', signal: AbortSignal.timeout(2500) });
    const data = resposta.headers.get('date');
    const hora = data ? new Date(data) : null;
    if (hora && Number.isFinite(hora.getTime())) return hora;
  } catch {
    // Sem resposta, vale o relógio do aparelho.
  }
  return new Date();
}

function registrar(evento: string, params: Record<string, string | boolean> = {}) {
  const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: evento, ...params });
  w.gtag?.('event', evento, params);
}

const formatarTelefone = formatarTelefoneBR;

const assetUrl = (arquivo: string) => `${import.meta.env.BASE_URL}${arquivo.replace(/^\/+/, '')}`;

const VANTAGENS = [
  { icone: CalendarDays, titulo: 'Visita guiada ao vivo', texto: '24 de novembro, às 19h, pelo hotel e pelas experiências do pacote.' },
  { icone: Megaphone, titulo: 'Aviso da abertura', texto: 'Em 25 de novembro, às 8h, quando as vendas abrem para todos.' },
  { icone: Gift, titulo: 'As condições antes', texto: 'O que o Solar Sem Limites 2027 inclui, explicado antes da abertura.' },
  { icone: Users, titulo: 'Seu link pessoal', texto: 'Para chamar família e amigos para a Lista VIP.' },
];

const REGRA_DA_INDICACAO = 'Cada pessoa que entrar pelo seu link e comprar o pacote até 01/12 rende 1 diária adicional de baixa temporada para você, desde que você também compre até 01/12. A diária é liberada 30 dias após a compra mais recente, com limite de 5 diárias por CPF.';

const campo = 'w-full rounded-xl border border-[#cbd8d3] bg-[#fbfcfa] px-4 py-3.5 text-base text-[#173a35] outline-none transition placeholder:text-slate-400 focus:border-[#0f5c45] focus:ring-4 focus:ring-[#0f5c45]/10';

export default function ListaVip() {
  const [etapa, setEtapa] = useState<Etapa>('verificando');
  const [convite, setConvite] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [website, setWebsite] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [link, setLink] = useState('');
  const [emailSuprimido, setEmailSuprimido] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    document.title = 'Lista VIP Solar Sem Limites 2027 | Hotel Solar';
    // Guarda o convite antes de qualquer navegação: depois da abertura ele
    // segue até o checkout pela página de vendas.
    const codigo = registrarIndicacaoDaUrl().toUpperCase();
    setConvite(codigo);
    let ativo = true;
    horaDoServidor().then((agora) => {
      if (!ativo) return;
      const destino = destinoDoLink(agora, codigo);
      if (destino) {
        window.location.replace(destino);
        return;
      }
      setEtapa('formulario');
      registrar('ssl26_lista_vip_view', { convite_presente: Boolean(codigo) });
    });
    return () => {
      ativo = false;
    };
  }, []);

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensagem('');
    if (!consentimento) {
      setMensagem('Confirme o consentimento para entrar na Lista VIP.');
      return;
    }
    setEtapa('enviando');
    const eventId = novoIdDeEvento();
    try {
      const resposta = await fetch('/api/lista-vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, telefone, email, consent: true, convite, website, eventId, pageUrl: window.location.href }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok || dados.success !== true || typeof dados.link !== 'string') {
        throw new Error(typeof dados.error === 'string' ? dados.error : 'Não conseguimos concluir agora. Tente novamente em instantes.');
      }
      setLink(dados.link);
      setEmailSuprimido(dados.emailDelivery === 'suppressed');
      setEtapa('pronto');
      registrar('ssl26_lista_vip_entrou', { convite_presente: Boolean(convite) });
      // Evento de conversão da campanha da Fase 1 (cadastro na Lista VIP).
      window.fbq?.('track', 'Lead', {
        content_name: 'ssl27_lista_vip',
        content_category: convite ? 'indicacao' : 'lista_vip',
      }, { eventID: eventId });
    } catch (erro) {
      setMensagem(erro instanceof Error ? erro.message : 'Não conseguimos concluir agora. Tente novamente em instantes.');
      setEtapa('formulario');
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      registrar('ssl26_lista_vip_link_copiado');
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Sem permissão de área de transferência: o link continua visível para copiar à mão.
    }
  }

  if (etapa === 'verificando') {
    return <main className="min-h-screen bg-[#f5f1e7]" aria-busy="true" />;
  }

  const primeiroNome = nome.trim().split(/\s+/)[0] || '';

  return (
    <main className="min-h-screen bg-[#f5f1e7] font-sans text-[#173a35]">
      <section className="relative overflow-hidden bg-[#0b3d2e] text-white">
        <img
          src={assetUrl('videos/ssl26/hotel-solar-apresentacao-capa.jpg')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b3d2e]/60 via-[#0b3d2e]/80 to-[#0b3d2e]" />
        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
          <img
            src={assetUrl('logoSOLAR2.png')}
            alt="Hotel Solar"
            className="mb-6 h-16 w-auto sm:mb-8 sm:h-20"
          />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e1c084]">Hotel Solar · Salinópolis</p>
          {convite && etapa !== 'pronto' && (
            <p className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-[#f3e8d2]">
              Você recebeu um convite para a Lista VIP
            </p>
          )}
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Lista VIP Solar Sem Limites 2027
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#dbe8e4]">
            Entre na lista e saiba de tudo primeiro: a visita guiada ao vivo, as condições do pacote e o aviso da abertura das vendas.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 grid max-w-5xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="order-2 lg:order-1 lg:pt-14">
          <h2 className="font-serif text-2xl font-semibold">Quem está na Lista VIP recebe</h2>
          <ul className="mt-6 space-y-5">
            {VANTAGENS.map(({ icone: Icone, titulo, texto }) => (
              <li key={titulo} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e7efe9] text-[#0f5c45]">
                  <Icone size={21} />
                </span>
                <span>
                  <strong className="block">{titulo}</strong>
                  <span className="text-[#52625e]">{texto}</span>
                </span>
              </li>
            ))}
          </ul>
          {etapa !== 'pronto' && (
            <div className="mt-8 rounded-2xl border border-[#e4d5b5] bg-[#faf5e9] p-5 text-sm leading-relaxed text-[#5c4a22]">
              <strong className="block text-base text-[#173a35]">Venha com quem você gosta</strong>
              <p className="mt-2">
                {REGRA_DA_INDICACAO}{' '}
                <a href={REGULAMENTO_URL} target="_blank" rel="noopener noreferrer" className="underline">
                  Condições no regulamento
                </a>.
              </p>
            </div>
          )}
        </div>

        <div className="order-1 rounded-3xl bg-white p-6 shadow-xl shadow-[#0b3d2e]/10 sm:p-8 lg:order-2">
          {etapa !== 'pronto' ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b18433]">Entre na lista</p>
              <h2 className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight sm:text-3xl">Quero saber primeiro</h2>
              <form className="mt-6 space-y-4" onSubmit={entrar}>
                <div>
                  <label htmlFor="nome" className="mb-1.5 block text-sm font-bold text-[#284f48]">Nome</label>
                  <input id="nome" name="nome" autoComplete="name" required minLength={2} value={nome}
                    onChange={(e) => setNome(e.target.value)} className={campo} placeholder="Como podemos chamar você?" />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-bold text-[#284f48]">WhatsApp</label>
                  <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" required minLength={14}
                    value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} className={campo}
                    placeholder="(91) 99999-9999" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-[#284f48]">E-mail</label>
                  <input id="email" name="email" type="email" autoComplete="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)} className={campo} placeholder="voce@email.com" />
                </div>
                <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#f4f7f3] p-3.5 text-sm leading-relaxed text-slate-600">
                  <input type="checkbox" required checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0f5c45]" />
                  <span>
                    Concordo em entrar na Lista VIP Solar Sem Limites 2027 e receber comunicações do Hotel Solar por e-mail e WhatsApp. Posso cancelar quando quiser. Veja o{' '}
                    <a href={AVISO_DE_PRIVACIDADE_URL} target="_blank" rel="noopener noreferrer" className="underline">Aviso de Privacidade</a>.
                  </span>
                </label>
                {mensagem && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{mensagem}</p>}
                <button type="submit" disabled={etapa === 'enviando'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5c45] px-5 py-4 text-base font-bold text-white shadow-lg shadow-[#0f5c45]/20 transition hover:bg-[#0b4d3a] disabled:cursor-wait disabled:opacity-70">
                  {etapa === 'enviando' ? 'Entrando na lista...' : 'Entrar na Lista VIP'}
                  {etapa !== 'enviando' && <ArrowRight size={19} />}
                </button>
              </form>
              <a
                href={linkWhatsApp(mensagemDeEntrada(convite))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => registrar('ssl26_lista_vip_whatsapp', { convite_presente: Boolean(convite), local: 'formulario' })}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0f5c45] bg-white px-4 py-3.5 text-sm font-bold text-[#0f5c45] transition hover:bg-[#f0f7f4] sm:text-base"
              >
                <IconeWhatsApp /> Prefiro entrar pelo WhatsApp
              </a>
              <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
                <LockKeyhole size={13} /> Seus dados são tratados com segurança e respeito.
              </p>
            </>
          ) : (
            <div id="lista-vip-concluida">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f5ec] text-[#0f6a48]">
                <Check size={25} strokeWidth={3} />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#b18433]">Você está na Lista VIP</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight">Pronto, {primeiroNome}!</h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                {emailSuprimido
                  ? 'Seu lugar na lista está garantido. Desta vez não enviamos o e-mail: guarde o seu link abaixo.'
                  : 'Seu lugar na lista está garantido. Mandamos também um e-mail com o seu link; confira a caixa de spam.'}
              </p>
              <div className="mt-6 rounded-2xl border border-[#d9e4df] bg-[#f4f8f6] p-5">
                <p className="text-sm font-bold text-[#284f48]">Seu link pessoal</p>
                <p className="mt-2 break-all rounded-lg bg-white px-3 py-2.5 font-mono text-sm text-[#173a35]">{link}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={copiarLink}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#0f5c45] bg-white px-4 py-3 text-sm font-bold text-[#0f5c45] transition hover:bg-[#f0f7f4]">
                    {copiado ? <Check size={17} /> : <Copy size={17} />} {copiado ? 'Link copiado' : 'Copiar link'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(mensagemParaCompartilhar(link))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => registrar('ssl26_lista_vip_compartilhou')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0f5c45] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0b4d3a]"
                  >
                    <IconeWhatsApp /> Compartilhar
                  </a>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#52625e]">
                  {REGRA_DA_INDICACAO}{' '}
                  <a href={REGULAMENTO_URL} target="_blank" rel="noopener noreferrer" className="underline">Condições no regulamento</a>.
                </p>
              </div>
              <div className="mt-4 rounded-2xl border border-[#e4d5b5] bg-[#faf5e9] p-5">
                <p className="text-sm font-bold text-[#284f48]">Canal do lançamento no WhatsApp</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5c4a22]">
                  No canal Solar Sem Limites você recebe primeiro as datas, as condições e o aviso da abertura das vendas.
                </p>
                <a
                  href={CANAL_DO_LANCAMENTO}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => registrar('ssl26_lista_vip_canal', { local: 'concluido' })}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5c45] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b4d3a] sm:text-base"
                >
                  <IconeWhatsApp /> Seguir o canal no WhatsApp
                </a>
              </div>
              <a
                href={linkWhatsApp(MENSAGEM_ENTRAR_PELO_WHATSAPP)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => registrar('ssl26_lista_vip_whatsapp', { local: 'concluido' })}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0f5c45] bg-white px-4 py-3.5 text-sm font-bold text-[#0f5c45] transition hover:bg-[#f0f7f4] sm:text-base"
              >
                <IconeWhatsApp /> Receber os avisos no WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
