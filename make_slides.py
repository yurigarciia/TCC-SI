from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt

# Cores
AZUL_ESCURO = RGBColor(0x1F, 0x3D, 0x6B)
AZUL_MEDIO  = RGBColor(0x2E, 0x6D, 0xB4)
BRANCO      = RGBColor(0xFF, 0xFF, 0xFF)
CINZA_CLARO = RGBColor(0xF2, 0xF2, 0xF2)
CINZA_TEXTO = RGBColor(0x40, 0x40, 0x40)
VERDE       = RGBColor(0x1A, 0x7A, 0x4A)

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)

blank = prs.slide_layouts[6]  # layout em branco

def add_rect(slide, l, t, w, h, color):
    shape = slide.shapes.add_shape(1, Inches(l), Inches(t), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    return shape

def add_text(slide, text, l, t, w, h, size, bold=False, color=CINZA_TEXTO,
             align=PP_ALIGN.LEFT, wrap=True):
    txb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    txb.word_wrap = wrap
    tf = txb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    return txb

def add_bullet_slide(slide, title, bullets, subtitle=None):
    # Faixa de topo
    add_rect(slide, 0, 0, 13.33, 1.2, AZUL_ESCURO)
    add_text(slide, title, 0.4, 0.15, 12.5, 0.9, 24, bold=True, color=BRANCO)
    if subtitle:
        add_text(slide, subtitle, 0.4, 0.8, 12.5, 0.35, 12, color=RGBColor(0xCC,0xDD,0xFF))
    # Fundo claro
    add_rect(slide, 0, 1.2, 13.33, 6.3, CINZA_CLARO)
    # Bullets
    y = 1.45
    for b in bullets:
        if b.startswith("##"):
            add_text(slide, b[2:].strip(), 0.5, y, 12.3, 0.45, 14, bold=True, color=AZUL_MEDIO)
            y += 0.5
        elif b.startswith("#"):
            add_text(slide, b[1:].strip(), 0.5, y, 12.3, 0.4, 13, bold=True, color=AZUL_ESCURO)
            y += 0.45
        else:
            add_text(slide, "  •  " + b, 0.6, y, 12.1, 0.38, 12, color=CINZA_TEXTO)
            y += 0.42

# ── SLIDE 1: CAPA ───────────────────────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, 13.33, 7.5, AZUL_ESCURO)
add_rect(s, 0, 2.8, 13.33, 2.2, AZUL_MEDIO)
add_text(s, "ANTONIO MENEGHETTI FACULDADE",
         0.5, 0.3, 12.3, 0.6, 14, color=RGBColor(0xCC,0xDD,0xFF), align=PP_ALIGN.CENTER)
add_text(s, "Sistemas de Informação  |  Projeto de TCC",
         0.5, 0.75, 12.3, 0.5, 12, color=RGBColor(0xAA,0xBB,0xDD), align=PP_ALIGN.CENTER)
add_text(s,
    "Desenvolvimento e Avaliação de um\nEcossistema Digital para Gestão de\nAssociados e Eventos em Entidades\nTradicionalistasGaúchas",
    0.5, 2.9, 12.3, 2.0, 22, bold=True, color=BRANCO, align=PP_ALIGN.CENTER)
add_text(s, "Yuri Garcia Baptista", 0.5, 5.3, 12.3, 0.5, 14, color=BRANCO, align=PP_ALIGN.CENTER)
add_text(s, "Orientador: Prof. Dr. Felipe Becker Nunes", 0.5, 5.75, 12.3, 0.4, 12,
         color=RGBColor(0xCC,0xDD,0xFF), align=PP_ALIGN.CENTER)
add_text(s, "Restinga Seca, RS  |  Junho / 2026", 0.5, 6.6, 12.3, 0.4, 11,
         color=RGBColor(0xAA,0xBB,0xDD), align=PP_ALIGN.CENTER)

# ── SLIDE 2: CONTEXTUALIZAÇÃO ───────────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_bullet_slide(s, "Contextualização", [
    "O Movimento Tradicionalista Gaúcho (MTG) reúne +1.700 entidades no RS",
    "Mais de 100 mil eventos por ano; movimentação de R$ 1,5 bi/ano",
    "Associados, invernadas artísticas, bailes e fandangos como eixo central",
    "",
    "## O problema",
    "Gestão ainda realizada com planilhas, fichas físicas e comunicação informal",
    "Retrabalho, inconsistências e baixa rastreabilidade das informações",
    "Gestores voluntários sobrecarregados e alta rotatividade de diretoria",
    "Ausência de soluções tecnológicas integradas para esse contexto específico",
])

