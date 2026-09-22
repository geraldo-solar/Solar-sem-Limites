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
export const sendOrderToErp = async (order: CustomerData): Promise<ResultadoSincronizacao> => {
  try {
    const response = await fetch("/api/solar-erp-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Erro ao sincronizar pedido com o ERP:", errorData);

      const detalhe = errorData?.error;
      if (detalhe?.carrinhoFechado) {
        return { ok: false, carrinhoFechado: true, mensagem: detalhe.error };
      }
      return { ok: false };
    }

    const dados = await response.json().catch(() => ({}));
    const url = typeof dados?.checkoutUrl === "string" && PAGINA_DA_CIELO.test(dados.checkoutUrl)
      ? dados.checkoutUrl : null;
    return { ok: true, checkoutUrl: url, pagamentoIndisponivel: dados?.pagamentoIndisponivel === true };
  } catch (error) {
    console.error("❌ Erro ao sincronizar pedido com o ERP:", error);
    return { ok: false };
  }
};
