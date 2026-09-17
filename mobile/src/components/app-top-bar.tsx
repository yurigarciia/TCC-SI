import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useAuth } from "@/features/auth/auth-context";
import { LogoMark } from "@/components/logo-mark";

// Barra de topo compartilhada pelas abas de (app) — nome do app + botão "Sair" sempre acessível,
// não só na aba Início.
export function AppTopBar({ titulo }: { titulo: string }) {
  const { sair } = useAuth();
  return (
    <View style={styles.topBar}>
      <View style={styles.marcaLinha}>
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
      <IconButton icon="logout" onPress={sair} accessibilityLabel="Sair" />
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
  marca: { color: "#7A2331", fontWeight: "700", letterSpacing: 0.5 },
  titulo: { color: "#2B241D", fontWeight: "700" },
});
