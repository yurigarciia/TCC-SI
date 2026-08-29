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
    primaryContainer: "#E4D3B8", // Couro claro
    onPrimaryContainer: "#2B241D",
    secondary: "#2E5E3E", // Verde-bandeira
    onSecondary: "#FDF8F3",
    secondaryContainer: "#DCEADF",
    onSecondaryContainer: "#1B3B26",
    background: "#FAF7F1", // Pergaminho
    onBackground: "#2B241D", // Grafite-couro
    surface: "#FFFFFF", // Branco-campo
    onSurface: "#2B241D",
    surfaceVariant: "#F1EAE0", // Areia
    onSurfaceVariant: "#5B5147",
    outline: "#DDD0BC", // Couro-linha
    error: "#B3261E", // Vermelho-alerta
    onError: "#FFFFFF",
  },
  roundness: 2, // ~8px de raio nos componentes Paper (radius base 4px), alinhado ao --radius do web
};

// Cores semânticas fora da paleta MD3 padrão (badges de status) — usadas diretamente via style,
// não fazem parte do objeto `theme.colors` do Paper.
export const coresSemanticas = {
  sucesso: "#3E7A50", // Verde-bandeira claro — "Em dia", "Ativo"
  aviso: "#B7791F", // Prata-âmbar — "Pendente"
  erro: "#B3261E", // Vermelho-alerta — "Inadimplente", "Rejeitado"
  prata: "#C9CDD3", // Prata-pilcha — detalhes neutros
};
