/**
 * Máscara do campo de WhatsApp: (DD) 9XXXX-XXXX.
 *
 * Quem digita o código do país (55) ou é preenchido pelo navegador com +55
 * tinha o 55 lido como DDD, e os dois últimos dígitos eram cortados (28/10/2026).
 * Agora, com mais de 11 dígitos começando por 55, o 55 sai; um 0 de longa
 * distância na frente também sai. O resto segue a máscara de sempre.
 */
export function formatarTelefoneBR(valor: string) {
  let digitos = valor.replace(/\D/g, '');
  if (digitos.length > 11 && digitos.startsWith('55')) digitos = digitos.slice(2);
  if (digitos.length > 10 && digitos.startsWith('0')) digitos = digitos.slice(1);
  digitos = digitos.slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}
