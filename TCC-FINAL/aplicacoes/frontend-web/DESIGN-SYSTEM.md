# Design System — Painel Administrativo (Frontend Web)

> Base visual única para o painel web (Next.js + Tailwind CSS + shadcn/ui). Objetivo: padronizar
> componentes desde o primeiro ticket, evitando decisões de estilo ad-hoc durante o desenvolvimento.
> Referência de stack e escopo em `TCC-FINAL/aplicacoes/PLANEJAMENTO-GERAL.md` e `CLAUDE.md`.

## 1. Direção Visual

**Conceito:** identidade tradicionalista gaúcha (CTG/entidades do tradicionalismo), traduzida em tom
**predominantemente claro** — não é um tema "campeiro" saturado nem um tema escuro. A cor entra como
**acento**, não como fundo. A base é neutra e clara para maximizar legibilidade e contraste, já que
parte do público (associados idosos, diretoria com baixa familiaridade digital) precisa de uma
interface confortável antes de precisar de uma interface "temática".

Referências de onde vêm as cores:
- **Vinho/bordô** — cor do lenço colorado, presente na indumentária tradicionalista.
- **Verde-bandeira** — verde do pavilhão rio-grandense, usado historicamente em uniformes/bandeiras
  de CTGs.
- **Couro/campanha** — tons terrosos (couro cru, campo, madeira), evocando galpão e campereada.
- **Prata** — detalhes de guaiaca/pilcha, usado como neutro frio de apoio, nunca como cor dominante.

Essas cores aparecem em **acentos** (botões primários, links, badges de status, ícones ativos,
bordas de destaque) sobre uma base clara neutra (branco levemente quente / bege muito claro), nunca
como grandes blocos de fundo saturado.

## 2. Paleta de Cores (tokens)

| Token | Nome | Hex | Uso |
|---|---|---|---|
| `--background` | Pergaminho | `#FAF7F1` | Fundo geral da aplicação |
| `--foreground` | Grafite-couro | `#2B241D` | Texto principal |
| `--card` | Branco-campo | `#FFFFFF` | Fundo de cards/painéis |
| `--card-foreground` | Grafite-couro | `#2B241D` | Texto sobre card |
| `--primary` | Vinho-lenço | `#7A2331` | Ações primárias, CTAs, links ativos |
| `--primary-foreground` | Pergaminho | `#FDF8F3` | Texto sobre botão primário |
| `--secondary` | Verde-bandeira | `#2E5E3E` | Ações secundárias, navegação ativa |
| `--secondary-foreground` | Pergaminho | `#FDF8F3` | Texto sobre botão secundário |
| `--accent` | Couro claro | `#E4D3B8` | Fundos de destaque suave, hover de itens de lista |
| `--accent-foreground` | Grafite-couro | `#2B241D` | Texto sobre acento |
| `--muted` | Areia | `#F1EAE0` | Fundos neutros secundários (linhas alternadas de tabela) |
| `--muted-foreground` | Grafite-couro 70% | `#5B5147` | Texto secundário, legendas |
| `--border` | Couro-linha | `#DDD0BC` | Bordas de inputs, cards, divisores |
| `--input` | Couro-linha | `#DDD0BC` | Borda de campos de formulário |
| `--ring` | Vinho-lenço 60% | `#A85C68` | Anel de foco (acessibilidade de teclado) |
| `--destructive` | Vermelho-alerta | `#B3261E` | Ações destrutivas, erros |
| `--destructive-foreground` | Branco | `#FFFFFF` | Texto sobre ação destrutiva |
| `--success` | Verde-bandeira claro | `#3E7A50` | Estados de sucesso, badges "em dia" |
| `--warning` | Prata-âmbar | `#B7791F` | Estados de atenção, badges "pendente" |
| `--silver` | Prata-pilcha | `#C9CDD3` | Detalhes decorativos discretos (divisores, ícones inativos) |

Regra de uso: **vinho (`primary`)** é a cor de ação principal do sistema (botões de "Salvar",
"Confirmar reserva", links ativos). **Verde (`secondary`)** marca navegação/estado ativo (item de
menu selecionado, tab ativa) — as duas nunca competem no mesmo elemento. Couro/areia/prata são
sempre neutros de apoio, nunca protagonistas.

