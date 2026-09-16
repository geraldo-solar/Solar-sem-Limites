from pathlib import Path

from PIL import Image, ImageOps
from reportlab.lib.colors import HexColor, Color, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUTPUT = ROOT / "output" / "pdf" / "Guia_Salinas_em_Familia_Hotel_Solar.pdf"
CACHE = ROOT / "tmp" / "pdfs" / "guide_assets"

W, H = A4

DEEP = HexColor("#0B332D")
DEEP_2 = HexColor("#08251F")
GREEN = HexColor("#155B4E")
TEAL = HexColor("#2A887B")
GOLD = HexColor("#D7B66C")
CREAM = HexColor("#F7F2E7")
PAPER = HexColor("#FCFAF5")
INK = HexColor("#17352F")
MUTED = HexColor("#617873")
SKY = HexColor("#DCEEF0")
LINE = HexColor("#D8E1DD")


def style(name, size=10, leading=None, color=INK, font="Helvetica", align=TA_LEFT, space=0):
    return ParagraphStyle(
        name=name,
        fontName=font,
        fontSize=size,
        leading=leading or size * 1.35,
        textColor=color,
        alignment=align,
        spaceAfter=space,
        allowWidows=0,
        allowOrphans=0,
    )


BODY = style("body", 10.4, 15, INK)
BODY_MUTED = style("body_muted", 9.6, 14, MUTED)
BODY_WHITE = style("body_white", 10.2, 15, white)
SMALL = style("small", 8.2, 11.5, MUTED)
SMALL_WHITE = style("small_white", 8.2, 11.5, HexColor("#E7F0ED"))
CARD_TITLE = style("card_title", 12, 15, DEEP, "Helvetica-Bold")
CARD_BODY = style("card_body", 9.4, 13.2, MUTED)
DAY_TITLE = style("day_title", 18, 22, DEEP, "Times-Bold")


def optimized_image(image_path):
    image_path = Path(image_path)
    if image_path.suffix.lower() not in {".jpg", ".jpeg"}:
        return image_path
    CACHE.mkdir(parents=True, exist_ok=True)
    cached = CACHE / f"{image_path.stem}-web.jpg"
    if not cached.exists() or cached.stat().st_mtime < image_path.stat().st_mtime:
        with Image.open(image_path) as source:
            img = ImageOps.exif_transpose(source).convert("RGB")
            img.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
            img.save(cached, "JPEG", quality=84, optimize=True, progressive=True)
    return cached


def draw_cover_image(c, image_path, x, y, width, height, focal_y=0.5):
    image_path = optimized_image(image_path)
    with Image.open(image_path) as img:
        iw, ih = img.size
    scale = max(width / iw, height / ih)
    dw, dh = iw * scale, ih * scale
    dx = x + (width - dw) / 2
    overflow = max(0, dh - height)
    dy = y - overflow * focal_y
    c.saveState()
    clip = c.beginPath()
    clip.rect(x, y, width, height)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(str(image_path), dx, dy, dw, dh, mask="auto")
    c.restoreState()


def draw_rounded_image(c, image_path, x, y, width, height, radius=10, focal_y=0.5):
    image_path = optimized_image(image_path)
    with Image.open(image_path) as img:
        iw, ih = img.size
    scale = max(width / iw, height / ih)
    dw, dh = iw * scale, ih * scale
    dx = x + (width - dw) / 2
    overflow = max(0, dh - height)
    dy = y - overflow * focal_y
    c.saveState()
    clip = c.beginPath()
    clip.roundRect(x, y, width, height, radius)
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(str(image_path), dx, dy, dw, dh, mask="auto")
    c.restoreState()


def para(c, text, pstyle, x, top, width, max_height=200):
    p = Paragraph(text, pstyle)
    _, height = p.wrap(width, max_height)
    p.drawOn(c, x, top - height)
    return height


def label(c, text, x, y, width=None, fill=GOLD, color=DEEP):
    c.setFont("Helvetica-Bold", 7.4)
    text_width = stringWidth(text.upper(), "Helvetica-Bold", 7.4)
    box_width = width or text_width + 16
    c.setFillColor(fill)
    c.roundRect(x, y, box_width, 18, 9, stroke=0, fill=1)
    c.setFillColor(color)
    c.drawString(x + 8, y + 5.5, text.upper())
    return box_width


