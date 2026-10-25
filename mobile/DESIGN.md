---
name: Querência ERP — App do Associado
description: App móvel simples e acolhedor para o associado consultar mensalidade, reservar e comprar ingresso para eventos.
colors:
  verde-bandeira: "#2E5E3E"
  verde-claro: "#DCEADF"
  verde-escuro: "#1B3B26"
  sidebar-verde: "#295538"
  sidebar-verde-escuro: "#1F4029"
  sidebar-texto: "#FAF7F1"
  sidebar-ativo: "#E9C98F"
  ambar: "#B7791F"
  ambar-claro: "#F3E3C8"
  ambar-escuro: "#4A3410"
  pergaminho: "#FAF7F1"
  grafite-couro: "#2B241D"
  branco-campo: "#FFFFFF"
  areia: "#F1EAE0"
  texto-secundario: "#5B5147"
  couro-linha: "#DDD0BC"
  couro-linha-variante: "#E9E0D2"
  vermelho-alerta: "#B3261E"
  vermelho-claro: "#FBEAE9"
  vermelho-escuro: "#5C1712"
typography:
  display:
    fontFamily: "system (Roboto no Android, San Francisco no iOS)"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "system"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "system"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "system"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.verde-bandeira}"
    textColor: "#FDF8F3"
    rounded: "{rounded.md}"
    padding: "6px 16px"
  card:
    backgroundColor: "{colors.branco-campo}"
    textColor: "{colors.grafite-couro}"
    rounded: "{rounded.xl}"
    padding: "20px"
  card-hero:
    backgroundColor: "{colors.branco-campo}"
    textColor: "{colors.grafite-couro}"
    rounded: "{rounded.xl}"
  badge-sucesso:
    backgroundColor: "{colors.verde-bandeira}"
    textColor: "{colors.verde-bandeira}"
    rounded: "{rounded.lg}"
  badge-aviso:
    backgroundColor: "{colors.ambar}"
    textColor: "{colors.ambar}"
    rounded: "{rounded.lg}"
  badge-erro:
    backgroundColor: "{colors.vermelho-alerta}"
    textColor: "{colors.vermelho-alerta}"
    rounded: "{rounded.lg}"
  input:
    backgroundColor: "{colors.branco-campo}"
    textColor: "{colors.grafite-couro}"
    rounded: "{rounded.sm}"
---

# Design System: Querência ERP — App do Associado

## Overview

**Creative North Star: "A Carteirinha de Sócio"**

O app é um documento pessoal, simples, sempre à mão — não uma ferramenta de gestão. O associado o
abre pra uma tarefa pontual (ver se está em dia, reservar uma mesa, comprar um ingresso) e sai; ele
nunca precisa "aprender" o app antes de usá-lo. A barra de complexidade de interação é deliberadamente
mais baixa que a do painel administrativo: menos densidade por tela, hierarquia mais larga, cantos
mais generosos, cor usada com mais liberdade (mas ainda como acento, nunca como fundo saturado) do
que no painel, porque aqui a prioridade é acolhimento visual, não throughput de tarefa.

A paleta é a mesma do painel web — verde-bandeira como única cor de ação, vinho tradicional ausente
como cor funcional — garantindo que os dois lados do produto sejam reconhecivelmente a mesma marca,
mesmo com personalidades de interação diferentes. Hoje a implementação usa **Material 3 uniforme**
via `react-native-paper`, com o mesmo tema claro fixo em Android e iOS: não há, ainda, nenhuma
divergência real de linguagem visual por sistema operacional (sem SF Symbols, sem cores semânticas
nativas do iOS, sem navegação específica por plataforma). Isso é um gap conhecido a documentar, não
um erro — se o produto evoluir para divergir de fato por OS, essa seção deve ser revisitada.

**Key Characteristics:**
- Hierarquia mais larga e menos densa que o painel web — uma tarefa por tela.
- Mesma paleta de ação do painel (verde-bandeira), mesma ausência funcional do vinho tradicional.
- Elevação tonal e quente (níveis do Material 3 tingidos de pergaminho), nunca sombra dura.
- Cantos generosos (12–20px) — mais arredondados que o painel web, reforçando o tom acolhedor.
- Hoje Material-uniforme nas duas plataformas; divergência real por OS ainda não implementada.

