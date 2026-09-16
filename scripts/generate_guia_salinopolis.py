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


def fitted_para(c, text, pstyle, x, top, width, max_height):
    """Keep the closing pages' text inside its allocated layout area."""
    p = Paragraph(text, pstyle)
    _, height = p.wrap(width, max_height)
    if height > max_height:
        raise ValueError(f"Text exceeds its layout area: {text}")
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


def proximity_card(c, x, y, width, height, distance, title, body, accent=TEAL):
    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, width, height, 12, stroke=1, fill=1)
    label(c, distance, x + 14, y + height - 28, fill=accent, color=white)
    para(c, title, CARD_TITLE, x + 14, y + height - 37, width - 28, 28)
    para(c, body, CARD_BODY, x + 14, y + height - 60, width - 28, height - 68)


def itinerary_block(c, top, time_label, title, body, accent=TEAL):
    x = 22 * mm
    width = W - 44 * mm
    height = 18 * mm
    y = top - height

    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, width, height, 10, stroke=1, fill=1)

    pill_width = 28 * mm
    pill_height = 20
    pill_x = x + 5 * mm
    pill_y = y + (height - pill_height) / 2
    c.setFillColor(accent)
    c.roundRect(pill_x, pill_y, pill_width, pill_height, 10, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(pill_x + pill_width / 2, pill_y + 6, time_label.upper())

    text_x = x + 39 * mm
    text_width = width - 44 * mm
    para(c, title, CARD_TITLE, text_x, top - 6, text_width, 22)
    para(c, body, CARD_BODY, text_x, top - 25, text_width, 32)
    return y - 2 * mm


def draw_cover(c):
    draw_cover_image(c, PUBLIC / "blog-atalaia.webp", 0, 0, W, H, 0.50)
    c.setFillColor(Color(0.02, 0.12, 0.10, 0.38))
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
        "Três dias saindo do Hotel Solar: primeiro o que está ao redor, depois os clássicos de Salinas.",
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
        "Menos deslocamento, mais experiência",
        "Três dias em círculos: comece pelo Hotel Solar.",
        "A ordem deste guia parte do que está no hotel, avança para o entorno imediato e deixa o maior deslocamento para o último dia.",
    )
    img_y = y - 53 * mm
    draw_rounded_image(c, PUBLIC / "hotel-panoramica-rio.jpg", 22 * mm, img_y, W - 44 * mm, 48 * mm, 13, 0.45)
    para(c, "Hotel, trapiche, mangue e restaurante formam uma mesma base de viagem.", SMALL, 24 * mm, img_y - 5, W - 48 * mm, 20)

    gap = 5 * mm
    card_w = (W - 44 * mm - gap) / 2
    card_h = 35 * mm
    row_1 = img_y - 45 * mm
    row_2 = row_1 - card_h - 5 * mm
    proximity_card(c, 22 * mm, row_1, card_w, card_h, "No hotel", "Praia do Solar", "Aparece conforme a maré baixa, com acesso pelo trapiche e clima de refúgio.", TEAL)
    proximity_card(c, 22 * mm + card_w + gap, row_1, card_w, card_h, "800 m", "Orla do Maçarico", "Boa para caminhar ou pedalar, jantar e sentir a brisa no fim da tarde.", GOLD)
    proximity_card(c, 22 * mm, row_2, card_w, card_h, "Do trapiche", "Arapepó e Espadarte", "O passeio de barco pode começar no próprio hotel, sempre conforme maré e operação.", GREEN)
    proximity_card(c, 22 * mm + card_w + gap, row_2, card_w, card_h, "15 min", "Atalaia e Farol Velho", "Os clássicos ficam para o dia de carro, com mais atenção à maré e ao movimento.", DEEP)

    c.setFillColor(DEEP)
    c.roundRect(22 * mm, 25 * mm, W - 44 * mm, 34 * mm, 14, stroke=0, fill=1)
    label(c, "Ordem inteligente", 29 * mm, 47 * mm, 38 * mm, GOLD, DEEP)
    para(
        c,
        "Use a maré como relógio do roteiro. Se a Praia do Solar surgir em outro horário, troque os blocos de lugar: o objetivo é reduzir idas e vindas sem perder as melhores condições do dia.",
        SMALL_WHITE,
        29 * mm,
        43 * mm,
        W - 58 * mm,
        45,
    )
    c.showPage()


