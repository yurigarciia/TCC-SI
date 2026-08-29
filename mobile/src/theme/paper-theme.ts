import { MD3LightTheme } from "react-native-paper";

// Reaproveita os tokens de cor de frontend-web/DESIGN-SYSTEM.md §2 (paleta vinho/verde/couro sobre
// fundo claro) — o app não herda os componentes shadcn/ui (web-only), mas herda a paleta e os
// princípios de acessibilidade (§6: contraste AA, alvo de toque mínimo 44×44, nunca comunicar
// status só por cor). Dark mode é Non Goal do MVP (mesma decisão do painel web) — só o tema claro
// é exportado, mesmo com `userInterfaceStyle: "automatic"` no app.json controlando status bar/etc.
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#7A2331", // Vinho-lenço
    onPrimary: "#FDF8F3", // Pergaminho
    primaryContainer: "#F1D9DC", // Vinho bem clarinho — fundo de destaque suave
    onPrimaryContainer: "#5C1A24",
    secondary: "#2E5E3E", // Verde-bandeira
    onSecondary: "#FDF8F3",
    secondaryContainer: "#DCEADF",
    onSecondaryContainer: "#1B3B26",
    tertiary: "#B7791F", // Prata-âmbar, usado em acentos de aviso
    onTertiary: "#FDF8F3",
    tertiaryContainer: "#F3E3C8",
    onTertiaryContainer: "#4A3410",
    background: "#FAF7F1", // Pergaminho
    onBackground: "#2B241D", // Grafite-couro
    surface: "#FFFFFF", // Branco-campo
    onSurface: "#2B241D",
    surfaceVariant: "#F1EAE0", // Areia
    onSurfaceVariant: "#5B5147",
    outline: "#DDD0BC", // Couro-linha
    outlineVariant: "#E9E0D2",
    error: "#B3261E", // Vermelho-alerta
    onError: "#FFFFFF",
    errorContainer: "#FBEAE9",
    onErrorContainer: "#5C1712",
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
  sucesso: "#3E7A50", // Verde-bandeira claro — "Em dia", "Ativo"
  sucessoFundo: "#E5F1E8",
  aviso: "#B7791F", // Prata-âmbar — "Pendente"
  avisoFundo: "#FBF3E6",
  erro: "#B3261E", // Vermelho-alerta — "Inadimplente", "Rejeitado"
  erroFundo: "#FBEAE9",
  prata: "#C9CDD3", // Prata-pilcha — detalhes neutros
};

// Gradiente do cabeçalho das telas de autenticação — reforça a identidade (vinho-lenço) logo na
// entrada do app, mesmo papel visual que o cabeçalho institucional do painel web.
export const gradienteCabecalho = ["#7A2331", "#5C1A24"] as const;