## Colors

Mesma paleta de papel do painel administrativo, com liberdade um pouco maior de uso (containers
tonais claros do Material 3) — ainda assim, verde-bandeira continua sendo a única cor de ação.

### Primary
- **Verde-bandeira** (`#2E5E3E`): cor de ação — botões primários, badge "em dia"/"ativo", item
  selecionado na navbar. Mesmo token do `--primary` do painel web.
- **Verde-claro** (`#DCEADF`): container tonal do Material (fundo de destaque suave atrás de
  ícones/avatares ligados à ação primária).

### Secondary
- **Âmbar** (`#B7791F`): cor terciária do tema Material — estado de atenção/pendência, mesmo papel
  do `warning` no painel.

### Neutral
- **Pergaminho** (`#FAF7F1`): fundo geral de toda tela.
- **Grafite-couro** (`#2B241D`): texto principal.
- **Branco-campo** (`#FFFFFF`): fundo de cards e superfícies elevadas.
- **Areia** (`#F1EAE0`): superfície secundária (fundo de ícone neutro, chip inativo).
- **Couro-linha** (`#DDD0BC`): contorno de inputs e divisores.

### Semantic
- **Vermelho-alerta** (`#B3261E`): erro, "inadimplente", "rejeitado" — nunca bloco vermelho sólido
  fora de badge.

### Sidebar / Navegação (identidade de marca)
- **Verde-sidebar** (`#295538`): cabeçalho de marca (barra de evento, telas de autenticação) e fundo
  da navbar inferior — separado da cor de ação acima, do mesmo jeito que o painel separa sidebar de
  botão.
- **Dourado-ativo** (`#E9C98F`): ícone/rótulo do item selecionado na navbar — mesma cor do item ativo
  da sidebar do painel, reforçando que é o mesmo sistema.

### Named Rules
**The Same Family, Different Pace Rule.** A paleta é idêntica à do painel web (mesmos hex, mesmos
papéis) — a diferença entre os dois lados do produto é de densidade e generosidade de espaço, nunca
de cor.

**The No Wine Rule.** O vinho tradicional não tem papel funcional neste app — nem como cor de ação,
nem como acento residual (diferente do painel, que ainda guarda a roseta decorativa).

## Typography

**Type system:** fonte do sistema (Roboto no Android, San Francisco no iOS) em todo o app — sem
fonte de marca customizada (diferente do painel web, que usa Fraunces em pontos de entrada). Essa é
uma escolha deliberada de nativismo: o app prioriza a sensação de "nativo da plataforma" sobre a
expressão de marca tipográfica.

### Hierarchy
- **Display** (400, ~28px): nome do produto na tela de login.
- **Title** (700, ~22px): título de hero (nome do associado, título de evento em destaque).
- **Body** (400, 16px): corpo de card, descrição, texto de formulário.
- **Label** (500, 12px): rótulo de badge, legenda de campo.

### Named Rules
**The System Face Rule.** Nenhuma tela carrega uma fonte customizada — a tipografia é sempre a fonte
padrão do sistema operacional, reforçando a leitura "este é um app nativo", não "um site dentro de um
app".

## Layout

Telas de rolagem única (`ScrollView`), um cartão hero no topo (identidade/resumo) seguido de cards de
conteúdo empilhados verticalmente — nunca grids densos ou múltiplas colunas, mesmo em tablets (o
painel web cobre esse caso). Espaçamento generoso entre cards (16–20px) comparado ao painel web.
Navegação por abas inferior fixa (`position: absolute`, margem horizontal simétrica — nunca `left`/
`right` direto, que conflita com as propriedades lógicas `start`/`end` do `BottomTabBar` vendorizado
do `expo-router`), 4-5 destinos de nível superior.