def draw_day_page(c, number, day, title, subtitle, proximity, image_name, image_focal, blocks, why, tip):
    page_base(c, number, f"Roteiro de 3 dias - Dia {day}")
    top_y = heading(c, f"Dia {day}", title, subtitle)
    label(c, proximity, 22 * mm, top_y - 20, fill=GOLD, color=DEEP)
    image_y = top_y - 61 * mm
    draw_rounded_image(c, PUBLIC / image_name, 22 * mm, image_y, W - 44 * mm, 47 * mm, 13, image_focal)
    y = image_y - 3 * mm
    for index, (time_label, block_title, body) in enumerate(blocks):
        y = itinerary_block(c, y, time_label, block_title, body, [TEAL, GOLD, GREEN][index % 3])

    callout_gap = 4 * mm
    callout_h = 28 * mm
    callout_top = y - 3 * mm
    why_y = callout_top - callout_h
    tip_y = why_y - callout_gap - callout_h
    callout_w = W - 44 * mm

    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.roundRect(22 * mm, why_y, callout_w, callout_h, 12, stroke=1, fill=1)
    label(c, "Por que funciona", 29 * mm, why_y + callout_h - 25, 35 * mm, DEEP, white)
    para(c, why, SMALL, 29 * mm, why_y + callout_h - 34, callout_w - 14 * mm, 45)

    c.setFillColor(SKY)
    c.roundRect(22 * mm, tip_y, callout_w, callout_h, 12, stroke=0, fill=1)
    label(c, "Antes de sair", 29 * mm, tip_y + callout_h - 25, 34 * mm, TEAL, white)
    para(c, tip, SMALL, 29 * mm, tip_y + callout_h - 34, callout_w - 14 * mm, 45)
    c.showPage()


def draw_page_6(c):
    page_base(c, 6, "Viajar bem em família")
    y = heading(
        c,
        "Maré, família e plano B",
        "O roteiro funciona melhor quando pode mudar.",
        "Em Salinas, a maré altera praia, embarque e faixa de areia. Confirme as condições do dia e use o hotel como base para ajustar o programa sem transformar a viagem em corrida.",
    )

    image_y = y - 60 * mm
    draw_rounded_image(c, PUBLIC / "hotel-cafe-manha.jpg", 22 * mm, image_y, W - 44 * mm, 52 * mm, 13, 0.55)

    items = [
        ("Confirme na recepção", "Cheque maré, clima e saída do barco antes de organizar o restante do dia."),
        ("Use o Solar como plano B", "Piscina, hidromassagem e uma refeição tranquila protegem o ritmo da família."),
        ("Vá ao Maçarico sem carro", "A curta distância permite caminhar ou usar as bicicletas do hotel."),
        ("Reserve energia para Atalaia", "É o trecho mais distante e movimentado; vá cedo e combine um ponto de encontro."),
    ]

    gap = 5 * mm
    card_w = (W - 44 * mm - gap) / 2
    card_h = 36 * mm
    grid_top = image_y - 6 * mm
    accents = [TEAL, GOLD, GREEN, DEEP]
    for idx, (ttl, body) in enumerate(items, 1):
        row = (idx - 1) // 2
        col = (idx - 1) % 2
        x = 22 * mm + col * (card_w + gap)
        card_y = grid_top - card_h - row * (card_h + gap)
        card(c, x, card_y, card_w, card_h, ttl, body, accents[idx - 1], idx)

    c.setFillColor(DEEP)
    c.roundRect(22 * mm, 25 * mm, W - 44 * mm, 45 * mm, 14, stroke=0, fill=1)
    para(c, "Checklist rápido", style("check_title", 15, 18, GOLD, "Helvetica-Bold"), 29 * mm, 63 * mm, 48 * mm, 24)
    checklist = (
        "- Protetor solar, chapéu e água<br/>"
        "- Repelente e uma troca seca<br/>"
        "- Tábua de marés salva no celular<br/>"
        "- Coletes e operador confirmados antes do embarque"
    )
    para(c, checklist, SMALL_WHITE, 80 * mm, 63 * mm, 100 * mm, 75)
    c.showPage()


