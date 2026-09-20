import { CustomerData } from "../types";

export interface ResultadoSincronizacao {
  ok: boolean;
  /** Carrinho fora da janela de venda: o pedido não entrou e não deve ser reenviado. */
  carrinhoFechado?: boolean;
  /** Texto pronto para mostrar ao cliente quando o carrinho está fechado. */
  mensagem?: string;
}

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

    console.log("Pedido sincronizado com o ERP");
    return { ok: true };
  } catch (error) {
    console.error("❌ Erro ao sincronizar pedido com o ERP:", error);
    return { ok: false };
  }
};