### Bloco de variáveis CSS (compatível com shadcn/ui, formato HSL)

shadcn/ui espera as variáveis em HSL sem a função `hsl()` (ex.: `221 83% 53%`). Conversão dos tokens
acima para uso direto em `globals.css`:

```css
:root {
  --background: 36 33% 96%;        /* #FAF7F1 */
  --foreground: 30 15% 15%;        /* #2B241D */
  --card: 0 0% 100%;               /* #FFFFFF */
  --card-foreground: 30 15% 15%;
  --popover: 0 0% 100%;
  --popover-foreground: 30 15% 15%;
  --primary: 350 55% 31%;          /* #7A2331 */
  --primary-foreground: 30 60% 97%;/* #FDF8F3 */
  --secondary: 137 35% 27%;        /* #2E5E3E */
  --secondary-foreground: 30 60% 97%;
  --accent: 37 44% 82%;            /* #E4D3B8 */
  --accent-foreground: 30 15% 15%;
  --muted: 37 33% 92%;             /* #F1EAE0 */
  --muted-foreground: 33 8% 34%;   /* #5B5147 */
  --border: 37 30% 82%;            /* #DDD0BC */
  --input: 37 30% 82%;
  --ring: 350 33% 51%;             /* #A85C68 */
  --destructive: 4 71% 39%;        /* #B3261E */
  --destructive-foreground: 0 0% 100%;
  --success: 137 32% 36%;          /* #3E7A50 */
  --warning: 37 68% 41%;           /* #B7791F */
  --silver: 220 8% 80%;            /* #C9CDD3 */
  --radius: 0.5rem;
}
```

Não há bloco `.dark` proposto — dark mode é explicitamente Non Goal do MVP (ver
`PLANEJAMENTO-GERAL.md` §2). Se for adicionado no futuro, deve inverter os papéis (fundo escuro
neutro, vinho e verde clareados para manter contraste), nunca reaproveitar os tons claros diretamente.

## 3. Tipografia

- **Corpo/UI:** `Inter` (mesma família padrão do shadcn/ui) — legibilidade alta em telas de
  formulário/tabela densas, importante para o público com menor familiaridade digital.