# ── SLIDE 3: QUESTÃO E OBJETIVOS ─────────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_bullet_slide(s, "Questão de Pesquisa e Objetivos", [
    "Como um ecossistema digital integrado pode qualificar a gestão de",
    "associados e eventos sociais em entidades tradicionalistas gaúchas?",
    "",
    "## Objetivo Geral",
    "Desenvolver e avaliar um ecossistema digital entidade-associado",
    "",
    "## Objetivos Específicos",
    "a) Identificar requisitos de gestão de associados, mensalidades e eventos",
    "b) Descrever a arquitetura e componentes do ecossistema proposto",
    "c) Implementar as funcionalidades básicas do MVP",
    "d) Avaliar o sistema com usuários reais do CPF Pia do Sul",
])

# ── SLIDE 4: REFERENCIAL TEÓRICO ─────────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_bullet_slide(s, "Fundamentação Teórica", [
    "# Entidades Tradicionalistas e Terceiro Setor",
    "Organizações sem fins lucrativos, gestão voluntária, desafios de sustentabilidade",
    "",
    "# Sistemas de Informação",
    "Suporte à decisão, redução de retrabalho, memória organizacional (Laudon; DeLone)",
    "",
    "# Ecossistemas Digitais e Plataformas Integradas",
    "Integração de múltiplas funcionalidades; relação entidade-associado (Gawer; Jacobides)",
    "",
    "# Transformação Digital em Organizações Culturais",
    "Equilíbrio entre modernização e preservação identitária (Vial; Hinings)",
    "Maturidade digital dos usuários como requisito de projeto",
])

# ── SLIDE 5: METODOLOGIA ─────────────────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_bullet_slide(s, "Metodologia", [
    "Pesquisa aplicada e qualitativa  |  Estudo de caso: CPF Pia do Sul, Santa Maria/RS",
    "",
    "## Três etapas sequenciais",
    "1.  Levantamento de requisitos — entrevistas, análise documental, observação",
    "2.  Desenvolvimento do MVP — abordagem DSDM com priorização MoSCoW",
    "3.  Avaliação com usuários — SUS + entrevistas + observação de cenários",
    "",
    "## Por que DSDM?",
    "Prazo de entrega fixo (defesa do TCC) com escopo variável",
    "Must / Should / Could / Won't — garante entrega do núcleo essencial",
    "",
    "## Participantes da avaliação",
    "6 a 10 pessoas: diretoria, responsáveis por eventos e associados",
])

# ── SLIDE 6: ARQUITETURA ─────────────────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, 13.33, 1.2, AZUL_ESCURO)
add_text(s, "Arquitetura do Ecossistema Digital", 0.4, 0.15, 12.5, 0.9, 24, bold=True, color=BRANCO)
add_rect(s, 0, 1.2, 13.33, 6.3, CINZA_CLARO)

def box(sl, l, t, w, h, bg, txt, txt_size=11, txt_color=BRANCO, bold=True):
    add_rect(sl, l, t, w, h, bg)
    add_text(sl, txt, l+0.05, t+0.05, w-0.1, h-0.1, txt_size, bold=bold,
             color=txt_color, align=PP_ALIGN.CENTER)

# Clientes
box(s, 1.2, 1.45, 3.0, 0.75, AZUL_MEDIO, "Next.js\nPainel Web (Admin)")
box(s, 5.5, 1.45, 3.5, 0.75, AZUL_MEDIO, "React Native + Expo\nApp Mobile (Associado)")

# Seta
add_text(s, "HTTP / REST", 3.1, 1.7, 2.4, 0.3, 10, color=CINZA_TEXTO, align=PP_ALIGN.CENTER)

# API
box(s, 2.5, 2.7, 5.5, 0.7, RGBColor(0xE6,0x7E,0x22), "NestJS – API REST\nControllers / Guards / DTOs")