def draw_page_7(c):
    page_base(c, 7, "Sua base em Salinas", dark=True)
    top_y = heading(
        c,
        "Hotel Solar",
        "Mais do que hospedagem: o ponto de partida do roteiro.",
        "A Praia do Solar aparece diante do hotel na maré baixa, o passeio de barco pode sair do trapiche, o Maçarico fica a cerca de 800 metros e o Atalaia a aproximadamente 15 minutos de carro.",
        dark=True,
    )
    image_h = 76 * mm
    image_y = top_y - 7 * mm - image_h
    draw_rounded_image(c, PUBLIC / "hotel-piscina.jpg", 22 * mm, image_y, W - 44 * mm, image_h, 13, 0.2)

    features = [
        ("Praia do Solar", "Acesso conforme a maré baixa."),
        ("Trapiche", "Ponto de saída para o passeio."),
        ("Maçarico", "Cerca de 800 m do hotel."),
        ("Atalaia", "Aproximadamente 15 min."),
    ]
    gap = 5 * mm
    width = (W - 44 * mm - gap) / 2
    feature_h = 25 * mm
    grid_top = image_y - 6 * mm
    for idx, (ttl, body) in enumerate(features):
        row, col = divmod(idx, 2)
        x = 22 * mm + col * (width + gap)
        feature_top = grid_top - row * (feature_h + gap)
        c.setFillColor(HexColor("#123D35"))
        c.setStrokeColor(HexColor("#2E5C53"))
        c.roundRect(x, feature_top - feature_h, width, feature_h, 10, stroke=1, fill=1)
        fitted_para(c, ttl, style(f"ft{idx}", 12, 15, GOLD, "Helvetica-Bold"), x + 6 * mm, feature_top - 5 * mm, width - 12 * mm, 18)
        fitted_para(c, body, style(f"fb{idx}", 9.6, 13.2, HexColor("#D7E5E0")), x + 6 * mm, feature_top - 13 * mm, width - 12 * mm, 28)

    event_top = grid_top - 2 * feature_h - gap - 7 * mm
    event_h = 45 * mm
    event_y = event_top - event_h
    assert event_y >= 24 * mm, "Page 7 content overlaps its footer"
    c.setFillColor(GOLD)
    c.roundRect(22 * mm, event_y, W - 44 * mm, event_h, 14, stroke=0, fill=1)
    c.setStrokeColor(HexColor("#B69650"))
    c.line(69 * mm, event_y + 8 * mm, 69 * mm, event_top - 8 * mm)
    fitted_para(c, "24 NOV", style("event_date", 21, 26, DEEP, "Helvetica-Bold", TA_CENTER), 28 * mm, event_top - 11 * mm, 35 * mm, 28)
    fitted_para(c, "2026 · às 19h", style("event_time", 9.5, 13, DEEP, "Helvetica", TA_CENTER), 28 * mm, event_top - 22 * mm, 35 * mm, 15)
    fitted_para(c, "Visita guiada ao vivo", style("event", 15, 19, DEEP, "Helvetica-Bold"), 77 * mm, event_top - 8 * mm, W - 107 * mm, 24)
    fitted_para(c, "Conheça os apartamentos, as áreas do hotel e tire suas dúvidas antes da abertura do Solar Sem Limites.", style("event2", 9.8, 14, DEEP), 77 * mm, event_top - 18 * mm, W - 107 * mm, 60)
    c.showPage()


