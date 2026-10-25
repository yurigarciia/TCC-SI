import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { LogoMark } from "@/components/logo-mark";
import { cores, paperTheme } from "@/theme/paper-theme";

// Barra de topo compartilhada por toda a área autenticada — mesma marca/título em todas as telas
// (raiz de aba OU sub-tela empilhada), pra não ter cada tela com um estilo de cabeçalho diferente
// (achado numa conversa com o usuário). Sub-tela empilhada (ex.: detalhe de evento, aberta a
// partir da aba Eventos): passa `onVoltar` e mostra o botão de voltar.
//
// Achado numa conversa com o usuário: o botão "Sair" não deveria ficar de fácil acesso aqui (uma
// ação irreversível a um toque, no cabeçalho de toda tela) — ele já vive, com confirmação visual
// de contexto, no rodapé da aba Perfil (ver (app)/perfil.tsx). Removido daqui de propósito, não
// por esquecimento.
export function AppTopBar({
  titulo,
  onVoltar,
}: {
  titulo: string;
  onVoltar?: () => void;
}) {
  return (
    <View style={styles.topBar}>
      {onVoltar && (
        <IconButton
          icon="arrow-left"
          onPress={onVoltar}
          accessibilityLabel="Voltar"
          style={styles.botaoVoltar}
        />
      )}
      <View style={styles.logoChip}>
        <LogoMark size={18} />
      </View>
      <View style={styles.textos}>
        <Text variant="labelSmall" style={styles.marca}>
          QUERÊNCIA ASSOCIADOS
        </Text>
        <Text variant="titleMedium" style={styles.titulo}>
          {titulo}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: cores.primariaClara,
    borderBottomWidth: 3,
    borderBottomColor: paperTheme.colors.primary,
  },
  botaoVoltar: { margin: 0, marginRight: -4 },
  // Chip claro com anel colorido atrás da marca — mesma regra de contraste do logo-mark.tsx (o
  // traço verde-escuro do anel precisa de um fundo claro opaco por baixo, nunca um bloco escuro
  // direto), com a borda colorida dando o toque de cor que faltava onde antes só havia um ícone
  // solto sobre fundo branco.
  logoChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FDF8F3",
    borderWidth: 2,
    borderColor: cores.sidebarAtivo,
    alignItems: "center",
    justifyContent: "center",
  },
  textos: { flex: 1 },
  marca: { color: paperTheme.colors.primary, fontWeight: "700", letterSpacing: 0.6 },
  titulo: { color: cores.texto, fontWeight: "700" },
});
