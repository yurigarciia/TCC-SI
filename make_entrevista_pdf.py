from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

VERMELHO = colors.HexColor('#8B1A1A')
CREME = colors.HexColor('#F5F0E8')
CINZA = colors.HexColor('#555555')

doc = SimpleDocTemplate(
    r'e:\TCC\docs\entrevista_cpf_pia_do_sul.pdf',
    pagesize=A4,
    leftMargin=3*cm, rightMargin=2*cm,
    topMargin=2.5*cm, bottomMargin=2.5*cm
)

styles = getSampleStyleSheet()

titulo_style = ParagraphStyle('titulo', parent=styles['Normal'],
    fontSize=15, fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=8)

meta_label_style = ParagraphStyle('meta_label', parent=styles['Normal'],
    fontSize=11, fontName='Helvetica-Bold', spaceBefore=2, spaceAfter=2)

meta_val_style = ParagraphStyle('meta_val', parent=styles['Normal'],
    fontSize=11, fontName='Helvetica', spaceBefore=2, spaceAfter=2)

bloco_style = ParagraphStyle('bloco', parent=styles['Normal'],
    fontSize=12, fontName='Helvetica-Bold', textColor=VERMELHO,
    backColor=CREME, spaceBefore=14, spaceAfter=4, leftIndent=4, rightIndent=4,
    borderPadding=(4,4,4,4))

q_style = ParagraphStyle('q', parent=styles['Normal'],
    fontSize=11, fontName='Helvetica', spaceAfter=6, leftIndent=16,
    firstLineIndent=-16)

note_style = ParagraphStyle('note', parent=styles['Normal'],
    fontSize=10, fontName='Helvetica-Oblique', textColor=CINZA,
    spaceAfter=4, leftIndent=30)

bullet_style = ParagraphStyle('bullet', parent=styles['Normal'],
    fontSize=11, fontName='Helvetica', spaceAfter=5, leftIndent=20,
    firstLineIndent=-12)

story = []

story.append(Paragraph('Roteiro de Entrevista Semiestruturada', titulo_style))
story.append(HRFlowable(width='100%', thickness=1.5, color=VERMELHO, spaceAfter=8))

metas = [
    ('<b>Entidade:</b> CPF Pia do Sul - Santa Maria/RS (13ª RT)', ),
    ('<b>Objetivo:</b> Levantamento de requisitos e validação do MVP do ecossistema digital', ),
    ('<b>Duração estimada:</b> 40-50 minutos', ),
    ('<b>Formato:</b> Semiestruturada — as perguntas são um guia, não um questionário rígido', ),
]
for (text,) in metas:
    story.append(Paragraph(text, ParagraphStyle('m', parent=styles['Normal'], fontSize=11, spaceAfter=2)))

story.append(Spacer(1, 8))

def bloco(title):
    story.append(Paragraph(title, bloco_style))

def q(num, text):
    story.append(Paragraph(f'<b>{num}.</b>  {text}', q_style))

def obs_bullet(text):
    story.append(Paragraph(f'• {text}', bullet_style))

# Bloco 1
bloco('Bloco 1 — Perfil e contexto  (~5 min)')
q(1, 'Quantos associados a entidade possui atualmente? Há distinção entre categorias (sócio pleno, dependente, invernada)?')
q(2, 'Quantas pessoas integram a diretoria/administração? Quem lida com a parte administrativa no dia a dia?')
q(3, 'Qual o volume médio de eventos por ano? (bailes, fandangos, festividades internas)')
q(4, 'Quantas pessoas comparecem em média a um evento? Há variação entre tipos de evento?')
q(5, 'A entidade utiliza algum sistema ou aplicativo atualmente para qualquer parte da gestão? (financeiro, cadastro, comunicação)')

# Bloco 2
bloco('Bloco 2 — Gestão de associados hoje  (~10 min)')
q(1, 'Como é feito hoje o cadastro de um novo associado? Existe algum formulário ou ficha?')
q(2, 'Onde essas informações ficam armazenadas? (planilha, caderno, sistema?)')
q(3, 'Como vocês sabem quais associados estão ativos, inativos ou em dia com as mensalidades?')
q(4, 'O que acontece quando um associado precisa consultar sua situação? Quem responde, como?')
q(5, 'Qual a maior dificuldade nesse processo hoje?')

# Bloco 3
bloco('Bloco 3 — Controle de mensalidades  (~10 min)')
q(1, 'Como é feito o registro de pagamento de mensalidade atualmente?')
q(2, 'Como é identificado quem está inadimplente? Com que frequência isso é verificado?')
q(3, 'Existe algum tipo de cobrança ou notificação para inadimplentes? Como funciona?')
q(4, 'Já houve problemas de informação perdida ou divergente sobre pagamentos?')

# Bloco 4
bloco('Bloco 4 — Gestão de eventos, bailes e fandangos  (~10 min)')
q(1, 'Como funciona a organização de um baile ou fandango do início ao fim? Quem faz o quê?')
q(2, 'Como é feita a reserva de mesas? (presencial, WhatsApp, lista física?)')
q(3, 'Como são vendidos/controlados os ingressos? Há ingresso antecipado?')
q(4, 'Como a entidade sabe quantas mesas/ingressos ainda estão disponíveis em tempo real?')
q(5, 'Como é feito o controle de quem pagou o ingresso na entrada do evento? (lista impressa, carimbo, outro?)')
q(6, 'Os pagamentos são feitos presencialmente, via PIX, transferência? Como é registrado que o pagamento foi recebido?')
q(7, 'Já houve situações de conflito de reserva, mesa dupla vendida ou ingresso sem controle?')
q(8, 'Como é feita a prestação de contas financeira após um evento?')

# Bloco 5
bloco('Bloco 5 — Perfil dos usuários do sistema  (~5 min)')
q(1, 'Quem você imagina usando o painel administrativo no dia a dia? Essa pessoa tem familiaridade com sistemas digitais?')
q(2, 'E os associados — qual faixa etária predomina? Eles usam smartphone com facilidade?')
q(3, 'Há associados que precisariam de ajuda para usar um aplicativo? Como a entidade lida com isso hoje?')

# Bloco 6
bloco('Bloco 6 — Expectativas e prioridades  (~10 min)')
q(1, 'Se você pudesse resolver só um problema com esse sistema, qual seria?')
q(2, 'Das funcionalidades previstas (associados, mensalidades, eventos, reservas, app do associado) — qual você considera mais urgente?')
q(3, 'Tem alguma coisa que não mencionamos mas que seria importante ter?')
q(4, 'Existe alguma preocupação sua em relação à adoção do sistema pela equipe ou pelos associados?')
q(5, 'O que você esperaria ver funcionando no sistema para considerar que foi um sucesso?')

story.append(Spacer(1, 10))
bloco('Observações para condução')
obs_bullet('Solicitar autorização para gravação de áudio antes de iniciar')
obs_bullet('Levar impresso o diagrama de arquitetura ou rascunho de telas para provocar feedback visual')
obs_bullet('O Bloco 6 é o mais estratégico para definição do MVP — não encurtar')
obs_bullet('Anotar exemplos concretos citados (ex.: "isso aconteceu no baile de agosto") — são dados qualitativos valiosos')
obs_bullet('Se surgirem processos não mapeados, explorar com: "Como funciona exatamente? Quem faz? Com qual frequência?"')

doc.build(story)
print('PDF gerado com sucesso')