def draw_page_8(c):
    page_base(c, 8, "Planeje com confiança")
    top_y = heading(
        c,
        "Antes de sair",
        "Confirme as condições do dia e preserve espaço para o inesperado.",
        "Horários, maré, acesso e disponibilidade de passeios podem mudar. Consulte fontes oficiais e operadores locais antes de cada deslocamento.",
    )

    gap = 5 * mm
    card_w = (W - 44 * mm - gap) / 2
    card_h = 64 * mm
    cards_top = top_y - 8 * mm
    cards_y = cards_top - card_h
    groups = [
        ("Contatos do Hotel Solar", TEAL, [
            ("WhatsApp", '<link href="https://wa.me/5591981000800" color="#155B4E"><u>(91) 98100-0800</u></link>'),
            ("E-mail", '<link href="mailto:reserva@hotelsolar.tur.br" color="#155B4E"><u>reserva@hotelsolar.tur.br</u></link>'),
            ("Endereço", "Av. Atlântica, s/n<br/>Salinópolis, PA"),
        ]),
        ("Horários de referência", GOLD, [
            ("Check-in", "A partir das 14h"),
            ("Check-out", "Até 12h"),
            ("Café da manhã", "Confirme o horário na recepção."),
        ]),
    ]
    for idx, (title, accent, fields) in enumerate(groups):
        x = 22 * mm + idx * (card_w + gap)
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.roundRect(x, cards_y, card_w, card_h, 12, stroke=1, fill=1)
        c.setFillColor(accent)
        c.roundRect(x + 6 * mm, cards_top - 6 * mm, 12 * mm, 3, 1.5, stroke=0, fill=1)
        fitted_para(c, title, style(f"contact_title{idx}", 11.8, 15, DEEP, "Helvetica-Bold"), x + 6 * mm, cards_top - 9 * mm, card_w - 12 * mm, 18)
        field_top = cards_top - 20 * mm
        for field_idx, (field_label, value) in enumerate(fields):
            field_y = field_top - field_idx * 12.5 * mm
            fitted_para(c, field_label.upper(), style("contact_label", 7.1, 9, MUTED, "Helvetica-Bold"), x + 6 * mm, field_y, card_w - 12 * mm, 10)
            fitted_para(c, value, style("contact_value", 9.6, 12.5, INK), x + 6 * mm, field_y - 11, card_w - 12 * mm, 26)

    quote_top = cards_y - 7 * mm
    quote_h = 28 * mm
    quote_y = quote_top - quote_h
    c.setFillColor(DEEP)
    c.roundRect(22 * mm, quote_y, W - 44 * mm, quote_h, 13, stroke=0, fill=1)
    fitted_para(c, "Seu guia é o começo. O melhor de Salinas aparece quando a família encontra o próprio ritmo.", style("closing", 15, 19, white, "Times-Bold", TA_CENTER), 31 * mm, quote_top - (quote_h - 38) / 2, W - 62 * mm, 40)

    sources_top = quote_y - 7 * mm
    sources_h = 85 * mm
    sources_y = sources_top - sources_h
    assert sources_y >= 24 * mm, "Page 8 content overlaps its footer"
    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.roundRect(22 * mm, sources_y, W - 44 * mm, sources_h, 12, stroke=1, fill=1)
    fitted_para(c, "Fontes consultadas", style("sources_h", 12, 15, DEEP, "Helvetica-Bold"), 28 * mm, sources_top - 6 * mm, W - 56 * mm, 18)
    sources = [
        ("Blog do Hotel Solar · O que fazer em Salinópolis em 3 dias", "hotelsolar.tur.br/dicas-salinopolis.html", "https://www.hotelsolar.tur.br/dicas-salinopolis.html"),
        ("Blog do Hotel Solar · As melhores praias de Salinópolis", "hotelsolar.tur.br/melhores-praias-salinopolis.html", "https://www.hotelsolar.tur.br/melhores-praias-salinopolis.html"),
        ("Prefeitura de Salinópolis · Turismo e lazer", "salinopolis.pa.gov.br/o-municipio/turismo-e-lazer/", "https://salinopolis.pa.gov.br/o-municipio/turismo-e-lazer/"),
        ("Hotel Solar · Estrutura, localização e serviços", "hotelsolar.tur.br", "https://www.hotelsolar.tur.br/"),
        ("Hotel Solar Reservas · Horários e comodidades", "reservas.hotelsolar.tur.br", "https://reservas.hotelsolar.tur.br/"),
    ]
    row_top = sources_top - 16 * mm
    for idx, (title, display_url, url) in enumerate(sources):
        y = row_top - idx * 10 * mm
        c.setFillColor(SKY)
        c.circle(31 * mm, y - 8, 8, stroke=0, fill=1)
        c.setFillColor(DEEP)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(31 * mm, y - 10.4, str(idx + 1))
        fitted_para(c, title, style("source_title", 8.8, 11.5, INK, "Helvetica-Bold"), 37 * mm, y, W - 65 * mm, 12)
        fitted_para(c, f'<link href="{url}" color="#155B4E"><u>{display_url}</u></link>', style("source_link", 8.2, 11, GREEN), 37 * mm, y - 12, W - 65 * mm, 12)

    note_top = sources_y + 14 * mm
    c.setStrokeColor(LINE)
    c.line(28 * mm, note_top + 3 * mm, W - 28 * mm, note_top + 3 * mm)
    fitted_para(c, "Conteúdo conferido em 16/09/2026. Fotografias: acervo do Hotel Solar; imagem do Atalaia: Agência Pará, reproduzida no blog.", style("note", 7.8, 10, MUTED, "Helvetica-Oblique"), 28 * mm, note_top, W - 56 * mm, 22)
    c.showPage()


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4)
    c.setTitle("Guia Salinas em Família - Hotel Solar")
    c.setAuthor("Hotel Solar")
    c.setSubject("Roteiro de três dias em Salinópolis com o Hotel Solar como base")

    draw_cover(c)
    draw_page_2(c)
    draw_day_page(
        c,
        3,
        1,
        "Comece pelo entorno do Solar",
        "Praia, descanso e noite agradável com pouco ou nenhum deslocamento.",
        "NO HOTEL + 800 M",
        "blog-praia-solar.png",
        0.5,
        [
            ("Chegada", "Check-in e leitura da maré", "Peça na recepção o melhor horário para a Praia do Solar e organize o dia a partir dele."),
            ("No hotel", "Praia do Solar ou piscina", "Na maré baixa, desça pelo trapiche; fora dela, aproveite a piscina e descanse da viagem."),
            ("Fim de tarde", "Maçarico a cerca de 800 m", "Vá caminhando ou de bicicleta para sentir a brisa e conhecer a orla revitalizada."),
            ("Noite", "Passarelas, sabores e artesanato", "Jante na orla, tome um sorvete regional e volte ao hotel sem pressa."),
        ],
        "O primeiro dia cria familiaridade com o hotel e a vizinhança, sem gastar energia em grandes deslocamentos.",
        "Confirme a maré antes de descer ao trapiche. Para caminhar ao Maçarico, leve repelente, água e calçado confortável.",
    )
    draw_day_page(
        c,
        4,
        2,
        "Saia de barco do próprio hotel",
        "Mangue, Rio Arapepó e Ponta do Espadarte com retorno à mesma base.",
        "EMBARQUE NO TRAPICHE",
        "blog-espadarte.png",
        0.46,
        [
            ("Antes", "Confirme maré e operador", "Horário, rota e duração dependem das condições do dia. Reserve e confirme antes de embarcar."),
            ("Manhã", "Rio Arapepó e manguezais", "Observe a paisagem amazônica pelo caminho, com colete e orientação do operador."),
            ("Praia", "Ponta do Espadarte", "Aproveite areia firme, banho de mar e caminhada em um trecho mais preservado."),
            ("Retorno", "Reserva Solar e pôr do sol", "Almoce no restaurante do hotel, descanse e procure a revoada dos guarás no fim da tarde."),
        ],
        "A experiência mais especial do destino começa e termina no Hotel Solar, reduzindo deslocamentos por terra.",
        "Confirme coletes, lotação, duração e condições meteorológicas. Informe previamente a idade das crianças e necessidades de mobilidade.",
    )
    draw_day_page(
        c,
        5,
        3,
        "Atalaia e Farol Velho por último",
        "Depois de conhecer o entorno, dedique um dia aos clássicos mais distantes.",
        "CERCA DE 15 MIN DE CARRO",
        "blog-atalaia.webp",
        0.5,
        [
            ("Cedo", "Chegue antes do maior movimento", "Escolha um ponto seguro no Atalaia e acompanhe a subida da maré desde o início."),
            ("Almoço", "Sabores pé na areia", "Prove peixes, caranguejo ou pratiqueira nas barracas estruturadas; se beber, não dirija."),
            ("Tarde", "Farol Velho em ritmo de família", "Busque o trecho mais tranquilo e, na maré baixa, observe a formação de piscinas naturais."),
            ("Volta", "Piscina e despedida no Solar", "Retorne para banho, descanso e um último momento no lugar preferido da família."),
        ],
        "Concentrar as duas praias no mesmo dia evita cruzar a cidade várias vezes e preserva os dias iniciais para experiências próximas.",
        "Na Atalaia circulam veículos sobre a areia. Redobre a atenção com crianças e nunca estacione em área alcançada pela maré.",
    )
    draw_page_6(c)
    draw_page_7(c)
    draw_page_8(c)
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    build()
