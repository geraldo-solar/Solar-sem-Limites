// Código de indicação que viaja do link até o pedido.
//
// O comprador aprovado recebe um link individual (criativo A8):
//   hotelsolar.tur.br/solarsemlimites2026?ref=CODIGO
//
// O código precisa sobreviver a duas travessias: da página de vendas para o
// checkout, e de um recarregamento no meio do preenchimento. Por isso fica em
// sessionStorage, e não em estado de componente ou variável de módulo.
//
// sessionStorage e não localStorage de propósito: o código pertence a esta
// visita. Guardado em localStorage, um link clicado em março ainda estaria
// creditando alguém numa compra de novembro, sem que o comprador soubesse.
//
// Isto aqui só registra. Nenhum crédito é concedido por este arquivo: quem
// credita é o ERP, e só depois do pagamento aprovado.

const CHAVE = 'ssl26_indicacao';

// Códigos são opacos e curtos. O CPF nunca entra na URL — é dado pessoal, e
// seria enumerável por quem quisesse varrer links.
const FORMATO_VALIDO = /^[A-Za-z0-9_-]{4,40}$/;

function parametroRef(url: string): string {
  try {
    const endereco = new URL(url);
    const daQuery = endereco.searchParams.get('ref');
    if (daQuery) return daQuery;
    // A página também atende em rota por hash (#/vendas), e o link pode chegar
    // com o parâmetro depois do '#'.
    const marcador = endereco.hash.indexOf('?');
    if (marcador === -1) return '';
    return new URLSearchParams(endereco.hash.slice(marcador + 1)).get('ref') || '';
  } catch {
    return '';
  }
}

/**
 * Lê o código do endereço atual e guarda para o resto da visita.
 * Chamar ao abrir a página de vendas. Devolve o código em vigor, se houver.
 */
export function registrarIndicacaoDaUrl(url: string = window.location.href): string {
  const daUrl = parametroRef(url).trim();
  if (daUrl && FORMATO_VALIDO.test(daUrl)) {
    try {
      window.sessionStorage.setItem(CHAVE, daUrl);
    } catch {
      // Navegador com armazenamento bloqueado: a visita segue normal, só não
      // carrega a indicação. Perder o crédito é melhor que quebrar a compra.
    }
    return daUrl;
  }
  return indicacaoDaVisita();
}

/** Código guardado nesta visita, ou string vazia. */
export function indicacaoDaVisita(): string {
  try {
    const guardado = window.sessionStorage.getItem(CHAVE) || '';
    return FORMATO_VALIDO.test(guardado) ? guardado : '';
  } catch {
    return '';
  }
}
