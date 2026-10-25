import { MD3LightTheme } from "react-native-paper";

// Fonte única da paleta — qualquer troca de identidade visual (ver adendo abaixo) muda só este
// bloco; `paperTheme`/`coresSemanticas`/`gradienteCabecalho` são todos derivados dele, e nenhuma
// tela deveria mais ter um hex de marca escrito diretamente num StyleSheet (ver DESIGN-SYSTEM.md
// §2 do painel web — mesmos nomes de token, pra facilitar comparar os dois lados).
//
// Achado numa conversa com o usuário (2026-10-10): o painel web trocou a cor primária de
// vinho-lenço pra verde-bandeira (ver frontend-web/src/app/globals.css — `--primary`/`--secondary`
// são o mesmo verde agora, `--sidebar` usa um verde ligeiramente mais escuro com pílula âmbar no
// item ativo, e o vinho ficou só de acento residual em gráficos/marca d'água). Replicado aqui pra
// não destoar; antes disso, `cores.primaria` era o vinho (`#7A2331`) e tudo abaixo apontava pra
// ele — é só isso que muda numa próxima identidade.
export const cores = {
  primaria: "#2E5E3E", // Verde-bandeira escuro — mesmo token de --primary/--secondary no painel
  primariaClara: "#DCEADF", // Verde bem clarinho — fundo de destaque suave
  primariaEscura: "#1B3B26",
  sidebar: "#295538", // Verde da sidebar do painel web (globals.css --sidebar) — cabeçalhos "de
  // marca" (barra de evento, telas de autenticação), separado do verde de ação acima do mesmo
  // jeito que o painel separa sidebar de botão.
  sidebarEscuro: "#1F4029", // globals.css --sidebar-border
  sidebarTexto: "#FAF7F1", // globals.css --sidebar-foreground — ícone/rótulo inativo na navbar
  sidebarAtivo: "#E9C98F", // globals.css --sidebar-primary — ícone/rótulo do item selecionado na
  // navbar (achado numa conversa com o usuário: navbar branca/monocromática não tinha identidade
  // visual nenhuma com o resto do sistema; agora replica o mesmo verde+âmbar da sidebar do painel
  // web, ver (app)/_layout.tsx)
  ambar: "#B7791F", // Prata-âmbar, usado em acentos de aviso
  ambarClaro: "#F3E3C8",
  ambarEscuro: "#4A3410",
  fundo: "#FAF7F1", // Pergaminho
  texto: "#2B241D", // Grafite-couro
  superficie: "#FFFFFF", // Branco-campo
  superficieVariante: "#F1EAE0", // Areia
  textoSecundario: "#5B5147",
  contorno: "#DDD0BC", // Couro-linha
  contornoVariante: "#E9E0D2",
  erro: "#B3261E", // Vermelho-alerta
  erroClaro: "#FBEAE9",
  erroEscuro: "#5C1712",
} as const;

// Reaproveita a paleta acima — o app não herda os componentes shadcn/ui (web-only), mas herda a
// paleta e os princípios de acessibilidade (DESIGN-SYSTEM.md §6: contraste AA, alvo de toque
// mínimo 44×44, nunca comunicar status só por cor). Dark mode é Non Goal do MVP (mesma decisão do
// painel web) — só o tema claro é exportado, mesmo com `userInterfaceStyle: "automatic"` no
// app.json controlando status bar/etc.
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: cores.primaria,
    onPrimary: "#FDF8F3", // Pergaminho
    primaryContainer: cores.primariaClara,
    onPrimaryContainer: cores.primariaEscura,
    secondary: cores.primaria, // Mesmo verde — painel não distingue mais primary/secondary
    onSecondary: "#FDF8F3",
    secondaryContainer: cores.primariaClara,
    onSecondaryContainer: cores.primariaEscura,
    tertiary: cores.ambar,
    onTertiary: "#FDF8F3",
    tertiaryContainer: cores.ambarClaro,
    onTertiaryContainer: cores.ambarEscuro,
    background: cores.fundo,
    onBackground: cores.texto,
    surface: cores.superficie,
    onSurface: cores.texto,
    surfaceVariant: cores.superficieVariante,
    onSurfaceVariant: cores.textoSecundario,
    outline: cores.contorno,
    outlineVariant: cores.contornoVariante,
    error: cores.erro,
    onError: "#FFFFFF",
    errorContainer: cores.erroClaro,
    onErrorContainer: cores.erroEscuro,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: "transparent",
      level1: "#FFFDFA",
      level2: "#FFFBF5",
      level3: "#FDF6EC",
      level4: "#FCF4E9",
      level5: "#FBF1E3",
    },
  },
  roundness: 3, // ~12px nos componentes Paper (roundness × 4px), acolhedor sem parecer infantil
};

// Cores semânticas fora da paleta MD3 padrão (badges de status) — usadas diretamente via style,
// não fazem parte do objeto `theme.colors` do Paper.
export const coresSemanticas = {
  sucesso: cores.primaria, // "Em dia", "Ativo" (mesmo token de --success no painel agora)
  sucessoFundo: "#E5F1E8",
  aviso: cores.ambar, // "Pendente"
  avisoFundo: "#FBF3E6",
  erro: cores.erro, // "Inadimplente", "Rejeitado"
  erroFundo: cores.erroClaro,
  prata: "#C9CDD3", // Prata-pilcha — detalhes neutros
};

// Gradiente do cabeçalho das telas de autenticação — antes vinho-lenço, agora o mesmo verde da
// sidebar do painel web, reforçando a identidade única do sistema na entrada do app.
export const gradienteCabecalho = [cores.sidebar, cores.sidebarEscuro] as const;

// Cor do ícone de campo por estado de foco, compartilhada pelas 3 telas de autenticação — o
// próprio TextInput.Icon do Paper aceita uma função `(focado) => cor`. Dá "jogo de cor" ao
// digitar sem pintar ícone solto permanentemente (achado numa conversa com o usuário: as telas
// de login/cadastro/vincular-conta estavam monótonas demais).
export const corIconeCampo = (focado: boolean) =>
  focado ? cores.primaria : cores.textoSecundario;
