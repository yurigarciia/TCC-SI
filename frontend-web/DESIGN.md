---
name: Querência ERP — Painel Administrativo
description: Painel web claro e sóbrio para a diretoria de entidades tradicionalistas gaúchas administrar associados, mensalidades e eventos.
colors:
  pergaminho: "#faf7f1"
  grafite-couro: "#2b241d"
  branco-campo: "#ffffff"
  verde-bandeira: "#2e5e3e"
  pergaminho-sobre-verde: "#fdf8f3"
  couro-claro: "#e4d3b8"
  areia: "#f1eae0"
  vermelho-alerta: "#b3261e"
  prata-ambar: "#b7791f"
  prata-pilcha: "#c9cdd3"
  couro-linha: "#ddd0bc"
  vinho-lenco-foco: "#a85c68"
  sidebar-verde-escuro: "#295538"
  sidebar-ceu-login: "#e9c98f"
  sidebar-colina-hover: "#4f7147"
typography:
  display:
    fontFamily: "Fraunces, ui-serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4.8px"
  md: "6.4px"
  lg: "8px"
  xl: "11.2px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.verde-bandeira}"
    textColor: "{colors.pergaminho-sobre-verde}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
  button-primary-hover:
    backgroundColor: "{colors.verde-bandeira}"
  button-outline:
    backgroundColor: "{colors.pergaminho}"
    textColor: "{colors.grafite-couro}"
    rounded: "{rounded.lg}"
  badge-success:
    backgroundColor: "{colors.verde-bandeira}"
    textColor: "{colors.verde-bandeira}"
    rounded: "{rounded.pill}"
  badge-warning:
    backgroundColor: "{colors.prata-ambar}"
    textColor: "{colors.prata-ambar}"
    rounded: "{rounded.pill}"
  badge-destructive:
    backgroundColor: "{colors.vermelho-alerta}"
    textColor: "{colors.vermelho-alerta}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.branco-campo}"
    textColor: "{colors.grafite-couro}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "{colors.branco-campo}"
    textColor: "{colors.grafite-couro}"
    rounded: "{rounded.lg}"
    height: "32px"
---

# Design System: Querência ERP — Painel Administrativo

## Overview

**Creative North Star: "O Lenço Dobrado na Gaveta"**

A identidade tradicionalista gaúcha está presente, mas guardada — não ostentada. O painel é, antes
de tudo, um lugar de trabalho sério para uma diretoria que majoritariamente tem menor familiaridade
digital: a base é clara, neutra e silenciosa (pergaminho sobre branco-campo), e a cor só aparece
quando tem um trabalho semântico específico a fazer — marcar a ação principal de uma tela, sinalizar
um status, destacar um item de navegação ativo. Nada de fundo saturado, nada de "tema campeiro"
espalhado pela interface; a referência gaúcha aparece guardada em detalhe, como um lenço dobrado numa
gaveta: ali, reconhecível, pronto pra ser usado, mas nunca no centro da cena.

O verde-bandeira é hoje a cor de ação do sistema (botões primários, badges "em dia", navegação
ativa) — o vinho tradicional, que o design system original cunhou como cor primária, recuou para um
único uso decorativo quase sussurrado (o padrão de roseta a 4% de opacidade em `.bg-roseta`). Essa é
uma leitura deliberada do estado atual do código, não um erro a corrigir: o vinho continua fazendo
parte do vocabulário da marca, só que como textura de fundo, não como cor de ação.

A sidebar escura é a única quebra dessa base clara — de propósito, não por engano. É "couro de
galpão" conceitualmente, mas foi implementada em verde-bandeira escuro: a âncora visual mais forte do
painel, onde moram a marca, a conta autenticada e a navegação.

**Key Characteristics:**
- Base quase inteiramente clara e neutra; cor é sempre acento, nunca bloco de fundo.
- Verde-bandeira é a única cor de ação — nunca compete com outra cor no mesmo elemento.
- Elevação tátil (cards com sombra perceptível + anel sutil), não um visual "flat" frio.
- Uma única superfície escura (a sidebar), nunca um dark mode do app inteiro.
- Status nunca é só cor — sempre badge com texto.

