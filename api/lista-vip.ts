import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  brevoRequest,
  clean,
  escapeHtml,
  normalizeBrazilianPhone,
  notifyMeta,
  readContactState,
  saveContact,
  validEmail,
} from './capture-lead.js';
import { salvarNaListaVipDoManyChat } from './manychat-lista-vip.js';

// Entrada na Lista VIP Solar Sem Limites 2027 pela página /vip (decisões de
// Geraldo em 06 e 10/10/2026; regulamento item 10, versão 2026-10-10).
//
// 1. Pede ao ERP o link pessoal de indicação. O ERP grava a pessoa na Lista
//    VIP e, se ela chegou pelo convite de alguém, a indicação (vale a
//    primeira). Sem o ERP não há link, então nada mais é gravado.
// 2. Salva o contato no Brevo, na lista SSL26_LISTA_VIP, com o link.
// 3. Manda o e-mail de boas-vindas com o link.
// 3b. Cria ou acha o contato no ManyChat, com o WhatsApp autorizado, a
//    etiqueta SSL26_LISTA_VIP e o link (28/10/2026; ver manychat-lista-vip.ts).
//
// 4. Avisa a Meta pela Conversions API (evento Lead, content_name
//    ssl27_lista_vip), com o mesmo event_id que o navegador manda no fbq.
//    É o que permite a campanha da Fase 1 otimizar para entrada na Lista VIP
//    sem contar a mesma pessoa duas vezes.
//
// Quem marca o consentimento na /vip recebe o e-mail de boas-vindas, mesmo que
// no passado tenha pedido para sair (o consentimento novo desfaz a saída),
// comprado ou estado em atendimento. Se não deu para conferir a identidade do
// e-mail no Brevo, nada é gravado nem enviado à Meta; o link aparece na tela
// do mesmo jeito, porque já foi gravado no ERP.

const ERP_URL = process.env.SOLAR_ERP_URL || 'https://erp-hotel-solar.vercel.app';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'geraldo@hotelsolar.tur.br';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Geraldo | Hotel Solar';
const REPLY_TO_EMAIL = process.env.BREVO_REPLY_TO_EMAIL || 'reserva@hotelsolar.tur.br';
const REPLY_TO_NAME = process.env.BREVO_REPLY_TO_NAME || 'Reservas | Hotel Solar';
const REGULAMENTO_URL = 'https://www.hotelsolar.tur.br/solarsemlimites2026/Regulamento_SSL.pdf';
const WHATSAPP_ATENDIMENTO = '(91) 98122-9825';
const WHATSAPP_ATENDIMENTO_LINK = 'https://wa.me/5591981229825';
const EVENTO_FORMATO = /^[A-Za-z0-9_-]{8,100}$/;
const CANAL_DO_LANCAMENTO = 'https://whatsapp.com/channel/0029Vb8iEz73gvWjJea5rt3k';
const LINK_FORMATO = /^https:\/\/www\.hotelsolar\.tur\.br\/vip\?ref=[A-Z0-9_-]{4,40}$/;

type RespostaDoErp = { codigo: string; link: string; indicacao: string };

async function pedirLinkAoErp(dados: {
  nome: string; telefone: string; email: string; convite: string; consentimentoEm: string;
}): Promise<RespostaDoErp> {
  const segredo = process.env.SOLAR_INGEST_SECRET || '';
  if (!segredo) throw new Error('SOLAR_INGEST_SECRET_MISSING');
  const resposta = await fetch(`${ERP_URL}/api/ssl26/lista-vip`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-solar-ingest-secret': segredo },
    body: JSON.stringify(dados),
    signal: AbortSignal.timeout(10000),
    redirect: 'error',
    cache: 'no-store',
  });
  const corpo = await resposta.json().catch(() => null) as Record<string, unknown> | null;
  if (!resposta.ok || corpo?.success !== true || typeof corpo.link !== 'string'
    || !LINK_FORMATO.test(corpo.link) || typeof corpo.codigo !== 'string') {
    throw new Error('ERP_LISTA_VIP_UNAVAILABLE');
  }
  return { codigo: corpo.codigo, link: corpo.link, indicacao: String(corpo.indicacao || '') };
}

export function mensagemParaCompartilhar(link: string) {
  return `Vem comigo para a Lista VIP do Solar Sem Limites 2027, do Hotel Solar, em Salinas. Entre pelo meu link: ${link}`;
}

