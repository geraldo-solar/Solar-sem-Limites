import { CustomerData } from "../types";

export interface ResultadoSincronizacao {
  ok: boolean;
  /** Carrinho fora da janela de venda: o pedido não entrou e não deve ser reenviado. */
  carrinhoFechado?: boolean;
  /** Texto pronto para mostrar ao cliente quando o carrinho está fechado. */
  mensagem?: string;
  /** Página de pagamento na Cielo, quando o cartão é pago lá. */
  checkoutUrl?: string | null;
  /** O pedido entrou, mas a Cielo não abriu a página de pagamento agora. */
  pagamentoIndisponivel?: boolean;
}

// Só endereço da própria Cielo: é para lá que o cliente vai digitar o cartão.
const PAGINA_DA_CIELO = /^https:\/\/cieloecommerce\.cielo\.com\.br\//;

// Substitui o antigo POST direto para o Google Apps Script
// (services/googleSheetsService.ts), cujo link morreu. Chama a função
// serverless do próprio checkout (api/solar-erp-sync.ts), que repassa o
// pedido para o ERP com o segredo de ingestão guardado no servidor.
//
// Devolve o motivo, e não só true/false, porque carrinho fechado não é falha
// de conexão: mandar o cliente "tentar de novo" nesse caso é errado.
export const sendOrderToErp = async (order: CustomerData, campaign?: 'ssl26_novembro_2026', testeLocal?: { token: string }): Promise<ResultadoSincronizacao> => {
  try {
    const response = await fetch(testeLocal ? '/api/ssl26-teste-real' : campaign === 'ssl26_novembro_2026' ? "/api/ssl26-checkout" : "/api/solar-erp-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(testeLocal ? { 'x-ssl26-teste-local': testeLocal.token } : {}) },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      const detalhe = errorData?.error;
      if (detalhe?.carrinhoFechado) {
        return { ok: false, carrinhoFechado: true, mensagem: detalhe.error };
      }
      return { ok: false, mensagem: testeLocal && typeof detalhe === 'string' ? detalhe : undefined };
    }

    const dados = await response.json().catch(() => ({}));
    const url = typeof dados?.checkoutUrl === "string" && PAGINA_DA_CIELO.test(dados.checkoutUrl)
      ? dados.checkoutUrl : null;
    return { ok: dados?.success === true, checkoutUrl: url, pagamentoIndisponivel: dados?.pagamentoIndisponivel === true };
  } catch (error) {
    console.error("❌ Erro ao sincronizar pedido com o ERP:", error);
    return { ok: false };
  }
};
