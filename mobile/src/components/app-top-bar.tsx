import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useAuth } from "@/features/auth/auth-context";
import { LogoMark } from "@/components/logo-mark";
import { paperTheme } from "@/theme/paper-theme";

// Barra de topo compartilhada por toda a área autenticada — mesma marca/título em todas as telas
// (raiz de aba OU sub-tela empilhada), pra não ter cada tela com um estilo de cabeçalho diferente
// (achado numa conversa com o usuário). Raiz de aba: botão "Sair" sempre acessível. Sub-tela
// empilhada (ex.: detalhe de evento, aberta a partir da aba Eventos): passa `onVoltar` e o botão
// de voltar substitui o de sair — a saída continua acessível voltando pra aba.
export function AppTopBar({
  titulo,
  onVoltar,
}: {
  titulo: string;
  onVoltar?: () => void;
}) {
  const { sair } = useAuth();
  return (
    <View style={styles.topBar}>
      <View style={styles.marcaLinha}>
        {onVoltar && (
          <IconButton
            icon="arrow-left"
            onPress={onVoltar}
            accessibilityLabel="Voltar"
            style={styles.botaoVoltar}
          />
        )}
        <LogoMark size={20} />
        <View>
          <Text variant="labelMedium" style={styles.marca}>
            QUERÊNCIA ERP
          </Text>
          <Text variant="titleMedium" style={styles.titulo}>
            {titulo}
          </Text>
        </View>
      </View>
      {!onVoltar && <IconButton icon="logout" onPress={sair} accessibilityLabel="Sair" />}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD0BC",
  },
  marcaLinha: { flexDirection: "row", alignItems: "center", gap: 10 },
  botaoVoltar: { margin: 0, marginRight: -4 },
  marca: { color: paperTheme.colors.primary, fontWeight: "700", letterSpacing: 0.5 },
  titulo: { color: "#2B241D", fontWeight: "700" },
});