def page_base(c, number, title=None, dark=False):
    c.setFillColor(DEEP_2 if dark else PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    if title:
        c.setFillColor(GOLD if dark else GREEN)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(22 * mm, H - 17 * mm, title.upper())
    c.setStrokeColor(Color(1, 1, 1, 0.14) if dark else LINE)
    c.line(22 * mm, 16 * mm, W - 22 * mm, 16 * mm)
    c.setFillColor(HexColor("#C9D8D3") if dark else MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawString(22 * mm, 9.5 * mm, "HOTEL SOLAR - SALINÓPOLIS, PARÁ")
    c.drawRightString(W - 22 * mm, 9.5 * mm, f"{number:02d}")


def heading(c, eyebrow, title, subtitle=None, top=None, dark=False):
    top = top or H - 32 * mm
    c.setFillColor(GOLD if dark else TEAL)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(22 * mm, top, eyebrow.upper())
    y = top - 8
    title_style = style(
        "heading",
        25,
        28,
        white if dark else DEEP,
        "Times-Bold",
    )
    h = para(c, title, title_style, 22 * mm, y, W - 44 * mm, 100)
    y -= h + 8
    if subtitle:
        substyle = BODY_WHITE if dark else BODY_MUTED
        h2 = para(c, subtitle, substyle, 22 * mm, y, W - 44 * mm, 90)
        y -= h2
    return y


def card(c, x, y, width, height, title, body, accent=TEAL, index=None):
    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, width, height, 12, stroke=1, fill=1)
    c.setFillColor(accent)
    c.roundRect(x, y + height - 7, width, 7, 4, stroke=0, fill=1)
    if index is not None:
        c.setFillColor(accent)
        c.circle(x + 19, y + height - 28, 10, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x + 19, y + height - 31, str(index))
        title_x = x + 36
        title_w = width - 48
    else:
        title_x = x + 15
        title_w = width - 30
    para(c, title, CARD_TITLE, title_x, y + height - 20, title_w, 45)
    para(c, body, CARD_BODY, x + 15, y + height - 53, width - 30, height - 62)


def itinerary_block(c, y, time_label, title, body, accent=TEAL):
    x = 22 * mm
    c.setFillColor(accent)
    c.roundRect(x, y - 4, 28 * mm, 20, 10, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(x + 14 * mm, y + 3, time_label.upper())
    para(c, title, CARD_TITLE, x + 34 * mm, y + 13, W - x - 56 * mm, 28)
    body_h = para(c, body, CARD_BODY, x + 34 * mm, y - 6, W - x - 56 * mm, 55)
    return y - max(53, body_h + 28)


def draw_cover(c):
    draw_cover_image(c, PUBLIC / "hotel-panoramica-rio.jpg", 0, 0, W, H, 0.48)
    c.setFillColor(Color(0.02, 0.12, 0.10, 0.50))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(Color(0.02, 0.12, 0.10, 0.92))
    c.roundRect(18 * mm, 24 * mm, W - 36 * mm, 112 * mm, 18, stroke=0, fill=1)

    logo = PUBLIC / "logoSOLAR2.png"
    c.drawImage(str(logo), 24 * mm, H - 49 * mm, 40 * mm, 18 * mm, preserveAspectRatio=True, mask="auto")
    label(c, "Edição 2026", W - 55 * mm, H - 42 * mm, 32 * mm)

    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(30 * mm, 119 * mm, "UM ROTEIRO PARA VIAJAR NO SEU RITMO")
    para(
        c,
        "Guia Salinas<br/><i>em Família</i>",
        style("cover_title", 35, 38, white, "Times-Bold"),
        30 * mm,
        108 * mm,
        W - 60 * mm,
        100,
    )
    para(
        c,
        "Três dias entre praias, manguezais, sabores paraenses e pausas bem escolhidas.",
        style("cover_sub", 12, 18, HexColor("#E8F1EE")),
        30 * mm,
        59 * mm,
        W - 60 * mm,
        55,
    )
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(30 * mm, 34 * mm, "POR HOTEL SOLAR - DESDE 1973")
    c.showPage()


def draw_page_2(c):
    page_base(c, 2, "Comece por aqui")
    y = heading(
        c,
        "Amazônia Atlântica",
        "Salinas combina mar aberto, mangue e um jeito paraense de desacelerar.",
        "O melhor roteiro não tenta encaixar tudo. Ele alterna praia cedo, descanso no meio do dia e uma boa caminhada no fim da tarde.",
    )
    img_y = y - 72 * mm
    draw_rounded_image(c, PUBLIC / "faq-salinas-colagem.jpg", 22 * mm, img_y, 72 * mm, 66 * mm, 13, 0.12)

    card(c, 102 * mm, img_y + 37 * mm, 86 * mm, 29 * mm, "Praia com personalidade", "Atalaia é a mais movimentada; Farol Velho e Corvina ajudam a variar o ritmo.", TEAL)
    card(c, 102 * mm, img_y + 4 * mm, 86 * mm, 29 * mm, "Cidade para caminhar", "A Orla do Maçarico reúne passeio, restaurantes e fim de tarde.", GOLD)
    card(c, 102 * mm, img_y - 29 * mm, 86 * mm, 29 * mm, "Natureza por perto", "Manguezais, ilhas e passeios de barco revelam outra face do litoral paraense.", GREEN)

    c.setFillColor(DEEP)
    c.roundRect(22 * mm, 27 * mm, W - 44 * mm, 38 * mm, 14, stroke=0, fill=1)
    label(c, "Dica Solar", 29 * mm, 51 * mm, 29 * mm, GOLD, DEEP)
    para(
        c,
        "Planeje a praia pela maré, não apenas pelo relógio. A variação é forte na região e pode mudar rapidamente o espaço de areia disponível. Confirme a tábua de marés e siga a orientação local antes de entrar com veículo na faixa de areia.",
        SMALL_WHITE,
        29 * mm,
        47 * mm,
        W - 58 * mm,
        55,
    )
    c.showPage()


def draw_day_page(c, number, day, title, subtitle, image_name, image_focal, blocks, tip):
    page_base(c, number, f"Roteiro de 3 dias - Dia {day}")
    top_y = heading(c, f"Dia {day}", title, subtitle)
    image_y = top_y - 55 * mm
    draw_rounded_image(c, PUBLIC / image_name, 22 * mm, image_y, W - 44 * mm, 49 * mm, 13, image_focal)
    y = image_y - 12
    for index, (time_label, block_title, body) in enumerate(blocks):
        y = itinerary_block(c, y, time_label, block_title, body, [TEAL, GOLD, GREEN][index % 3])
    c.setFillColor(SKY)
    c.roundRect(22 * mm, 25 * mm, W - 44 * mm, 27 * mm, 12, stroke=0, fill=1)
    label(c, "Leve com você", 29 * mm, 42 * mm, 36 * mm, TEAL, white)
    para(c, tip, SMALL, 29 * mm, 38 * mm, W - 58 * mm, 35)
    c.showPage()


def draw_page_6(c):
    page_base(c, 6, "Viajar bem em família")
    y = heading(
        c,
        "Menos pressa, mais viagem",
        "O ritmo certo faz toda a diferença.",
        "Uma programação simples costuma funcionar melhor: praia cedo, pausa nas horas mais quentes e experiências leves no fim do dia.",
    )

    draw_rounded_image(c, PUBLIC / "hotel-cafe-manha.jpg", 22 * mm, y - 79 * mm, 70 * mm, 70 * mm, 13, 0.55)
    x = 101 * mm
    top = y - 8
    items = [
        ("Comece cedo", "Mais tranquilidade, temperatura amena e tempo para observar a maré."),
        ("Proteja a pausa", "Almoço, banho e descanso evitam que o passeio vire maratona."),
        ("Deixe uma margem", "Clima e maré mudam; tenha sempre uma alternativa curta e próxima."),
        ("Combine um ponto", "Em praias movimentadas, defina onde todos se reencontram."),
    ]
    for idx, (ttl, body) in enumerate(items, 1):
        c.setFillColor([TEAL, GOLD, GREEN, DEEP][idx - 1])
        c.circle(x + 7, top - 4, 7, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(x + 7, top - 6.5, str(idx))
        para(c, ttl, CARD_TITLE, x + 20, top + 6, 76 * mm, 22)
        h = para(c, body, CARD_BODY, x + 20, top - 12, 76 * mm, 42)
        top -= max(44, h + 25)

    c.setFillColor(DEEP)
    c.roundRect(22 * mm, 30 * mm, W - 44 * mm, 43 * mm, 14, stroke=0, fill=1)
    para(c, "Checklist rápido", style("check_title", 15, 18, GOLD, "Helvetica-Bold"), 29 * mm, 66 * mm, 45 * mm, 24)
    checklist = (
        "- Protetor solar, chapéu e água<br/>"
        "- Roupa leve e uma troca seca<br/>"
        "- Tábua de marés salva no celular<br/>"
        "- Contato de operador autorizado para passeios"
    )
    para(c, checklist, SMALL_WHITE, 78 * mm, 66 * mm, 102 * mm, 75)
    c.showPage()


def draw_page_7(c):
    page_base(c, 7, "Sua base em Salinas", dark=True)
    top_y = heading(
        c,
        "Hotel Solar",
        "Perto do movimento. Protegido pela tranquilidade.",
        "Na parte alta da cidade, o Solar fica a cerca de 800 metros da Orla do Maçarico e a aproximadamente 15 minutos da Praia do Atalaia.",
        dark=True,
    )
    draw_rounded_image(c, PUBLIC / "hotel-piscina.jpg", 22 * mm, top_y - 78 * mm, W - 44 * mm, 70 * mm, 13, 0.5)

    y = top_y - 91 * mm
    features = [
        ("Café da manhã", "Buffet incluído nas diárias."),
        ("Recepção 24h", "Apoio durante toda a estadia."),
        ("Estacionamento", "Gratuito e rotativo para hóspedes."),
        ("Wi-Fi", "Disponível nas áreas do hotel."),
    ]
    gap = 4 * mm
    width = (W - 44 * mm - 3 * gap) / 4
    for idx, (ttl, body) in enumerate(features):
        x = 22 * mm + idx * (width + gap)
        c.setFillColor(HexColor("#123D35"))
        c.setStrokeColor(HexColor("#2E5C53"))
        c.roundRect(x, y - 34 * mm, width, 32 * mm, 10, stroke=1, fill=1)
        para(c, ttl, style(f"ft{idx}", 10, 13, GOLD, "Helvetica-Bold", TA_CENTER), x + 5, y - 7, width - 10, 28)
        para(c, body, style(f"fb{idx}", 8.2, 11.2, HexColor("#D7E5E0"), "Helvetica", TA_CENTER), x + 5, y - 23, width - 10, 36)

    c.setFillColor(GOLD)
    c.roundRect(22 * mm, 27 * mm, W - 44 * mm, 35 * mm, 14, stroke=0, fill=1)
    para(c, "Visita guiada ao vivo - 24 de novembro, às 19h", style("event", 15, 19, DEEP, "Helvetica-Bold", TA_CENTER), 30 * mm, 53 * mm, W - 60 * mm, 30)
    para(c, "Conheça os apartamentos, as áreas do hotel e tire suas dúvidas antes da abertura do Solar Sem Limites.", style("event2", 9, 13, DEEP, "Helvetica", TA_CENTER), 30 * mm, 39 * mm, W - 60 * mm, 32)
    c.showPage()


def draw_page_8(c):
    page_base(c, 8, "Planeje com confiança")
    heading(
        c,
        "Antes de sair",
        "Confirme as condições do dia e preserve espaço para o inesperado.",
        "Horários, maré, acesso e disponibilidade de passeios podem mudar. Consulte fontes oficiais e operadores locais antes de cada deslocamento.",
    )

    card(c, 22 * mm, 135 * mm, 79 * mm, 58 * mm, "Contatos do Hotel Solar", "WhatsApp: (91) 98100-0800<br/>E-mail: reserva@hotelsolar.tur.br<br/>Av. Atlântica, s/n - Salinópolis, PA", TEAL)
    card(c, 109 * mm, 135 * mm, 79 * mm, 58 * mm, "Horários de referência", "Check-in: a partir das 14h<br/>Check-out: até 12h<br/>Café da manhã: confirme o horário na recepção.", GOLD)

    c.setFillColor(DEEP)
    c.roundRect(22 * mm, 93 * mm, W - 44 * mm, 31 * mm, 13, stroke=0, fill=1)
    para(c, "Seu guia é o começo. O melhor de Salinas aparece quando a família encontra o próprio ritmo.", style("closing", 15, 19, white, "Times-Bold", TA_CENTER), 31 * mm, 115 * mm, W - 62 * mm, 45)

    para(c, "Fontes consultadas", style("sources_h", 12, 15, DEEP, "Helvetica-Bold"), 22 * mm, 81 * mm, W - 44 * mm, 24)
    sources = (
        "1. Prefeitura de Salinópolis - Turismo e Lazer. salinopolis.pa.gov.br/o-municipio/turismo-e-lazer/<br/>"
        "2. Prefeitura de Salinópolis - História e características das praias. salinopolis.pa.gov.br/o-municipio/historia/<br/>"
        "3. Assembleia Legislativa do Pará - Salinópolis e suas belezas naturais. alepa.pa.gov.br/Comunicacao/Noticia/6521<br/>"
        "4. Hotel Solar - estrutura, localização e serviços. hotelsolar.tur.br<br/>"
        "5. Hotel Solar Reservas - horários e comodidades. reservas.hotelsolar.tur.br/"
    )
    para(c, sources, SMALL, 22 * mm, 73 * mm, W - 44 * mm, 105)
    para(c, "Conteúdo conferido em 16/09/2026. Fotografias: acervo do Hotel Solar.", style("note", 7.8, 10, MUTED, "Helvetica-Oblique"), 22 * mm, 25 * mm, W - 44 * mm, 20)
    c.showPage()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4)
    c.setTitle("Guia Salinas em Família - Hotel Solar")
    c.setAuthor("Hotel Solar")
    c.setSubject("Roteiro de três dias para conhecer Salinópolis em família")

    draw_cover(c)
    draw_page_2(c)
    draw_day_page(
        c,
        3,
        1,
        "Chegue devagar: Orla do Maçarico e Corvina",
        "Um primeiro dia leve ajuda a família a entrar no clima sem correr.",
        "hotel-panoramica-rio.jpg",
        0.48,
        [
            ("Manhã", "Chegada e reconhecimento", "Faça check-in, confirme a maré e organize apenas o essencial para o primeiro passeio."),
            ("Tarde", "Praia da Corvina", "Uma alternativa mais tranquila, sem circulação de veículos na areia e próxima da área urbana."),
            ("Fim de tarde", "Orla do Maçarico", "Caminhe pelo calçadão, observe a mudança de luz e escolha com calma onde jantar."),
        ],
        "Chinelo firme, repelente para o fim de tarde e uma pequena bolsa impermeável deixam o passeio mais simples.",
    )
    draw_day_page(
        c,
        4,
        2,
        "O clássico de Salinas: Atalaia e Farol Velho",
        "Reserve o dia mais aberto do roteiro para as praias mais conhecidas.",
        "faq-salinas-colagem.jpg",
        0.16,
        [
            ("Cedo", "Praia do Atalaia", "Chegue pela manhã, escolha um ponto seguro e acompanhe a movimentação da maré durante toda a permanência."),
            ("Meio do dia", "Pausa protegida", "Almoce sem pressa e evite concentrar toda a programação nas horas mais quentes."),
            ("Tarde", "Farol Velho e dunas", "Explore a paisagem vizinha conforme o acesso e as condições do dia; preserve áreas naturais e siga a sinalização."),
        ],
        "Na Atalaia há circulação de veículos em parte da praia. Redobre a atenção com crianças e nunca deixe o carro em área sujeita à subida da maré.",
    )
    draw_day_page(
        c,
        5,
        3,
        "Manguezais, ilhas e um último mergulho",
        "O terceiro dia mostra a paisagem que existe além da faixa de areia.",
        "hero_hotel_real.jpg",
        0.52,
        [
            ("Manhã", "Passeio de barco", "Consulte operadores locais autorizados para conhecer canais, ilhas e a paisagem de mangue com segurança."),
            ("Tarde", "Piscina e descanso", "Depois do passeio, volte para uma pausa confortável antes de decidir a programação final."),
            ("Fim de tarde", "Despedida sem agenda", "Repita o lugar favorito da família ou faça uma caminhada curta perto do hotel."),
        ],
        "Confirme coletes, lotação, duração e condições meteorológicas antes de embarcar. Para crianças, informe idade e necessidades ao operador.",
    )
    draw_page_6(c)
    draw_page_7(c)
    draw_page_8(c)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build()
