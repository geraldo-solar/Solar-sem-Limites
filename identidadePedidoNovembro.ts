/** In-memory only. Same payload after a timeout keeps its ID; changing the
 * buyer or price creates a new order instead of rewriting signed evidence. */
export type CampaignOrderIdentity = { id: string; createdAt: string; fingerprint: string };
export function nextCampaignOrder(current: CampaignOrderIdentity | null, order: {
  firstName: string; lastName: string; cpf: string; email: string; phone: string;
  quantity: number; paymentMethod: string; splitPercent?: number;
}, id: () => string = () => crypto.randomUUID(), now: () => string = () => new Date().toISOString()): CampaignOrderIdentity {
  const fingerprint = JSON.stringify([order.firstName.trim(), order.lastName.trim(), order.cpf.replace(/\D/g, ''),
    order.email.trim().toLowerCase(), order.phone.replace(/\D/g, ''), order.quantity, order.paymentMethod,
    order.paymentMethod === 'pix_credit_card' ? order.splitPercent ?? 30 : 0]);
  return current?.fingerprint === fingerprint ? current : { id: id(), createdAt: now(), fingerprint };
}
