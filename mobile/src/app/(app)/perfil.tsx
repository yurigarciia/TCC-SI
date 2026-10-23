import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { StatusAssociadoBadge } from "@/components/status-associado-badge";
import { useAuth } from "@/features/auth/auth-context";
import { useCurrentAssociado } from "@/features/associado/use-current-associado";
import { paperTheme } from "@/theme/paper-theme";

// Aba "Perfil" — achado numa conversa com o usuário: a Home estava sobrecarregada (avatar grande
// + "Meus dados" competindo com o que a pessoa abre o app todo dia pra ver, que é "o que tem
// pra acontecer"). Identidade/dados cadastrais e "Sair" moram aqui agora; a Home virou só
// saudação + próximos eventos (ver (app)/index.tsx).
export default function PerfilScreen() {
  const { sair } = useAuth();
  const { data: associado, isLoading, isError, refetch, isRefetching } = useCurrentAssociado();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !associado) {
    return (
      <SafeAreaView style={styles.center}>
        <Avatar.Icon icon="alert-circle-outline" size={56} style={styles.avatarErro} />
        <Text variant="titleMedium" style={styles.erroTitulo}>
          Não foi possível carregar seu cadastro
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 16 }}>
          Tentar de novo
        </Button>
        <Button mode="text" onPress={sair} style={{ marginTop: 4 }}>
          Sair
        </Button>
      </SafeAreaView>
    );
  }

  const iniciais = associado.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppTopBar titulo="Perfil" />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <Surface style={styles.heroCard} elevation={1}>
          <Avatar.Text
            size={56}
            label={iniciais || "?"}
            style={{ backgroundColor: paperTheme.colors.primaryContainer }}
            labelStyle={{ color: paperTheme.colors.primary, fontWeight: "700" }}
          />
          <View style={styles.heroInfo}>
            <Text variant="titleLarge" style={styles.nome}>
              {associado.nome}
            </Text>
            <Text variant="bodyMedium" style={styles.cpf}>
              CPF {associado.cpf}
            </Text>
            <View style={{ marginTop: 6 }}>
              <StatusAssociadoBadge status={associado.status} />
            </View>
          </View>
        </Surface>

        <Surface style={styles.card} elevation={1}>
          <View style={styles.cardTitulo}>
            <Avatar.Icon icon="account-details-outline" size={36} style={styles.avatarNeutro} />
            <Text variant="titleMedium" style={styles.cardTituloTexto}>
              Meus dados
            </Text>
          </View>
          <View style={styles.cardContent}>
            <InfoLinha icone="phone-outline" label="Contato" valor={associado.contato} />
            {associado.vinculoInstitucional && (
              <InfoLinha
                icone="domain"
                label="Vínculo institucional"
                valor={associado.vinculoInstitucional}
              />
            )}
          </View>
        </Surface>

        <Button
          mode="outlined"
          icon="logout"
          textColor="#B3261E"
          style={styles.botaoSair}
          onPress={sair}
        >
          Sair
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoLinha({ icone, label, valor }: { icone: string; label: string; valor: string }) {
  return (
    <View style={styles.infoLinha}>
      <Avatar.Icon icon={icone} size={36} style={styles.infoIcone} />
      <View style={{ flex: 1 }}>
        <Text variant="labelMedium" style={styles.infoLabel}>
          {label}
        </Text>
        <Text variant="bodyMedium">{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F1" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF7F1",
    padding: 24,
  },
  avatarErro: { backgroundColor: "#FBEAE9", marginBottom: 8 },
  erroTitulo: { textAlign: "center" },
  container: { padding: 20, gap: 16, paddingBottom: 110 },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  heroInfo: { flex: 1 },
  nome: { fontWeight: "700", color: "#2B241D" },
  cpf: { color: "#5B5147" },
  card: { borderRadius: 20, backgroundColor: "#FFFFFF", padding: 20, gap: 10 },
  cardTitulo: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTituloTexto: { color: "#2B241D", fontWeight: "700" },
  avatarNeutro: { backgroundColor: "#F1EAE0" },
  cardContent: { gap: 12 },
  infoLinha: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcone: { backgroundColor: "#F1EAE0" },
  infoLabel: { color: "#5B5147" },
  botaoSair: { borderRadius: 12, borderColor: "#B3261E", marginTop: 4 },
});
