import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

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
  for (const video of videos) {
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
  assert.equal((html.match(/Espaço reservado para vídeo/g) || []).length, 4);
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
  const html = render(VIDEO_APRESENTACAO, true);
  assert.match(html, /src="\/solarsemlimites2026\/hotel-panoramica-rio.jpg"/);
  assert.match(html, /alt=""/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /aspect-\[9\/16\]/);
  assert.match(html, /max-w-\[15rem\]/);
  assert.match(html, /sm:grid/);
});

test('mídia aprovada ativa controles, legendas e transcrição, sem autoplay ou download antecipado', () => {
  const html = render({
    ...VIDEO_APRESENTACAO,
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