### Named Rules
**The One Card, One Job Rule.** Cada card de uma tela representa um único bloco de informação ou
ação (ex.: "Meus dados", próximo evento, status da mensalidade) — nunca mistura dois assuntos
num mesmo card pra economizar espaço.

## Elevation & Depth

Tonal e quente, nunca sombra dura: o Material 3 do Paper foi configurado com níveis de elevação
(`level1`–`level5`) tingidos de pergaminho (de `#FFFDFA` a `#FBF1E3`), não cinza neutro — a superfície
fica mais clara e mais quente a cada nível, em vez de ganhar uma sombra projetada visível. Cards
sobre o fundo pergaminho se distinguem principalmente pelo próprio branco-campo do fundo, reforçado
por um raio de canto generoso.

### Named Rules
**The Warm Tint Rule.** Elevação nunca usa cinza neutro — cada nível tonal do Material é tingido na
mesma família de pergaminho/âmbar da marca.

## Shapes

Cantos bem mais generosos que o painel web — 12px é o raio padrão dos componentes Paper
(`roundness: 3` × 4px), subindo para 16–20px em cards hero e botões de destaque. Essa generosidade é
o principal diferenciador visual entre "app simples e acolhedor" e "painel de trabalho sóbrio".

## Components

### Buttons
- **Shape:** `borderRadius: 12`, botões de destaque (CTA de compra de ingresso) sobem pra 16.
- **Primary:** fundo verde-bandeira, texto pergaminho claro (`#FDF8F3`); reservado a uma ação por
  tela/seção, mesma regra do painel.
- **Outlined/Text:** usados para ações secundárias (ex.: "Tentar de novo", "Sair").

### Badges / Status
- **Style:** fundo tonal claro da cor semântica + texto na cor sólida, sempre acompanhado de texto
  (nunca só cor) — `StatusAssociadoBadge` segue exatamente a mesma regra do painel.

### Cards / Containers
- **Corner Style:** `borderRadius: 20` em cards hero (ex.: cabeçalho de perfil), `16` em cards de
  conteúdo padrão.
- **Background:** branco-campo sobre o pergaminho do fundo da tela.
- **Elevation:** tonal (ver Elevation & Depth), nunca sombra dura adicional via `shadow*` manual.

### Inputs / Fields
- **Style:** `mode="outlined"` do Paper, contorno couro-linha, fundo branco-campo.
- **Error:** mensagem de erro em texto vermelho abaixo do campo, nunca só a borda vermelha isolada.

### Navigation (Tab bar inferior)
- **Style:** fundo verde-sidebar, flutuante (`position: absolute`, margem horizontal simétrica via
  `marginHorizontal`, nunca `left`/`right` isolados).
- **Default / Active:** ícone/rótulo inativo em pergaminho (`sidebarTexto`); ativo em dourado
  (`sidebarAtivo`) — mesmo par de cores do item ativo da sidebar do painel.

## Do's and Don'ts

### Do:
- **Do** usar verde-bandeira como única cor de ação, igual ao painel web — mesma marca, dois ritmos
  de interação.
- **Do** manter a tipografia no padrão do sistema (sem fonte de marca customizada).
- **Do** usar elevação tonal quente (Material) em vez de sombra dura manual.
- **Do** manter uma tarefa por card, nunca dois assuntos no mesmo bloco.
- **Do** aplicar `marginHorizontal` simétrico na tab bar flutuante — nunca `left`/`right` isolados
  (conflita com as propriedades lógicas `start`/`end` do componente vendorizado).

### Don't:
- **Don't** introduzir o vinho tradicional como cor funcional neste app — aqui ele não tem nem o
  papel residual que ainda tem no painel.
- **Don't** aumentar a densidade de informação por tela pra "economizar espaço" — a barra de
  complexidade deste app é deliberadamente mais baixa que a do painel.
- **Don't** assumir divergência visual por iOS/Android que ainda não existe no código — hoje é
  Material uniforme; tratar HIG/SF Symbols como trabalho futuro, não como estado atual.
- **Don't** usar grid de múltiplas colunas, mesmo em tablet.
