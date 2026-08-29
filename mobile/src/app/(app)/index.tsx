import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { StatusAssociadoBadge } from "@/components/status-associado-badge";
import { useAuth } from "@/features/auth/auth-context";
import { useCurrentAssociado } from "@/features/associado/use-current-associado";
import { paperTheme } from "@/theme/paper-theme";

// Tela inicial — status do associado (RF03). Situação de mensalidade/histórico fica pra
// T-MOB-002, que ainda não tem endpoint de backend voltado ao associado (mensalidades hoje é
// 100% @Roles(ADMINISTRADOR) — ver mensalidades.controller.ts); reservas/ingressos e eventos
// ficam pra T-MOB-003/T-MOB-004.
export default function InicioScreen() {
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
        <Text variant="bodyMedium" style={styles.erroTexto}>
          Verifique sua conexão e tente novamente.
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
      <AppTopBar titulo="Início" />

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

        {associado.status === "pendente_validacao" && (
          <Card style={[styles.card, styles.cardAviso]} mode="contained">
            <Card.Title
              title="Aguardando validação"
              left={(props) => <Avatar.Icon {...props} icon="clock-outline" style={styles.avatarAviso} />}
              titleStyle={styles.cardAvisoTitulo}
            />
            <Card.Content>
              <Text variant="bodyMedium">
                Seu cadastro está pendente de validação pela diretoria. Assim que for aprovado,
                você poderá usar todos os recursos do app.
              </Text>
            </Card.Content>
          </Card>
        )}

        {associado.status === "rejeitado" && (
          <Card style={[styles.card, styles.cardErro]} mode="contained">
            <Card.Title
              title="Cadastro não aprovado"
              left={(props) => <Avatar.Icon {...props} icon="close-circle-outline" style={styles.avatarErroCard} />}
              titleStyle={styles.cardErroTitulo}
            />
            <Card.Content>
              <Text variant="bodyMedium">
                Entre em contato com a diretoria para mais informações sobre seu cadastro.
              </Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card} mode="contained">
          <Card.Title title="Meus dados" left={(props) => <Avatar.Icon {...props} icon="account-details-outline" />} />
          <Card.Content style={styles.cardContent}>
            <InfoLinha icone="phone-outline" label="Contato" valor={associado.contato} />
            {associado.vinculoInstitucional && (
              <InfoLinha
                icone="domain"
                label="Vínculo institucional"
                valor={associado.vinculoInstitucional}
              />
            )}
          </Card.Content>
        </Card>
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
  erroTexto: { color: "#5B5147", textAlign: "center", marginTop: 4 },
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
  card: { borderRadius: 20, backgroundColor: "#FFFFFF" },
  cardAviso: { backgroundColor: "#FBF3E6" },
  cardAvisoTitulo: { color: "#B7791F", fontWeight: "700" },
  avatarAviso: { backgroundColor: "#F3E3C8" },
  cardErro: { backgroundColor: "#FBEAE9" },
  cardErroTitulo: { color: "#B3261E", fontWeight: "700" },
  avatarErroCard: { backgroundColor: "#F5D3D1" },
  cardContent: { gap: 12, paddingTop: 4 },
  infoLinha: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcone: { backgroundColor: "#F1EAE0" },
  infoLabel: { color: "#5B5147" },
});
