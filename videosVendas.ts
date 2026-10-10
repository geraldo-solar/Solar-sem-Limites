import type { VideoVendasConteudo } from './VideoVendas';

// Estrutura aprovada em 30/09/2026: apresentação do hotel, explicação do pacote
// e dois relatos de clientes.
// Não associar os espaços a hóspedes específicos sem aprovação da gravação.
// Para ativar cada player, adicionar midia: { arquivo, legendas, transcricao }.
// MP4 e WebVTT devem ser arquivos aprovados, dentro de public/videos/ssl26/.
// Prioridade para o acervo de Instagram: vertical (9:16). Cada vídeo também
// aceita formato: 'horizontal' (16:9), sem cortar ou esticar a reprodução.
// Apresentação publicada em 10/10/2026 a pedido de Geraldo: versão horizontal
// de 1min45 (output/video-apresentacao-hotel-solar-horizontal-v1), com trilha e
// narração sintética sem custo. Arquivo web em 720p, baixado só no play.
// Autorizações de imagem de terceiros ainda em pedido nessa data; lista em
// output/video-apresentacao-hotel-solar-horizontal-v1/Narracao_e_trilha.md.
export const VIDEO_APRESENTACAO: VideoVendasConteudo = {
  id: 'video-apresentacao',
  categoria: 'Apresentação do Solar',
  formato: 'horizontal',
  titulo: 'O Hotel Solar, de perto',
  descricao: 'O hotel, o rio, o mangue e as praias de Salinas, em 1min45.',
  capa: 'videos/ssl26/hotel-solar-apresentacao-capa.jpg',
  midia: {
    arquivo: 'videos/ssl26/hotel-solar-apresentacao.mp4',
    legendas: 'videos/ssl26/hotel-solar-apresentacao.vtt',
    transcricao: [
      'Entre o rio, o mangue e o mar de Salinas, fica o Hotel Solar.',
      'Aqui, o dia começa sem pressa: um bom descanso e a mesa posta para a família.',
      'Depois, cada um encontra o seu ritmo: piscina, brisa, descanso.',
      'Pelo trapiche, a natureza fica ainda mais perto.',
      'De bicicleta, pela orla. De barco, pelos canais do mangue. Salinas se revela de outro jeito.',
      'Na Ponta do Espadarte, areia branca e mar até onde a vista alcança.',
      'E a revoada dos guarás é uma daquelas cenas que ficam na memória.',
      'Do Atalaia ao farol, cada canto de Salinas guarda uma lembrança diferente.',
      'Para quem já veio, a vontade de voltar. Para quem ainda não conhece, um convite: venha viver Salinas com a sua família.',
      'Hotel Solar. Seu tempo merece esse lugar.',
    ].join('\n'),
  },
};

export const VIDEO_EXPLICACAO: VideoVendasConteudo = {
  id: 'video-explicacao-pacote',
  categoria: 'Entenda o pacote',
  formato: 'vertical',
  titulo: 'O Solar Sem Limites, passo a passo',
  descricao: 'O que está incluído, validade, regras do bônus, formas de pagamento e como reservar conforme a disponibilidade.',
};

export const VIDEOS_DEPOIMENTOS: VideoVendasConteudo[] = [
  {
    id: 'video-depoimento-1',
    categoria: 'Depoimento em vídeo · 01',
    formato: 'vertical',
    titulo: 'A experiência de comprar o pacote',
    descricao: 'Espaço reservado para um relato real de cliente do Solar Sem Limites.',
  },
  {
    id: 'video-depoimento-2',
    categoria: 'Depoimento em vídeo · 02',
    formato: 'vertical',
    titulo: 'A experiência de viver o Solar',
    descricao: 'Espaço reservado para um relato real sobre a reserva e a hospedagem.',
  },
];
