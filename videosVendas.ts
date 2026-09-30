import type { VideoVendasConteudo } from './VideoVendas';

// Estrutura aprovada em 30/09/2026: apresentação do hotel, explicação do pacote
// e dois relatos de clientes.
// Não associar os espaços a hóspedes específicos sem aprovação da gravação.
// Para ativar cada player, adicionar midia: { arquivo, legendas, transcricao }.
// MP4 e WebVTT devem ser arquivos aprovados, dentro de public/videos/ssl26/.
// Prioridade para o acervo de Instagram: vertical (9:16). Cada vídeo também
// aceita formato: 'horizontal' (16:9), sem cortar ou esticar a reprodução.
export const VIDEO_APRESENTACAO: VideoVendasConteudo = {
  id: 'video-apresentacao',
  categoria: 'Apresentação do Solar',
  formato: 'vertical',
  titulo: 'O Hotel Solar, de perto',
  descricao: 'Um espaço para conhecer os ambientes, as experiências e a história do Hotel Solar.',
  capa: 'hotel-panoramica-rio.jpg',
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
