import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync, statSync } from 'node:fs';

// Renderiza o componente real, sem abrir navegador, acessar a rede ou gravar bundle.
const { outputFiles } = await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import VideoVendas from './VideoVendas';
      import VendasNovembro from './VendasNovembro';
      export { VIDEO_APRESENTACAO, VIDEO_EXPLICACAO, VIDEOS_DEPOIMENTOS } from './videosVendas';
      export const render = (conteudo, destaque = false) =>
        renderToStaticMarkup(React.createElement(VideoVendas, { conteudo, destaque }));
      export const renderPage = () => renderToStaticMarkup(React.createElement(VendasNovembro));
    `,
    resolveDir: fileURLToPath(new URL('../', import.meta.url)),
    loader: 'tsx',
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
  banner: {
    js: `import { createRequire } from 'node:module'; const require = createRequire(${JSON.stringify(fileURLToPath(new URL('../package.json', import.meta.url)))});`,
  },
  define: {
    'import.meta.env.BASE_URL': '"/solarsemlimites2026/"',
    'process.env.NODE_ENV': '"production"',
  },
});
const { render, renderPage, VIDEO_APRESENTACAO, VIDEO_EXPLICACAO, VIDEOS_DEPOIMENTOS } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);

test('reserva exatamente quatro vídeos com IDs únicos, sem inventar mídia ou compradores', () => {
  const videos = [VIDEO_APRESENTACAO, VIDEO_EXPLICACAO, ...VIDEOS_DEPOIMENTOS];
  assert.equal(videos.length, 4);
  assert.equal(new Set(videos.map(video => video.id)).size, 4);
  // A apresentação foi publicada em 10/10/2026 e a explicação do pacote em 16/11/2026;
  // os dois relatos de clientes seguem reservados.
  for (const video of VIDEOS_DEPOIMENTOS) {
    assert.equal(video.midia, undefined);
    assert.equal(video.formato, 'vertical');
    const html = render(video);
    assert.match(html, /Vídeo em preparação/);
    assert.match(html, /Espaço reservado para vídeo/);
    assert.doesNotMatch(html, /<(video|iframe|button|a)\b/);
    assert.match(html, new RegExp(`aria-labelledby="${video.id}-titulo"`));
    assert.match(html, new RegExp(`aria-describedby="${video.id}-descricao"`));
  }
});

test('explicação aparece antes das opções e preserva apresentação, relatos e condições em texto', () => {
  const html = renderPage();
  assert.equal((html.match(/Espaço reservado para vídeo/g) || []).length, 2);
  const explicacao = html.indexOf('id="video-explicacao-pacote"');
  assert.ok(explicacao > html.indexOf('id="video-apresentacao"'));
  assert.ok(explicacao < html.indexOf('As duas opções'));
  assert.ok(html.indexOf('As duas opções') < html.indexOf('id="video-depoimento-1"'));
  assert.match(html, /5 diárias regulares \+ 1 diária bônus/);
  assert.match(html, /A diária bônus vale em baixa temporada, fora de férias e feriados/);
  assert.match(html, /Até 4 pessoas no apartamento quádruplo/);
  assert.match(html, /Ana Paula/);
});

test('capa real é decorativa, lazy e respeita o caminho de publicação', () => {
  const html = render({ ...VIDEOS_DEPOIMENTOS[0], capa: 'hotel-panoramica-rio.jpg' }, true);
  assert.match(html, /src="\/solarsemlimites2026\/hotel-panoramica-rio.jpg"/);
  assert.match(html, /alt=""/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /aspect-\[9\/16\]/);
  assert.match(html, /sm:grid/);
});

test('vídeo vertical em destaque fica maior, para os textos da tela serem lidos; os demais seguem compactos', () => {
  const destaque = render(VIDEO_EXPLICACAO, true);
  assert.match(destaque, /aspect-\[9\/16\] max-w-\[21rem\]/);
  assert.match(destaque, /sm:grid-cols-\[minmax\(0,24rem\)_minmax\(0,1fr\)\]/);
  assert.doesNotMatch(destaque, /max-w-\[15rem\]/);
  const compacto = render(VIDEOS_DEPOIMENTOS[0]);
  assert.match(compacto, /aspect-\[9\/16\] max-w-\[15rem\]/);
  assert.doesNotMatch(compacto, /max-w-\[21rem\]/);
});

test('mídia aprovada ativa controles, legendas e transcrição, sem autoplay ou download antecipado', () => {
  const html = render({
    ...VIDEO_EXPLICACAO,
    midia: {
      arquivo: 'videos/ssl26/apresentacao.mp4',
      legendas: 'videos/ssl26/apresentacao.vtt',
      transcricao: 'Apresentação de teste.\nSegunda linha.',
    },
  });
  assert.match(html, /<video\b/);
  assert.match(html, /controls=""/);
  assert.match(html, /playsInline=""/);
  assert.match(html, /preload="none"/);
  assert.match(html, /data-video-formato="vertical"/);
  assert.match(html, /<video[^>]*object-contain/);
  assert.doesNotMatch(html, /<video[^>]*object-cover/);
  assert.match(html, /src="\/solarsemlimites2026\/videos\/ssl26\/apresentacao.mp4"/);
  assert.match(html, /<track kind="captions"/);
  assert.match(html, /srcLang="pt-BR"/);
  assert.match(html, /Ler transcrição do vídeo/);
  assert.match(html, /Apresentação de teste./);
  assert.doesNotMatch(html, /autoplay|autoPlay|<iframe|Vídeo em preparação/);
});

test('cada espaço também aceita vídeo horizontal sem esticar ou cortar a reprodução', () => {
  const html = render({
    ...VIDEO_EXPLICACAO,
    formato: 'horizontal',
    midia: { arquivo: 'teste.mp4', legendas: 'teste.vtt', transcricao: 'Vídeo horizontal de teste.' },
  }, true);
  assert.match(html, /data-video-formato="horizontal"/);
  assert.match(html, /aspect-video/);
  assert.match(html, /lg:grid/);
  assert.match(html, /<video[^>]*object-contain/);
  assert.doesNotMatch(html, /aspect-\[9\/16\]|<video[^>]*object-cover/);
});

test('transcrição é texto, não HTML executável', () => {
  const html = render({
    ...VIDEOS_DEPOIMENTOS[0],
    midia: { arquivo: 'teste.mp4', legendas: 'teste.vtt', transcricao: '<script>alert(1)</script>' },
  });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('apresentação do hotel publicada: horizontal, com capa, legendas e transcrição', () => {
  const html = render(VIDEO_APRESENTACAO, true);
  assert.match(html, /data-video-formato="horizontal"/);
  assert.match(html, /aspect-video/);
  assert.match(html, /<video[^>]*preload="none"/);
  assert.match(html, /poster="\/solarsemlimites2026\/videos\/ssl26\/hotel-solar-apresentacao-capa.jpg"/);
  assert.match(html, /src="\/solarsemlimites2026\/videos\/ssl26\/hotel-solar-apresentacao.mp4"/);
  assert.match(html, /src="\/solarsemlimites2026\/videos\/ssl26\/hotel-solar-apresentacao.vtt"/);
  assert.match(html, /Entre o rio, o mangue e o mar de Salinas, fica o Hotel Solar./);
  assert.match(html, /Hotel Solar. Seu tempo merece esse lugar./);
  assert.doesNotMatch(html, /autoplay|autoPlay|Vídeo em preparação|Espaço reservado/);

  const page = renderPage();
  assert.ok(page.indexOf('id="video-apresentacao"') < page.indexOf('id="video-explicacao-pacote"'));
  assert.match(page, /<video[^>]*hotel-solar-apresentacao.mp4/);
});

test('arquivos da apresentação existem em public/ e as legendas acompanham a transcrição', () => {
  const publico = (arquivo) => fileURLToPath(new URL(`../public/${arquivo}`, import.meta.url));
  const { arquivo, legendas, transcricao } = VIDEO_APRESENTACAO.midia;
  for (const caminho of [arquivo, legendas, VIDEO_APRESENTACAO.capa]) {
    assert.ok(existsSync(publico(caminho)), caminho);
  }
  // Leve para a web: o arquivo só é baixado quando a pessoa aperta o play.
  assert.ok(statSync(publico(arquivo)).size < 40 * 1024 * 1024);

  const vtt = readFileSync(publico(legendas), 'utf8');
  assert.match(vtt, /^WEBVTT\n/);
  const tempos = [...vtt.matchAll(/(\d\d):(\d\d):(\d\d\.\d{3}) --> (\d\d):(\d\d):(\d\d\.\d{3})/g)].map((m) => [
    Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]),
    Number(m[4]) * 3600 + Number(m[5]) * 60 + Number(m[6]),
  ]);
  assert.equal(tempos.length, 13);
  let anterior = 0;
  for (const [inicio, fim] of tempos) {
    assert.ok(inicio >= anterior && fim > inicio && fim <= 105.3);
    anterior = fim;
  }
  const textoDasLegendas = vtt
    .split('\n')
    .filter((linha) => linha && !/^(WEBVTT|\d+|.*-->.*)$/.test(linha))
    .join(' ');
  assert.equal(textoDasLegendas, transcricao.split('\n').join(' '));
});

test('explicação do pacote publicada: vertical, com capa, legendas e transcrição', () => {
  const html = render(VIDEO_EXPLICACAO, true);
  assert.match(html, /data-video-formato="vertical"/);
  assert.match(html, /<video[^>]*preload="none"/);
  assert.match(html, /<video[^>]*object-contain/);
  assert.match(html, /poster="\/solarsemlimites2026\/videos\/ssl26\/solar-sem-limites-passo-a-passo-capa.jpg"/);
  assert.match(html, /src="\/solarsemlimites2026\/videos\/ssl26\/solar-sem-limites-passo-a-passo.mp4"/);
  assert.match(html, /src="\/solarsemlimites2026\/videos\/ssl26\/solar-sem-limites-passo-a-passo.vtt"/);
  assert.match(html, /Em dois minutos eu te explico como funciona o Solar Sem Limites./);
  assert.match(html, /Ler transcrição do vídeo/);
  assert.doesNotMatch(html, /autoplay|autoPlay|Vídeo em preparação|Espaço reservado/);

  const page = renderPage();
  assert.match(page, /<video[^>]*solar-sem-limites-passo-a-passo.mp4/);
  assert.ok(page.indexOf('id="video-explicacao-pacote"') < page.indexOf('As duas opções'));
});

test('explicação do pacote diz as regras do lançamento sem promessa proibida', () => {
  const { transcricao } = VIDEO_EXPLICACAO.midia;
  assert.match(transcricao, /fora do Réveillon/);
  assert.match(transcricao, /R\$ 3\.100 no Pix/);
  assert.match(transcricao, /12 × R\$ 284,17, total R\$ 3\.410, com acréscimo de 10%/);
  assert.match(transcricao, /1 bônus na baixa temporada/);
  assert.match(transcricao, /Reservas conforme a disponibilidade/);
  assert.match(transcricao, /tarifas de balcão de 2026/);
  assert.match(transcricao, /\(91\) 98100-0800/);
  assert.match(transcricao, /com os barqueiros da região/);
  assert.doesNotMatch(transcricao, /sem juros|últimas vagas|restam|ilimitad|sorteio|desconto extra|qualquer data|pescadores|98122-9825/i);
});

test('arquivos da explicação existem em public/ e as legendas acompanham a fala da transcrição', () => {
  const publico = (arquivo) => fileURLToPath(new URL(`../public/${arquivo}`, import.meta.url));
  const { arquivo, legendas, transcricao } = VIDEO_EXPLICACAO.midia;
  for (const caminho of [arquivo, legendas, VIDEO_EXPLICACAO.capa]) {
    assert.ok(existsSync(publico(caminho)), caminho);
  }
  // Leve para a web: o arquivo só é baixado quando a pessoa aperta o play.
  assert.ok(statSync(publico(arquivo)).size < 40 * 1024 * 1024);

  const vtt = readFileSync(publico(legendas), 'utf8');
  assert.match(vtt, /^WEBVTT\n/);
  const tempos = [...vtt.matchAll(/(\d\d):(\d\d):(\d\d\.\d{3}) --> (\d\d):(\d\d):(\d\d\.\d{3})/g)].map((m) => [
    Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]),
    Number(m[4]) * 3600 + Number(m[5]) * 60 + Number(m[6]),
  ]);
  assert.equal(tempos.length, 39);
  let anterior = 0;
  for (const [inicio, fim] of tempos) {
    assert.ok(inicio >= anterior && fim > inicio && fim <= 114.3);
    anterior = fim;
  }
  const textoDasLegendas = vtt
    .split('\n')
    .filter((linha) => linha && !/^(WEBVTT|\d+|.*-->.*)$/.test(linha))
    .join(' ');
  // A última linha da transcrição repete os avisos da tela; as legendas trazem só a fala.
  const linhas = transcricao.split('\n');
  assert.match(linhas.at(-1), /^Na tela, ao longo do vídeo: /);
  assert.equal(textoDasLegendas, linhas.slice(0, -1).join(' '));
});