## Colors

Paleta predominantemente clara e neutra, com um único acento de ação (verde-bandeira) e um vocabulário
de apoio terroso (couro/areia/prata) que nunca compete por atenção.

### Primary
- **Verde-bandeira** (`#2e5e3e`): cor de ação do sistema — botões primários (`variant="default"`),
  links ativos, badge de status "em dia", item de navegação selecionado na sidebar. Reservada a uma
  única ação por tela; nunca aparece ao lado do vermelho-alerta competindo pela mesma hierarquia.

### Neutral
- **Pergaminho** (`#faf7f1`): fundo geral da aplicação — a base sobre a qual tudo se apoia.
- **Grafite-couro** (`#2b241d`): texto principal sobre qualquer fundo claro.
- **Branco-campo** (`#ffffff`): fundo de cards, popovers e inputs — sempre um nível mais claro que o
  pergaminho ao redor, pra criar separação de superfície sem precisar de borda forte.
- **Areia** (`#f1eae0`): fundo neutro secundário — linha alternada de tabela, cabeçalho de tabela
  (a 60% de opacidade) e rodapé de paginação.
- **Couro claro** (`#e4d3b8`): hover de item de lista/tabela — mais quente que a areia da zebra, de
  propósito, pra não se confundir com ela.
- **Couro-linha** (`#ddd0bc`): toda borda de input, card e divisor.
- **Prata-pilcha** (`#c9cdd3`): detalhe decorativo discreto (ícone inativo, divisor secundário).

### Semantic
- **Vermelho-alerta** (`#b3261e`): ações e estados destrutivos — texto/ícone sobre fundo
  `destructive/10`, nunca bloco vermelho sólido fora de badge.
- **Prata-âmbar** (`#b7791f`): estado de atenção/pendência — mesmo tratamento tonal do vermelho.
- **Vinho-lenço, 60% (`#a85c68`)**: exclusivamente o anel de foco de teclado — o único lugar onde o
  vinho tradicional ainda tem um papel funcional ativo, fora da roseta decorativa.

### Sidebar (superfície escura isolada)
- **Verde-sidebar** (`#295538`): fundo da única superfície escura do painel.
- **Céu-do-login** (`#e9c98f`): item de navegação ativo e anel de foco sobre fundo escuro — dourado
  quente, para não repetir o verde do próprio fundo.
- **Colina-hover** (`#4f7147`): hover de item de navegação sobre a sidebar.

### Named Rules
**The One Action Rule.** Cada tela ou seção tem exatamente uma ação primária em verde-bandeira
(`variant="default"`); toda ação concorrente usa `outline` ou `secondary`.

**The Whisper Wine Rule.** O vinho tradicional nunca volta como bloco de cor nem como botão — ele só
existe sussurrado: o padrão de roseta a 4% de opacidade no fundo de certos cards, e o anel de foco de
teclado.

**The Status-Is-Never-Only-Color Rule.** Todo badge semântico leva texto (“Em dia”, “Pendente”,
“Inadimplente”) — a cor reforça, nunca é o único canal de leitura.

## Typography

**Display Font:** Fraunces (com fallback ui-serif, Georgia, serif)
**Body Font:** Inter (com fallback ui-sans-serif, system-ui, sans-serif)

**Character:** Um corpo de texto neutro e altamente legível (Inter, a mesma família padrão do
shadcn/ui) carrega toda a densidade de tabelas e formulários; a serifada Fraunces aparece só nos
poucos pontos de entrada institucional (login, título do painel) — o único momento em que a
tipografia "assume" o tom tradicional, sem nunca comprometer a legibilidade da UI densa.

### Hierarchy
- **Display** (peso 500, `text-2xl`/`text-3xl`, Fraunces): título de tela de entrada (login, nome
  institucional) — nunca em UI densa.
- **Title** (peso 500, `text-base`/16px, Inter `font-heading` sobre o corpo): título de card
  (`CardTitle`).