- **Títulos/destaques institucionais** (ex.: cabeçalho do painel, tela de login, nome da entidade):
  `Fraunces` (serifada, com leve caráter tradicional/editorial) via Google Fonts, aplicada só em
  `h1`/`h2` de telas de entrada — não em UI densa (tabelas, formulários), para não comprometer
  legibilidade.

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-display: "Fraunces", ui-serif, Georgia, serif;
```

Escala tipográfica (Tailwind default, reaproveitada sem customização): `text-sm` (14px) mínimo para
texto de apoio, `text-base` (16px) como padrão de corpo — **nunca abaixo de 14px** em texto lido por
usuário final, considerando o público idoso. Títulos de tela: `text-2xl`/`text-3xl` com
`font-display`.

## 4. Espaçamento, Raio e Elevação

- Escala de espaçamento: padrão Tailwind (múltiplos de 4px), sem customização.
- `--radius: 0.5rem` (8px) — cantos arredondados moderados, consistente com shadcn/ui default;
  transmite acolhimento sem parecer infantil.
- Sombra: usar apenas os níveis `shadow-sm`/`shadow` do Tailwind para cards e modais — evitar
  sombras pesadas, mantendo a leveza do fundo claro.

### 4.1 Largura de página

`AppShell` (`src/components/layout/app-shell.tsx`) deixa o `<main>` ocupar toda a largura
disponível de propósito — cada página decide sua própria largura de conteúdo, nunca deixe uma
página "grudada" à esquerda com espaço vazio à direita (bug real encontrado em 2026-08-30: telas
de formulário/detalhe usavam `max-w-*` sem `mx-auto`, sobrando ~50% de tela em branco num monitor
largo). Convenção:

- Páginas de **lista** (tabelas, grids de cards) — sem `max-w`, ocupam 100% do `<main>`.
- Páginas de **formulário simples** (poucos campos, ex. `saloes/novo`) — `mx-auto w-full max-w-lg`.
- Páginas de **formulário/detalhe** com Cards empilhados (ex. `associados/novo`,
  `associados/[id]`, `eventos/novo`, `eventos/[id]`) — `mx-auto w-full max-w-3xl`.
- Páginas com **tabela densa ou canvas de croqui** (ex. `eventos/[id]/mapa`,
  `eventos/[id]/ingressos`, `saloes/[id]`) — `mx-auto w-full max-w-5xl`: o `MapaMesasCanvas`/
  `MesaCanvas` de coordenadas fixas em pixel se beneficia de verdade da largura extra (menos
  rolagem horizontal), não é só estética.

Sempre aplicar a mesma largura no estado de loading (`Skeleton`) e no conteúdo real da página —
um mismatch entre os dois causa um "pulo" de layout visível ao carregar.

## 5. Componentes Base (shadcn/ui)

Usar os componentes shadcn/ui como base de todo o painel, sem reescrever do zero:
`button`, `input`, `label`, `select`, `checkbox`, `radio-group`, `switch`, `table`, `card`,
`dialog`, `alert-dialog`, `dropdown-menu`, `tabs`, `badge`, `toast` (sonner), `form` (com
`react-hook-form` + `zod`), `avatar`, `separator`, `skeleton` (loading states).

Convenções específicas deste projeto:
- **Badges de status** usam os tokens semânticos, não cores livres: `success` (em dia/confirmado),
  `warning` (pendente/inadimplente há pouco tempo), `destructive` (inadimplente/cancelado),
  `secondary` (rascunho/neutro).
- **Botão primário** (`variant="default"`) reservado a uma única ação por tela/seção (a ação mais
  importante). Ações secundárias usam `variant="outline"` ou `variant="secondary"`.
- **Ícones**: `lucide-react` (padrão shadcn/ui), tamanho mínimo 20px em botões clicáveis (alvo de
  toque generoso).
- **Tabelas** (associados, mensalidades, reservas): a tabela nunca fica "solta" contra o fundo da
  página — o container em volta de `<Table>` sempre leva `bg-card` + `shadow-sm` + `border` +
  `rounded-lg` (`overflow-hidden` no lugar de `overflow-x-auto`, que já vem do próprio `<Table>`),
  senão ela se confunde com o `--background` pergaminho por trás (achado numa conversa com o
  usuário: sem isso a tabela "parecia fazer parte do background"). Cabeçalho (`TableHeader`) e
  rodapé de paginação (`Pagination`, `src/components/pagination.tsx`) levam `bg-muted/60` +
  `border-b-2`/`border-t-2` (não a borda de 1px padrão) pra se destacarem como blocos estruturais
  — sem isso, o cabeçalho "parece só mais uma linha" da tabela (achado na mesma conversa). Linha
  alternada do corpo com `--muted`, nunca cor pura; hover usa `--accent` (couro claro, mais quente
  que o `--muted` da zebra, pra não se confundir com ela); linha com foco de teclado usa `--ring`.
- **Tabela vazia**: nunca substituir a tabela inteira por um texto solto quando não há itens —
  sempre renderizar `<Table>`/`<TableHeader>` normalmente e usar `TableEmptyRow`
  (`src/components/table-empty-row.tsx`) como única linha do `<TableBody>`, com `colSpan` igual ao
  número de colunas. Mantém cabeçalho/largura/formatação visíveis mesmo sem dado nenhum — dá pra
  conferir a tela sem precisar semear registros de teste.
- **Cabeçalho de listagem**: título + subtítulo curto (uma linha, `text-sm`, sem tom de tutorial)
  em bloco próprio; o campo de busca (`SearchInput`, `src/components/search-input.tsx`) fica numa
  linha separada logo abaixo, sempre ao lado da ação principal da tela (ex.: busca à esquerda,
  botão "Novo X" à direita, mesma linha) — nunca sozinho ocupando uma linha inteira antes do botão.
  Mudar o termo de busca sempre reseta a página pra 1.

### 5.1 Sidebar (única superfície escura do painel)

A navegação lateral (`AppShell`, `src/components/layout/app-shell.tsx`) é a única superfície do
painel com fundo escuro — "couro escuro" (galpão/campereada), deliberado: dá contraste moderno
contra o restante do painel claro sem contradizer o Non Goal de dark mode geral (§2 do
`PLANEJAMENTO-GERAL.md`), que é sobre o tema do app inteiro, não sobre uma superfície fixa. Tokens
dedicados (`--sidebar*`, já vinham do scaffold do shadcn/ui, substituídos pela paleta gaúcha):

| Token | Hex | Uso |
|---|---|---|
| `--sidebar` | `#241A13` | Fundo da sidebar (couro escuro) |
| `--sidebar-foreground` | `#F1E7D8` | Texto sobre a sidebar (pergaminho quente) |
| `--sidebar-primary` | `#3E7A50` | Item de navegação ativo (verde-bandeira claro) |
| `--sidebar-primary-foreground` | `#FDF8F3` | Texto sobre item ativo |
| `--sidebar-accent` | `#38291D` | Hover de item |
| `--sidebar-accent-foreground` | `#F1E7D8` | Texto sobre hover |
| `--sidebar-border` | `#4A3726` | Divisores (topo/rodapé da sidebar) |
| `--sidebar-ring` | `#C9A15A` | Anel de foco sobre fundo escuro |

