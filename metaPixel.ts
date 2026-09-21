// Pixel da Meta.
//
// O ID fica embutido, como o do GA4 em index.html: é público (aparece no
// código-fonte de qualquer site que use Pixel) e precisa ser o MESMO no
// servidor, em api/capture-lead.ts. Se os dois divergirem, a deduplicação para
// de funcionar sem nenhum erro aparente e cada lead passa a contar duas vezes.
// A variável de ambiente existe só para trocar o Pixel sem mexer no código.
//
// O segredo da Conversions API é outro valor e vive só no servidor.
//
// Carrega em todas as rotas, de propósito: o público de retargeting do carrinho
// de 25/11 se forma com quem visitou qualquer página, não só a de captação.

const PIXEL_SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js';

// "Hotel Solar - Site", conjunto de dados do portfólio Hotel Solar Salinópolis
// — o portfólio que a empresa controla por inteiro. Não é o Pixel
// 650309181783271: aquele vive num portfólio de terceiro, sem acesso de
// administrador, o que impedia gerar o token da Conversions API.
const PIXEL_ID_PADRAO = '743518114034395';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

export function initMetaPixel() {
  const pixelId = (import.meta.env.VITE_META_PIXEL_ID || PIXEL_ID_PADRAO).trim();
  if (!pixelId || typeof window === 'undefined' || window.fbq) return;

  // Fila que segura as chamadas até o fbevents.js carregar. É o código base da
  // Meta, escrito por extenso em vez da versão minificada para ficar legível.
  const queue: unknown[][] = [];
  const fbq = (...args: unknown[]) => {
    const instance = fbq as unknown as { callMethod?: (...a: unknown[]) => void };
    if (instance.callMethod) instance.callMethod(...args);
    else queue.push(args);
  };
  Object.assign(fbq, { queue, push: fbq, loaded: true, version: '2.0' });

  window.fbq = fbq;
  window._fbq = window._fbq || fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = PIXEL_SCRIPT_URL;
  document.head.appendChild(script);

  fbq('init', pixelId);
  fbq('track', 'PageView');
}