# Camadas
box(s, 2.5, 3.6, 5.5, 0.65, VERDE, "Camada de Aplicação  –  Use Cases / Ports")
box(s, 2.5, 4.4, 5.5, 0.65, RGBColor(0x14,0x6B,0x3A), "Camada de Domínio  –  Entidades · Regras · Invariantes")

# Infra
box(s, 1.8, 5.45, 2.5, 0.65, RGBColor(0x66,0x66,0x66), "PostgreSQL\nvia TypeORM", txt_size=10)
box(s, 5.3, 5.45, 2.5, 0.65, RGBColor(0x66,0x66,0x66), "Serviços Externos\nGateways de Pagamento", txt_size=10)
add_text(s, "Adapter", 1.8, 6.15, 2.5, 0.3, 9, color=CINZA_TEXTO, align=PP_ALIGN.CENTER)
add_text(s, "Adapter", 5.3, 6.15, 2.5, 0.3, 9, color=CINZA_TEXTO, align=PP_ALIGN.CENTER)

# Setas verticais (texto simulado)
add_text(s, "▼", 5.2, 2.3, 0.4, 0.4, 14, color=CINZA_TEXTO, align=PP_ALIGN.CENTER)
add_text(s, "▼", 5.2, 3.25, 0.4, 0.4, 14, color=CINZA_TEXTO, align=PP_ALIGN.CENTER)
add_text(s, "▼", 5.2, 4.05, 0.4, 0.4, 14, color=CINZA_TEXTO, align=PP_ALIGN.CENTER)

# Stack nota
add_text(s, "TypeScript em todas as camadas  |  JWT + RBAC  |  API REST documentada via Swagger",
         0.4, 6.85, 12.5, 0.45, 10, color=AZUL_MEDIO, align=PP_ALIGN.CENTER)

# ── SLIDE 7: STACK TECNOLÓGICA ───────────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_bullet_slide(s, "Stack Tecnológica", [
    "## Backend",
    "NestJS (Node.js + TypeScript)  —  arquitetura modular, injeção de dependências",
    "PostgreSQL + TypeORM  —  persistência relacional, migrations versionadas",
    "JWT + RBAC  —  autenticação e controle de acesso por perfil",
    "",
    "## Frontend Web (Admin)",
    "Next.js  —  SSR/SSG, roteamento por sistema de arquivos",
    "React Query + Tailwind CSS + shadcn/ui",
    "",
    "## Mobile (Associado)",
    "React Native + Expo  —  Android e iOS a partir de uma base TypeScript única",
    "",
    "TypeScript unificado em todas as camadas: compartilhamento de tipos e contratos",
])

# ── SLIDE 8: REQUISITOS ───────────────────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_bullet_slide(s, "Requisitos Funcionais (MoSCoW)", [
    "## Must Have — núcleo do MVP",
    "Cadastro, edição e controle de status de associados",
    "Registro e histórico de mensalidades",
    "Cadastro de eventos (bailes/fandangos) e configuração de mesas/ingressos",
    "Reserva de mesa e compra de ingresso (fluxo administrativo mediado)",
    "App mobile: autenticação, dados cadastrais, reservas e eventos",
    "",
    "## Should Have",
    "Relatório de inadimplência  |  Disponibilidade de mesas em tempo real",
    "Comprovante de pagamento  |  API documentada via Swagger",
    "",
    "## Won't Have (neste trabalho)",
    "Integração com CIT/MTG  |  Rodeios artísticos  |  Pagamento direto no app",
])

# ── SLIDE 9: RESULTADOS ESPERADOS ────────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_bullet_slide(s, "Resultados Esperados", [
    "## Entregas do MVP",
    "Painel web administrativo (Next.js): associados, mensalidades, eventos, reservas",
    "App mobile do associado (React Native): dados, mensalidades, eventos",
    "API REST (NestJS + PostgreSQL): casos de uso, auth JWT, Swagger",
    "",
    "## Critérios de sucesso da avaliação",
    "Redução do retrabalho administrativo vs. fluxo atual (planilhas/físico)",
    "Facilidade de uso e clareza das interfaces (SUS + entrevistas)",
    "Rapidez para consultar mensalidades e realizar reservas",
    "Aceitação pelos usuários da entidade — incluindo perfis com menor maturidade digital",
    "",
    "## Contribuição acadêmica",
    "Demonstrar que digitalização e preservação cultural coexistem",
])