export function emailDeBoasVindas(nome: string, link: string) {
  const nomeSeguro = escapeHtml(nome);
  const linkSeguro = escapeHtml(link);
  const compartilhar = `https://wa.me/?text=${encodeURIComponent(mensagemParaCompartilhar(link))}`;
  const regra = 'Cada pessoa que entrar pelo seu link e comprar o pacote até 01/12 rende 1 diária adicional de baixa temporada para você, desde que você também compre até 01/12. A diária é liberada 30 dias após a compra mais recente, com limite de 5 diárias por CPF.';
  return {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    replyTo: { name: REPLY_TO_NAME, email: REPLY_TO_EMAIL },
    to: [{ email: '', name: nome }],
    subject: `${nome}, você está na Lista VIP Solar Sem Limites 2027`,
    textContent: [
      `Olá, ${nome}! Você está na Lista VIP Solar Sem Limites 2027.`,
      'Visita guiada ao vivo pelo hotel: 24 de novembro de 2026, às 19h (horário de Belém).',
      'Abertura das vendas: 25 de novembro de 2026, às 8h.',
      `Seu link pessoal para chamar família e amigos: ${link}`,
      `${regra} Condições no regulamento: ${REGULAMENTO_URL}`,
      `Siga o canal Solar Sem Limites no WhatsApp para receber primeiro as datas, as condições e o aviso da abertura das vendas: ${CANAL_DO_LANCAMENTO}`,
      `Dúvidas? WhatsApp ${WHATSAPP_ATENDIMENTO}.`,
      'Você recebeu esta mensagem porque entrou na Lista VIP na página do Hotel Solar.',
    ].join('\n'),
    htmlContent: `
      <!doctype html>
      <html lang="pt-BR">
        <body style="margin:0;background:#f5f1e7;font-family:Arial,sans-serif;color:#173a35">
          <div style="max-width:620px;margin:0 auto;padding:32px 20px">
            <div style="background:#0b3d2e;border-radius:20px 20px 0 0;padding:32px;color:#fff">
              <div style="font-size:12px;letter-spacing:2px;color:#e1c084;font-weight:bold">HOTEL SOLAR · SALINÓPOLIS</div>
              <h1 style="font-size:30px;line-height:1.2;margin:14px 0 8px">Você está na Lista VIP</h1>
              <p style="margin:0;color:#dbe8e4;line-height:1.6">Solar Sem Limites 2027</p>
            </div>
            <div style="background:#fff;padding:32px;border-radius:0 0 20px 20px">
              <p style="font-size:17px;line-height:1.7;margin-top:0">Olá, ${nomeSeguro}!</p>
              <p style="font-size:16px;line-height:1.7;color:#52625e">A partir de agora, você fica sabendo primeiro de tudo do Solar Sem Limites 2027:</p>
              <div style="border-left:4px solid #d6ad5b;background:#f7f4eb;padding:16px 18px;margin:20px 0">
                <p style="margin:0 0 8px;line-height:1.6"><strong>24 de novembro, às 19h:</strong> visita guiada ao vivo pelo hotel.</p>
                <p style="margin:0;line-height:1.6"><strong>25 de novembro, às 8h:</strong> abertura das vendas.</p>
              </div>
              <div style="border:1px solid #d9e4df;background:#f4f8f6;padding:20px;margin:24px 0;border-radius:12px">
                <strong style="font-size:17px">Seu link pessoal</strong>
                <p style="font-size:15px;line-height:1.6;color:#52625e;margin:8px 0 12px">Chame família e amigos para a Lista VIP com o seu link:</p>
                <p style="font-size:15px;margin:0 0 16px;word-break:break-all"><a href="${linkSeguro}" style="color:#0f5c45;font-weight:bold">${linkSeguro}</a></p>
                <a href="${escapeHtml(compartilhar)}" style="display:inline-block;background:#0f5c45;color:#fff;text-decoration:none;font-weight:bold;padding:13px 20px;border-radius:10px">Compartilhar no WhatsApp</a>
                <p style="font-size:14px;line-height:1.6;color:#52625e;margin:16px 0 0">${escapeHtml(regra)} <a href="${REGULAMENTO_URL}" style="color:#0f5c45">Condições no regulamento</a>.</p>
              </div>
              <div style="border:1px solid #e4d5b5;background:#faf5e9;padding:20px;margin:24px 0;border-radius:12px">
                <strong style="font-size:17px">Canal do lançamento no WhatsApp</strong>
                <p style="font-size:15px;line-height:1.6;color:#5c4a22;margin:8px 0 14px">No canal Solar Sem Limites você recebe primeiro as datas, as condições e o aviso da abertura das vendas.</p>
                <a href="${CANAL_DO_LANCAMENTO}" style="display:inline-block;background:#0f5c45;color:#fff;text-decoration:none;font-weight:bold;padding:13px 20px;border-radius:10px">Seguir o canal no WhatsApp</a>
              </div>
              <p style="font-size:15px;line-height:1.6;color:#52625e">Dúvidas? Fale com a gente no WhatsApp <a href="${WHATSAPP_ATENDIMENTO_LINK}" style="color:#0f5c45;font-weight:bold">${WHATSAPP_ATENDIMENTO}</a>.</p>
              <p style="font-size:13px;line-height:1.6;color:#74817d;margin-top:28px">Você recebeu esta mensagem porque entrou na Lista VIP na página do Hotel Solar.</p>
            </div>
          </div>
        </body>
      </html>`,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startedAt = Date.now();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  res.setHeader('Cache-Control', 'no-store');

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Dados de cadastro inválidos.' });
  }
  const body = req.body as Record<string, unknown>;
  // Campo invisível: só robô preenche.
  if (body.website) return res.status(200).json({ success: true });

  const nome = clean(body.nome, 80).replace(/\s+/g, ' ');
  const email = clean(body.email).toLowerCase();
  const telefone = normalizeBrazilianPhone(body.telefone);
  const convite = clean(body.convite, 40).toUpperCase();
  if (nome.length < 2 || !validEmail(email) || !telefone || body.consent !== true) {
    return res.status(400).json({ error: 'Revise nome, WhatsApp, e-mail e consentimento.' });
  }

  const consentimentoEm = new Date().toISOString();
  let erp: RespostaDoErp;
  try {
    erp = await pedirLinkAoErp({
      nome, telefone, email, consentimentoEm,
      convite: /^[A-Z0-9_-]{4,40}$/.test(convite) ? convite : '',
    });
  } catch {
    console.error(JSON.stringify({ level: 'error', message: 'SSL26 Lista VIP sem resposta do ERP', route: '/api/lista-vip',
      durationMs: Date.now() - startedAt }));
    return res.status(503).json({ error: 'Não conseguimos concluir agora. Tente novamente em instantes.' });
  }

  // Em paralelo com o Brevo: o ManyChat nunca bloqueia nem desfaz a entrada.
  const manychatPromise = salvarNaListaVipDoManyChat({ nome, telefone, link: erp.link });

  // O link já está gravado no ERP. Daqui em diante, uma falha do Brevo não
  // desfaz a entrada: a pessoa vê o link na tela e pode tentar receber de novo.
  let contactStorage = 'skipped';
  let emailDelivery: 'accepted' | 'suppressed' | 'failed' = 'failed';
  // Só fica true depois de confirmar que o e-mail é mesmo desta pessoa.
  let podeMedir = false;
  try {
    // A leitura serve para conferir a identidade (e-mail e telefone) antes de
    // gravar. Ela não bloqueia mais o envio: quem marca o consentimento agora
    // está pedindo para entrar, mesmo que no passado tenha saído, comprado ou
    // estado em atendimento (decisão de Geraldo em 20/10/2026).
    const estado = await readContactState(email, telefone);
    podeMedir = true;
    const listId = Number(process.env.BREVO_LISTA_VIP_LIST_ID || 25);
    const attributes: Record<string, string | boolean> = {
      SSL26_LISTA_VIP_AT: consentimentoEm,
      SSL26_LINK_INDICACAO: erp.link,
      SSL26_CONSENT_AT: consentimentoEm,
      // Consentimento novo desfaz a saída anterior. Comprador, atendimento em
      // pausa e contato de teste continuam marcados como estavam.
      SSL26_OPT_OUT: false,
    };
    if (!estado.phoneMismatch) {
      attributes.FIRSTNAME = nome.split(' ')[0];
      attributes.SMS = telefone;
    }
    if (convite) attributes.SSL26_REFERRAL = convite;
    contactStorage = await saveContact({
      email, attributes, updateEnabled: true, emailBlacklisted: false,
      ...(Number.isInteger(listId) && listId > 0 ? { listIds: [listId] } : {}),
    });
    const mensagem = emailDeBoasVindas(nome.split(' ')[0], erp.link);
    mensagem.to[0].email = email;
    await brevoRequest('/smtp/email', mensagem);
    emailDelivery = 'accepted';
  } catch {
    emailDelivery = 'failed';
  }

  const eventoId = clean(body.eventId, 100);
  let metaCapi = 'skipped';
  if (podeMedir && EVENTO_FORMATO.test(eventoId)) {
    try {
      metaCapi = await notifyMeta({
        eventId: eventoId,
        firstName: nome.split(' ')[0],
        email,
        phone: telefone,
        pageUrl: clean(body.pageUrl, 500),
        source: convite ? 'indicacao' : 'lista_vip',
        cookieHeader: String(req.headers?.cookie || ''),
        clientIp: String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim()
          || String(req.headers?.['x-real-ip'] || '').trim(),
        userAgent: String(req.headers?.['user-agent'] || ''),
        eventTimeMs: Date.now(),
        contentName: 'ssl27_lista_vip',
      });
    } catch {
      metaCapi = 'failed';
    }
  }

  const manychat = await manychatPromise;
  console.log(JSON.stringify({
    level: 'info', message: 'SSL26 Lista VIP', route: '/api/lista-vip', indicacao: erp.indicacao,
    contactStorage, emailDelivery, metaCapi, manychat, durationMs: Date.now() - startedAt,
  }));
  return res.status(200).json({ success: true, link: erp.link, codigo: erp.codigo, emailDelivery });
}
