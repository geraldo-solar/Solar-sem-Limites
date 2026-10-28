// Contato da Lista VIP no ManyChat (decisão de Geraldo em 28/10/2026).
//
// Quem entra pela página /vip já autorizou receber comunicações por WhatsApp
// no formulário. Até 28/10 a pessoa só entrava no ManyChat se tocasse em
// "Receber no WhatsApp"; agora a própria rota cria (ou acha) o contato e grava:
//   - o WhatsApp, autorizado a receber;
//   - o nome;
//   - a etiqueta SSL26_LISTA_VIP (tira a pessoa das levas de convite da base);
//   - o campo ssl26_link_indicacao (o link pessoal).
// Nenhuma mensagem é enviada aqui.
//
// Sem MANYCHAT_API_KEY, nada acontece ('skipped'). Uma falha do ManyChat nunca
// desfaz a entrada na lista: a rota só registra o resultado no log, sem dados
// pessoais nem a resposta crua do ManyChat.

const MANYCHAT_API = 'https://api.manychat.com/fb/subscriber';
const ETIQUETA = 'SSL26_LISTA_VIP';
const CAMPO_LINK = 'ssl26_link_indicacao';
const FRASE_DE_CONSENTIMENTO =
  'Concordo em entrar na Lista VIP Solar Sem Limites 2027 e receber comunicações do Hotel Solar por e-mail e WhatsApp (hotelsolar.tur.br/vip).';

export type ResultadoManyChat = 'created' | 'updated' | 'skipped' | 'not_found' | 'failed';

class ErroManyChat extends Error {
  constructor(public readonly http: number) { super('MANYCHAT_REQUEST_FAILED'); }
}

async function pedir(chave: string, operacao: string, metodo: 'GET' | 'POST', corpo?: unknown) {
  const resposta = await fetch(`${MANYCHAT_API}/${operacao}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${chave}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    ...(corpo === undefined ? {} : { body: JSON.stringify(corpo) }),
    redirect: 'error',
    signal: AbortSignal.timeout(6000),
  });
  const dados = await resposta.json().catch(() => null) as { status?: string; data?: unknown } | null;
  if (!resposta.ok || dados?.status !== 'success') throw new ErroManyChat(resposta.status);
  return dados.data;
}

function idDoContato(dados: unknown) {
  const item = Array.isArray(dados) ? dados[0] : dados;
  const id = item && typeof item === 'object' ? (item as { id?: unknown }).id : undefined;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : '';
}

export async function salvarNaListaVipDoManyChat(dados: {
  nome: string; telefone: string; link: string;
}): Promise<ResultadoManyChat> {
  const chave = (process.env.MANYCHAT_API_KEY || '').trim();
  if (!chave || /[\r\n]/.test(chave)) return 'skipped';
  const [primeiroNome, ...resto] = dados.nome.split(' ');
  try {
    let resultado: ResultadoManyChat = 'created';
    let id = '';
    try {
      id = idDoContato(await pedir(chave, 'createSubscriber', 'POST', {
        first_name: primeiroNome,
        last_name: resto.join(' '),
        whatsapp_phone: dados.telefone,
        has_opt_in_sms: false,
        has_opt_in_email: false,
        consent_phrase: FRASE_DE_CONSENTIMENTO,
      }));
    } catch (erro) {
      // Contato que já existe no ManyChat (ex-hóspede, por exemplo): o
      // ManyChat recusa a criação, e a gente procura pelo telefone.
      if (!(erro instanceof ErroManyChat) || erro.http >= 500) throw erro;
      resultado = 'updated';
      id = idDoContato(await pedir(chave, `findBySystemField?phone=${encodeURIComponent(dados.telefone)}`, 'GET'));
      if (!id) return 'not_found';
    }
    if (!id) return 'failed';
    await pedir(chave, 'addTagByName', 'POST', { subscriber_id: id, tag_name: ETIQUETA });
    await pedir(chave, 'setCustomFieldByName', 'POST', { subscriber_id: id, field_name: CAMPO_LINK, field_value: dados.link });
    return resultado;
  } catch {
    return 'failed';
  }
}