# ── SLIDE 10: CRONOGRAMA ──────────────────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, 13.33, 1.2, AZUL_ESCURO)
add_text(s, "Cronograma — TCC 2026/2", 0.4, 0.15, 12.5, 0.9, 24, bold=True, color=BRANCO)
add_rect(s, 0, 1.2, 13.33, 6.3, CINZA_CLARO)

meses  = ["Jul", "Ago", "Set", "Out", "Nov"]
ativs = [
    ("Levantamento de requisitos (CPF Pia do Sul)", [1,0,0,0,0]),
    ("Modelagem do banco de dados",                 [1,0,0,0,0]),
    ("Setup do ambiente (repositório, CI)",          [1,0,0,0,0]),
    ("Dev: módulo Associados + Mensalidades",        [1,1,0,0,0]),
    ("Dev: módulo Eventos + Reservas + Ingressos",   [0,1,1,0,0]),
    ("Dev: app mobile do associado",                 [0,0,1,0,0]),
    ("Integração e testes funcionais",               [0,0,1,1,0]),
    ("Avaliação com usuários (SUS + entrevistas)",   [0,0,0,1,0]),
    ("Análise dos resultados e ajustes",             [0,0,0,1,0]),
    ("Escrita da monografia",                        [1,1,1,1,1]),
    ("Revisão final e entrega",                      [0,0,0,0,1]),
]

col_w = 1.3
row_h = 0.44
x0, y0 = 0.3, 1.35

# Cabeçalho meses
for i, m in enumerate(meses):
    add_rect(s, x0 + 5.5 + i*col_w, y0, col_w - 0.05, 0.38, AZUL_MEDIO)
    add_text(s, m, x0 + 5.5 + i*col_w, y0, col_w - 0.05, 0.38, 11,
             bold=True, color=BRANCO, align=PP_ALIGN.CENTER)

for r, (ativ, marks) in enumerate(ativs):
    yy = y0 + 0.42 + r * row_h
    bg = BRANCO if r % 2 == 0 else CINZA_CLARO
    add_rect(s, x0, yy, 5.45, row_h - 0.04, bg)
    add_text(s, ativ, x0 + 0.05, yy + 0.04, 5.3, row_h - 0.08, 9.5,
             color=CINZA_TEXTO)
    for i, m in enumerate(marks):
        cell_bg = bg
        add_rect(s, x0 + 5.5 + i*col_w, yy, col_w - 0.05, row_h - 0.04, cell_bg)
        if m:
            add_rect(s, x0 + 5.5 + i*col_w + 0.1, yy + 0.08,
                     col_w - 0.25, row_h - 0.2, AZUL_MEDIO)

# ── SLIDE 11: CONSIDERAÇÕES FINAIS ───────────────────────────────────────────
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, 13.33, 7.5, AZUL_ESCURO)
add_rect(s, 0, 2.2, 13.33, 3.0, AZUL_MEDIO)
add_text(s, "Considerações Finais", 0.5, 0.4, 12.3, 0.8, 28, bold=True,
         color=BRANCO, align=PP_ALIGN.CENTER)
pontos = [
    "Proposta aplicada com parceria real: CPF Pia do Sul, Santa Maria/RS",
    "Arquitetura sólida (Hexagonal + Clean Architecture) com stack moderna",
    "Metodologia estruturada em 3 etapas claras — requisitos, MVP, avaliação",
    "Inovação tecnológica e preservação cultural como elementos complementares",
]
for i, p in enumerate(pontos):
    add_text(s, "•  " + p, 1.0, 2.35 + i * 0.68, 11.3, 0.6, 13,
             color=BRANCO, align=PP_ALIGN.LEFT)
add_text(s, "Obrigado!", 0.5, 5.6, 12.3, 0.8, 32, bold=True,
         color=BRANCO, align=PP_ALIGN.CENTER)
add_text(s, "Yuri Garcia Baptista  |  yurigamergarcia@gmail.com",
         0.5, 6.5, 12.3, 0.5, 12, color=RGBColor(0xCC,0xDD,0xFF), align=PP_ALIGN.CENTER)

prs.save(r"e:\TCC\docs\apresentacao.pptx")
print("OK — 11 slides gerados")