- **Body** (peso 400, `text-sm`/14px a `text-base`/16px, Inter): corpo de tabela, formulário,
  descrição — nunca abaixo de 14px em texto lido pelo usuário final.
- **Label** (peso 500, `text-xs`/12px, Inter): rótulo de badge, legenda de campo.

### Named Rules
**The 14px Floor Rule.** Nenhum texto lido pelo usuário final fica abaixo de 14px — o público de
referência inclui pessoas idosas e diretoria com menor familiaridade digital.

## Layout

Densidade moderada sobre uma base de espaçamento Tailwind padrão (múltiplos de 4px), sem escala
customizada. A largura de conteúdo é decidida por página, nunca herdada de um container global fixo
— `AppShell` deixa `<main>` ocupar 100% da largura disponível de propósito:

- Página de **lista** (tabela, grid de cards): sem `max-w`, 100% do `<main>`.
- Página de **formulário simples** (poucos campos): `mx-auto w-full max-w-lg`.
- Página de **formulário/detalhe** em cards empilhados numa coluna: `mx-auto w-full max-w-3xl`.
- Página com **tabela densa, canvas de croqui, ou formulário em duas colunas**: `mx-auto w-full
  max-w-5xl` — a partir do breakpoint `lg`, duas seções relacionadas ficam lado a lado
  (`grid gap-6 lg:grid-cols-2 lg:items-start`) em vez de empilhar tudo numa coluna só em monitores
  grandes; abaixo de `lg` volta a empilhar.

A navegação é uma sidebar fixa (colapsável, mostrando só avatar+ícone de saída quando colapsada); no
mobile ela se torna um `Sheet` (drawer) acionado por um header claro, replicando o mesmo fundo escuro
e rodapé de conta — nunca uma versão visualmente diferente da sidebar completa.

### Named Rules
**The Matching Skeleton Rule.** O estado de carregamento (`Skeleton`) de uma página sempre usa a
mesma largura de container do conteúdo real — um mismatch entre os dois causa um "pulo" de layout
visível ao carregar.

## Elevation & Depth

Tátil e acolhedora, não flat: cards e diálogos levam uma sombra perceptível (`shadow-md`) somada a um
anel sutil (`ring-1 ring-foreground/10`) que funciona como uma borda suave de profundidade — a
combinação dá presença sem pesar visualmente sobre o fundo claro. Campos de formulário recebem um
tratamento mais discreto (`shadow-xs`), proporcional ao próprio tamanho do elemento. A sidebar escura
não usa sombra; sua separação vem só do contraste de cor com o resto do painel claro.

### Shadow Vocabulary
- **Card/Dialog** (`shadow-md` + `ring-1 ring-foreground/10`): todo card, painel e modal.
- **Input/Campo** (`shadow-xs`): inputs, selects, textareas — dá contraste quando o campo está direto
  sobre o `background`, e profundidade sutil quando já está dentro de um card branco.
- **Tabela** (`shadow-sm` + `border` + `rounded-lg`): o container em volta de `<Table>`, para a
  tabela nunca se confundir com o `background` pergaminho por trás.

### Named Rules
**The Never-Loose Table Rule.** Uma tabela nunca fica "solta" contra o fundo da página — o container
em volta sempre leva `bg-card` + `shadow-sm` + `border` + `rounded-lg`.

## Shapes

Cantos moderadamente arredondados em toda a interface (`--radius: 8px` como base, escalada para
`sm`/`md`/`lg`/`xl` por `calc()`) — transmite acolhimento sem parecer infantil. Badges usam um raio
de pílula total (`rounded-4xl`), nunca o mesmo raio moderado dos cards/botões, para ficarem
visualmente distintos como "etiqueta", não como "bloco".

## Components

### Buttons
- **Shape:** `rounded-lg` (8px).
- **Primary (`default`):** fundo `verde-bandeira`, texto `pergaminho-sobre-verde`; hover escurece
  levemente a opacidade do próprio fundo (`bg-primary/80`). Reservado a uma única ação por tela.