Contraste conferido (fórmula WCAG, ver `contrast.mjs` descartável usado na sessão): texto principal
13.9:1, texto secundário a 70% de opacidade (`text-sidebar-foreground/70`, usado no e-mail/perfil)
7.4:1, pílula ativa 4.9:1 — todos acima do mínimo AA (4.5:1) do §6.

A marca ("Pia do Sul") e a conta autenticada (avatar com iniciais, e-mail, perfil, botão "Sair")
vivem dentro da própria sidebar — topo e rodapé, respectivamente —, não mais numa barra superior
compartilhada. O header claro (`bg-card`) só existe no mobile (`sm:hidden`), como gatilho do menu;
o drawer mobile (`Sheet`) replica o mesmo fundo escuro e o mesmo rodapé de conta, pra não haver
inconsistência entre breakpoints. Colapsada, a sidebar mostra só avatar + ícone de sair (sem
texto), mesmo padrão dos itens de navegação colapsados.

## 6. Acessibilidade e Adoção Gradual

Diretrizes específicas por causa do público (pessoas idosas, diretoria com menor familiaridade
digital — terminologia de `PROJETO-TCC/instrucoes_base.md`):

- Contraste mínimo **WCAG AA** (4.5:1) para todo texto sobre `background`/`card`/`accent` — os pares
  de tokens acima já foram escolhidos para atender isso; qualquer nova cor precisa ser checada antes
  de entrar no design system.
- Área de toque mínima de 44×44px em botões e itens de lista clicáveis (alinhado com o alvo mobile,
  para consistência entre painel web usado em tablet e o app).
- Nunca comunicar estado **somente por cor** (ex.: status de mensalidade): sempre badge com texto
  (“Em dia”, “Pendente”, “Inadimplente”), cor é reforço, não único canal.
- Rótulos de campo sempre visíveis (não usar apenas placeholder como label) — reduz erro de
  preenchimento para usuários menos familiarizados com formulários web.
- Confirmações explícitas (`alert-dialog`) para ações destrutivas ou de alto impacto (cancelar
  reserva, suspender associado, publicar evento) — nunca ação irreversível a um clique só.
- Vocabulário nas telas segue o glossário de `PROJETO-TCC/instrucoes_base.md`: evitar jargão técnico
  (ex.: preferir “Associado pendente de aprovação” a “status = PENDING”).

## 7. Checklist de conformidade (usar em cada nova tela)

- [ ] Usa somente tokens deste documento (nenhuma cor hexadecimal solta no componente).
- [ ] Ação primária da tela é única e usa `variant="default"`.
- [ ] Status é comunicado com badge semântico + texto, nunca só cor.
- [ ] Contraste de texto verificado (mínimo AA) se alguma cor nova foi introduzida.
- [ ] Ação destrutiva/irreversível tem confirmação explícita.
- [ ] Testado com zoom de navegador em 150% sem quebra de layout (proxy para usuários com baixa
      acuidade visual).
