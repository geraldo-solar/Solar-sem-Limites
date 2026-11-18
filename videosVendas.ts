import type { VideoVendasConteudo } from './VideoVendas';

// Estrutura aprovada em 30/09/2026: apresentação do hotel, explicação do pacote
// e dois relatos de clientes.
// Não associar os espaços a hóspedes específicos sem aprovação da gravação.
// Para ativar cada player, adicionar midia: { arquivo, legendas, transcricao }.
// MP4 e WebVTT devem ser arquivos aprovados, dentro de public/videos/ssl26/.
// Prioridade para o acervo de Instagram: vertical (9:16). Cada vídeo também
// aceita formato: 'horizontal' (16:9), sem cortar ou esticar a reprodução.
// Apresentação publicada em 10/10/2026 a pedido de Geraldo, em versão horizontal
// (output/video-apresentacao-hotel-solar-horizontal-v1), com trilha e narração
// sintética sem custo. Em 16/11/2026, também a pedido dele, passou a ser a versão
// vertical de 1min47, com as imagens de drone novas e a mesma narração e legenda
// (output/video-apresentacao-hotel-solar-vertical-2026-11-16). A horizontal saiu
// da página. Arquivo web em 720 × 1280, baixado só no play. Geraldo informou em
// 16/11 que tem as autorizações das imagens de terceiros creditadas no vídeo.
// A capa antiga (hotel-solar-apresentacao-capa.jpg) continua no fundo da Lista VIP.
export const VIDEO_APRESENTACAO: VideoVendasConteudo = {
  id: 'video-apresentacao',
  categoria: 'Apresentação do Solar',
  formato: 'vertical',
  titulo: 'O Hotel Solar, de perto',
  descricao: 'O hotel, o rio, o mangue e as praias de Salinas, em 1min47.',
  capa: 'videos/ssl26/hotel-solar-de-perto-vertical-capa.jpg',
  midia: {
    arquivo: 'videos/ssl26/hotel-solar-de-perto-vertical.mp4',
    legendas: 'videos/ssl26/hotel-solar-de-perto-vertical.vtt',
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

// Explicação do pacote publicada em 16/11/2026, com aprovação de Geraldo: gravação
// de 12/11 (Geraldo em câmera), vertical, 1min54. Arquivo web em 720 × 1280,
// baixado só no play. As legendas trazem a fala; a última linha da transcrição
// ("Na tela, ao longo do vídeo: ...") repete os avisos que aparecem na imagem.
// Montagem e fontes: output/video-venda-ssl27-2026-11-16.

export const VIDEO_EXPLICACAO: VideoVendasConteudo = {
  id: 'video-explicacao-pacote',
  categoria: 'Entenda o pacote',
  formato: 'vertical',
  titulo: 'O Solar Sem Limites, passo a passo',
  descricao: 'O que está incluído, validade, regras do bônus, formas de pagamento e como reservar conforme a disponibilidade.',
  capa: 'videos/ssl26/solar-sem-limites-passo-a-passo-capa.jpg',
  midia: {
    arquivo: 'videos/ssl26/solar-sem-limites-passo-a-passo.mp4',
    legendas: 'videos/ssl26/solar-sem-limites-passo-a-passo.vtt',
    transcricao: [
      'Em dois minutos eu te explico como funciona o Solar Sem Limites. Eu sou o Geraldo, do Hotel Solar, em Salinópolis. Recebemos famílias aqui desde 1973. Sabe aquela viagem com a família que fica sempre para depois? E, quando você decide, paga a diária do dia e tudo de uma vez. O Solar Sem Limites é para isso: você garante o preço agora, divide se quiser, e vem quando der.',
      'Cada pacote tem 5 diárias, mais uma diária bônus, num apartamento quádruplo para até 4 pessoas. E já vem com café da manhã, bicicletas e o passeio de barco pelos manguezais do Rio Arapepó, com os barqueiros da região, até a praia Ponta do Espadarte.',
      'Um pacote sai por R$ 3.100 no Pix. São cinco diárias que você pode usar até em julho e nos feriados, fora do Réveillon. E cada uma sai por R$ 620. Comparando com o balcão deste ano de 2026, no fim de semana mais procurado de julho, 67% a menos. No feriado de setembro, 46% a menos. No final de semana comum, 23% a menos. E ainda vem o passeio de barco e a diária bônus.',
      'Vai vir mais vezes? Dois pacotes, 12 diárias e 2 anos para usar, por R$ 6.200. Dá para pagar no Pix ou em até 12 vezes no cartão.',
      'E você não corre risco. Desistiu em até 30 dias da compra, devolvemos 100%. E, se não puder vir, o pacote pode ser transferido para outra pessoa.',
      'Para usar, é só pedir sua data pelo nosso WhatsApp de reservas. E venha com quem você gosta, tá? Cada pessoa que comprar pelo seu link, até 1º de dezembro, te dá uma diária extra.',
      'As vendas vão até 1º de dezembro, às 11h59 da noite. Escolha a sua opção aqui embaixo. Dúvida? Me chama no WhatsApp.',
      'Na tela, ao longo do vídeo: 5 diárias regulares fora do Réveillon + 1 bônus na baixa temporada. Validade de 1 ano (2 anos com 2 pacotes). Reservas conforme a disponibilidade. Comparação por diária com as tarifas de balcão de 2026, apartamento quádruplo com café (julho R$ 1.906, 7 de Setembro R$ 1.150, fim de semana R$ 810; no pacote, R$ 620 por diária regular); tarifas de 2027 ainda não publicadas. Cartão em até 12 vezes: 12 × R$ 284,17, total R$ 3.410, com acréscimo de 10%, que não é devolvido em caso de desistência. Indicação: diária de baixa temporada, se você também comprar até 01/12; até 5 por CPF. Reservas pelo WhatsApp (91) 98100-0800 ou reserva@hotelsolar.tur.br. Regulamento na página.',
    ].join('\n'),
  },
};

// Depoimento 01 publicado em 16/11/2026, com aprovação de Geraldo: Samara Chaar, cliente do
// Solar Sem Limites, gravado em 15/11 e enviado pelo álbum compartilhado do Wanderson. Geraldo
// informou em 16/11 que tem a autorização dela para uso em anúncios, posts e na página.
// Em 16/11 a fala foi publicada inteira, só sem a contagem antes de começar, com aviso na tela nos
// dois trechos que não batem com o regulamento. Em 18/11, a pedido de Geraldo, saiu o trecho em que
// ela diz que não é preciso se programar e que é só chegar ao hotel com a hospedagem garantida
// ("Então adquirir o pacote... a tua hospedagem garantida."), porque toda reserva depende de vaga
// na data pedida (item 8). Com ele saiu o aviso "Reservas conforme a disponibilidade". O resto da
// fala continua igual e na mesma ordem. Fica o aviso "Praia em frente ao hotel, de acesso público.".
// Versão da página: sem legenda queimada (a legenda vem do .vtt) e com a cartela "Regulamento
// na página". Montagem e fontes: output/depoimento-samara-chaar-2026-11-16.
export const VIDEOS_DEPOIMENTOS: VideoVendasConteudo[] = [
  {
    id: 'video-depoimento-1',
    categoria: 'Depoimento em vídeo · 01',
    formato: 'vertical',
    titulo: 'Samara Chaar, cliente do Solar Sem Limites',
    descricao: 'Por que comprar o pacote foi uma das melhores decisões da família, em 1 minuto.',
    capa: 'videos/ssl26/depoimento-samara-chaar-capa.jpg',
    midia: {
      arquivo: 'videos/ssl26/depoimento-samara-chaar.mp4',
      legendas: 'videos/ssl26/depoimento-samara-chaar.vtt',
      transcricao: [
        'Olá, eu sou Samara Chaar, sou advogada. E a gente vem aqui pra dizer que a gente ama o Hotel Solar e ama Salinas. Ter adquirido o pacote Hotel Solar Sem Limites foi uma das melhores decisões que eu e meu marido tomamos.',
        'Até porque o hotel tem uma estrutura completa, pra você, pra sua família. O hotel tem vários restaurantes, tem piscina, tem jacuzzi e até a capelinha.',
        'Então a gente pode contar, principalmente com a estrutura que o hotel dá através do Reserva Solar, que é o restaurante que ele tem, à beira do mar, que te entrega um pôr do sol inesquecível.',
        'E o principal, você e sua família terão uma praia particular, aonde você fica com a tua família de forma segura e com aquela vista incrível pra praia do Espadarte.',
        'Então vir pra Salinas e ficar no Hotel Solar é certeza que você vai encontrar um ambiente familiar e se sentir em casa.',
        'Na tela, ao longo do vídeo: Depoimento de cliente: “Uma das melhores decisões”. Samara Chaar, cliente do Solar Sem Limites. Praia em frente ao hotel, de acesso público. Regulamento na página.',
      ].join('\n'),
    },
  },
  {
    id: 'video-depoimento-2',
    categoria: 'Depoimento em vídeo · 02',
    formato: 'vertical',
    titulo: 'A experiência de viver o Solar',
    descricao: 'Espaço reservado para um relato real sobre a reserva e a hospedagem.',
  },
];
