/** Simulação local explícita: nunca autoriza uma compra nem muda o servidor. */
export function permiteTesteManual(dev: boolean, hostname: string, search: string): boolean {
  return dev === true
    && ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
    && new URLSearchParams(search).get('teste_checkout') === '1';
}

export function testeManualCheckoutAtivo(): boolean {
  return typeof window !== 'undefined'
    && permiteTesteManual(import.meta.env.DEV, window.location.hostname, window.location.search);
}

/** Somente escolhe a interface; a ponte local valida a permissão no servidor. */
export function testeRealCheckoutAtivo(): boolean {
  return typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('teste_checkout') === 'real'
    && permiteTesteManual(import.meta.env.DEV, window.location.hostname, '?teste_checkout=1');
}

/** A quantidade do link é uma conveniência; valores inválidos voltam a 1. */
export function quantidadeDoLinkCheckout(hash: string): 1 | 2 {
  return new URLSearchParams(hash.split('?')[1] || '').get('pacotes') === '2' ? 2 : 1;
}

/** O retorno antecipado é exercitado em testes sem chamar o envio real. */
export async function executarCheckoutComTeste<T>(teste: boolean, simular: () => T, enviar: () => Promise<T>): Promise<T> {
  if (teste) return simular();
  return enviar();
}
