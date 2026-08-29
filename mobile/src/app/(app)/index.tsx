import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusAssociadoBadge } from "@/components/status-associado-badge";
import { useAuth } from "@/features/auth/auth-context";
import { useCurrentAssociado } from "@/features/associado/use-current-associado";

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
        <ActivityIndicator size="large" color="#7A2331" />
      </SafeAreaView>
    );
  }

  if (isError || !associado) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.erro}>Não foi possível carregar seu cadastro.</Text>
        <Button mode="outlined" onPress={() => refetch()} style={{ marginTop: 12 }}>
          Tentar de novo
        </Button>
        <Button mode="text" onPress={sair} style={{ marginTop: 4 }}>
          Sair
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={styles.nome}>
              {associado.nome}
            </Text>
            <Text variant="bodyMedium" style={styles.cpf}>
              CPF {associado.cpf}
            </Text>
          </View>
          <Button mode="text" onPress={sair} compact>
            Sair
          </Button>
        </View>

        <StatusAssociadoBadge status={associado.status} />

        {associado.status === "pendente_validacao" && (
          <Card style={[styles.card, styles.cardAviso]} mode="outlined">
            <Card.Content>
              <Text variant="bodyMedium">
                Seu cadastro está pendente de validação pela diretoria. Assim que for aprovado,
                você poderá usar todos os recursos do app.
              </Text>
            </Card.Content>
          </Card>
        )}

        {associado.status === "rejeitado" && (
          <Card style={[styles.card, styles.cardErro]} mode="outlined">
            <Card.Content>
              <Text variant="bodyMedium">
                Seu cadastro não foi aprovado. Entre em contato com a diretoria para mais
                informações.
              </Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card} mode="outlined">
          <Card.Content style={styles.cardContent}>
            <InfoLinha label="Contato" valor={associado.contato} />
            {associado.vinculoInstitucional && (
              <InfoLinha label="Vínculo institucional" valor={associado.vinculoInstitucional} />
            )}
          </Card.Content>
        </Card>

        {isRefetching && <ActivityIndicator style={{ marginTop: 12 }} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoLinha({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.infoLinha}>
      <Text variant="labelMedium" style={styles.infoLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium">{valor}</Text>
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
  erro: { color: "#B3261E", textAlign: "center" },
  container: { padding: 24, gap: 12 },
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  nome: { fontWeight: "700", color: "#2B241D" },
  cpf: { color: "#5B5147" },
  card: { backgroundColor: "#FFFFFF", borderColor: "#DDD0BC" },
  cardAviso: { borderColor: "#B7791F", backgroundColor: "#FBF3E6" },
  cardErro: { borderColor: "#B3261E", backgroundColor: "#FBEAE9" },
  cardContent: { gap: 12 },
  infoLinha: { gap: 2 },
  infoLabel: { color: "#5B5147" },
});
