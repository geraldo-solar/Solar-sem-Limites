import { CustomerData } from "../types";

// Substitui o antigo POST direto para o Google Apps Script
// (services/googleSheetsService.ts), cujo link morreu. Chama a função
// serverless do próprio checkout (api/solar-erp-sync.ts), que repassa o
// pedido para o ERP com o segredo de ingestão guardado no servidor.
export const sendOrderToErp = async (order: CustomerData): Promise<boolean> => {
  try {
    const response = await fetch("/api/solar-erp-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Erro ao sincronizar pedido com o ERP:", errorData);
      return false;
    }

    console.log("Pedido sincronizado com o ERP");
    return true;
  } catch (error) {
    console.error("❌ Erro ao sincronizar pedido com o ERP:", error);
    return false;
  }
};
