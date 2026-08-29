import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { ErrorSnackbar } from "@/components/error-snackbar";
import { StatusMensalidadeBadge } from "@/components/status-mensalidade-badge";
import { useMinhasMensalidades, usePagarMinhaMensalidadeOnline } from "@/features/mensalidades/use-mensalidades";
import type { Mensalidade } from "@/features/mensalidades/types";
import { formatarCompetencia, formatarData, formatarMoeda } from "@/lib/format";
import { ApiError } from "@/lib/api-client";
import { paperTheme } from "@/theme/paper-theme";

// RF05/RF06/RF08 (T-MOB-002) — situação atual em destaque (a mensalidade mais recente que ainda
// não está paga, se houver) + histórico completo abaixo. "Pagar online" encadeia iniciar+confirmar
// num só toque (ver comentário em usePagarMinhaMensalidadeOnline sobre o gateway fake atual).
export default function MensalidadeScreen() {
  const { data: mensalidades, isLoading, isError, refetch, isRefetching } = useMinhasMensalidades();
  const pagar = usePagarMinhaMensalidadeOnline();

  const ordenadas = [...(mensalidades ?? [])].sort((a, b) =>
    b.competencia.localeCompare(a.competencia),
  );
  const emAberto = ordenadas.find((m) => m.status !== "paga");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppTopBar titulo="Mensalidade" />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Avatar.Icon icon="alert-circle-outline" size={56} style={styles.avatarErro} />
          <Text variant="titleMedium" style={styles.textoCentralizado}>
            Não foi possível carregar suas mensalidades
          </Text>
          <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 16 }}>
            Tentar de novo
          </Button>
        </View>
      )}

      {!isLoading && !isError && (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <Surface style={styles.heroCard} elevation={1}>
            {emAberto ? (
              <>
                <View style={styles.heroHeader}>
                  <Text variant="titleMedium" style={styles.heroTitulo}>
                    {formatarCompetencia(emAberto.competencia)}
                  </Text>
                  <StatusMensalidadeBadge status={emAberto.status} />
                </View>
                <Text variant="headlineSmall" style={styles.valor}>
                  {formatarMoeda(emAberto.valor)}
                </Text>
                <Text variant="bodyMedium" style={styles.textoMuted}>
                  Vencimento: {formatarData(emAberto.vencimento)}
                </Text>
                <Button
                  mode="contained"
                  icon="credit-card-outline"
                  onPress={() => pagar.mutate(emAberto.id)}
                  loading={pagar.isPending}
                  disabled={pagar.isPending}
                  style={styles.botaoPagar}
                  contentStyle={styles.botaoPagarConteudo}
                >
                  Pagar online
                </Button>
              </>
            ) : (
              <View style={styles.emDia}>
                <Avatar.Icon
                  icon="check-circle-outline"
                  size={56}
                  style={styles.avatarEmDia}
                  color={paperTheme.colors.primary}
                />
                <Text variant="titleMedium" style={styles.textoCentralizado}>
                  Você está em dia!
                </Text>
                <Text variant="bodyMedium" style={[styles.textoCentralizado, styles.textoMuted]}>
                  Nenhuma mensalidade pendente no momento.
                </Text>
              </View>
            )}
          </Surface>

          {ordenadas.length > 0 && (
            <>
              <Text variant="titleMedium" style={styles.tituloHistorico}>
                Histórico
              </Text>
              {ordenadas.map((mensalidade) => (
                <MensalidadeCard key={mensalidade.id} mensalidade={mensalidade} />
              ))}
            </>
          )}
        </ScrollView>
      )}

      <ErrorSnackbar
        visible={pagar.isError}
        mensagem={
          pagar.error instanceof ApiError
            ? pagar.error.message
            : "Não foi possível confirmar o pagamento. Tente novamente."
        }
        onDismiss={() => pagar.reset()}
      />
    </SafeAreaView>
  );
}

function MensalidadeCard({ mensalidade }: { mensalidade: Mensalidade }) {
  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.cardHeader}>
        <Text variant="titleSmall" style={styles.cardTitulo}>
          {formatarCompetencia(mensalidade.competencia)}
        </Text>
        <StatusMensalidadeBadge status={mensalidade.status} />
      </View>
      <Text variant="bodyMedium" style={styles.textoMuted}>
        {formatarMoeda(mensalidade.valor)} · Vencimento {formatarData(mensalidade.vencimento)}
      </Text>
      {mensalidade.status === "paga" && mensalidade.pagoEm && (
        <Text variant="bodySmall" style={styles.textoPago}>
          Pago em {formatarData(mensalidade.pagoEm)} ·{" "}
          {mensalidade.formaPagamento === "online" ? "Online" : "Presencial"}
        </Text>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F1" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  avatarErro: { backgroundColor: "#FBEAE9", marginBottom: 8 },
  textoCentralizado: { textAlign: "center" },
  textoMuted: { color: "#5B5147" },
  container: { padding: 20, gap: 12, paddingBottom: 110 },
  heroCard: { borderRadius: 20, backgroundColor: "#FFFFFF", padding: 20, gap: 6 },
  heroHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroTitulo: { color: "#2B241D", fontWeight: "700" },
  valor: { color: "#7A2331", fontWeight: "700" },
  botaoPagar: { marginTop: 12, borderRadius: 12 },
  botaoPagarConteudo: { paddingVertical: 6 },
  emDia: { alignItems: "center", gap: 4, paddingVertical: 8 },
  avatarEmDia: { backgroundColor: "#F1D9DC", marginBottom: 4 },
  tituloHistorico: { color: "#2B241D", fontWeight: "700", marginTop: 8 },
  card: { borderRadius: 16, backgroundColor: "#FFFFFF", padding: 16, gap: 4 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitulo: { color: "#2B241D", fontWeight: "600" },
  textoPago: { color: "#3E7A50", marginTop: 2 },
});