- **Outline:** fundo transparente sobre `background`, borda `border`; hover vai para `muted`.
- **Secondary:** fundo `secondary` (hoje também verde-bandeira); hover mistura 5% de `foreground`.
- **Destructive:** nunca bloco vermelho sólido — fundo `destructive/10`, texto `destructive`; hover
  intensifica pra `destructive/20`.
- **Ghost / Link:** sem fundo; ghost usa hover em `muted`, link sublinha ao hover com cor `primary`.

### Badges
- **Style:** `rounded-4xl` (pílula), fundo tonal a 10% da cor semântica + texto na cor sólida
  (nunca bloco sólido com texto branco).
- **Variantes semânticas:** `success` (em dia), `warning` (pendente), `destructive`
  (inadimplente/cancelado), `secondary` (rascunho/neutro) — sempre acompanhadas de texto, nunca só a
  cor.

### Cards / Containers
- **Corner Style:** `rounded-xl` (~11px).
- **Background:** `branco-campo`, sempre um nível mais claro que o `pergaminho` do fundo da página.
- **Shadow Strategy:** `shadow-md` + `ring-1 ring-foreground/10` (ver Elevation & Depth).
- **Internal Padding:** 16px (`--card-spacing`), reduzindo pra 12px na variante `size="sm"`.

### Inputs / Fields
- **Style:** `rounded-lg`, borda `couro-linha`, fundo `branco-campo`, `shadow-xs`.
- **Focus:** borda muda para `ring` (vinho-lenço 60%) + anel de 3px a 50% de opacidade.
- **Error:** borda e anel passam para `destructive`; rótulo de erro em texto, nunca só a borda
  vermelha isolada.
- **Disabled:** opacidade reduzida, sombra removida, fundo `input/50`.

### Tables
- **Header:** `bg-muted/60` + borda inferior de 2px (não a borda padrão de 1px), pra se destacar como
  bloco estrutural.
- **Body:** linha alternada em `muted`, hover em `accent` (couro claro, mais quente que a zebra),
  linha com foco de teclado em `ring`.
- **Empty state:** nunca substitui a tabela por um texto solto — renderiza `TableHeader` normalmente
  e usa uma única `TableEmptyRow` com `colSpan` completo, mantendo cabeçalho e largura visíveis.

### Navigation (Sidebar)
- **Style:** única superfície escura do painel (`#295538`); marca e conta autenticada vivem no topo e
  rodapé da própria sidebar, não numa barra superior separada.
- **Default / Hover / Active:** item default em `sidebar-foreground`; hover em `colina-hover`
  (`#4f7147`); item ativo em `céu-do-login` (`#e9c98f`) com texto escuro.
- **Mobile:** colapsa num header claro (`bg-card`, visível só `sm:hidden`) que abre um `Sheet` (drawer)
  replicando o mesmo fundo escuro e rodapé de conta da sidebar completa.
- **Collapsed state:** mostra só avatar + ícone de saída, sem texto, tanto na sidebar quanto nos itens
  de navegação.

## Do's and Don'ts

### Do:
- **Do** usar verde-bandeira (`#2e5e3e`) como única cor de ação por tela — nunca duas cores de ação
  competindo no mesmo elemento.
- **Do** comunicar todo status com badge semântico + texto, nunca só cor.
- **Do** manter a mesma largura de container entre o `Skeleton` de loading e o conteúdo real da
  página.
- **Do** envolver toda tabela em `bg-card` + `shadow-sm` + `border` + `rounded-lg`, nunca deixá-la
  solta contra o `background`.
- **Do** exigir confirmação explícita (`alert-dialog`) para toda ação destrutiva ou de alto impacto.

### Don't:
- **Don't** reintroduzir o vinho tradicional como cor de ação (botão, link, badge) — ele vive só na
  roseta decorativa e no anel de foco.
- **Don't** usar cor hexadecimal solta fora dos tokens deste documento.
- **Don't** usar `bg-transparent` em campo de formulário — sempre `bg-card`/`shadow-xs`.
- **Don't** aplicar dark mode ao app inteiro — a sidebar é a única superfície escura intencional.
- **Don't** deixar texto de usuário final abaixo de 14px.
