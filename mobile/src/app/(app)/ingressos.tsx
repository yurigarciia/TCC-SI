import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { AppTopBar } from "@/components/app-top-bar";
import { StatusIngressoBadge } from "@/components/status-ingresso-badge";
import { useMeusIngressos } from "@/features/ingressos/use-meus-ingressos";
import type { IngressoDoAssociado } from "@/features/ingressos/types";
import { formatarMoeda } from "@/lib/format";
import { paperTheme } from "@/theme/paper-theme";

// "Meus Ingressos" — achado numa conversa com o usuário: comprar ingresso pelo app só mostrava
// um Snackbar de sucesso passageiro, sem nenhum jeito de reabrir depois. O QR mostrado aqui é o
// próprio id do ingresso (mesmo valor que POST /ingressos/:id/checkin espera, e que o scanner da
// diretoria no painel web já lê) — não é um código novo, só a forma de apresentar o que já
// existia. Ingresso "usado" não precisa mais do QR (entrada já validada), então fica recolhido.
export default function MeusIngressosScreen() {
  const { data: ingressos, isLoading, isError, refetch, isRefetching } = useMeusIngressos();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppTopBar titulo="Meus Ingressos" />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Avatar.Icon icon="alert-circle-outline" size={56} style={styles.avatarErro} />
          <Text variant="titleMedium" style={styles.textoCentralizado}>
            Não foi possível carregar seus ingressos
          </Text>
          <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 16 }}>
            Tentar de novo
          </Button>
        </View>
      )}

      {!isLoading && !isError && ingressos && ingressos.length === 0 && (
        <ScrollView
          contentContainerStyle={styles.centerScroll}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <Avatar.Icon
            icon="qrcode"
            size={56}
            style={styles.avatarVazio}
            color={paperTheme.colors.primary}
          />
          <Text variant="titleMedium" style={styles.textoCentralizado}>
            Nenhum ingresso ainda
          </Text>
          <Text variant="bodyMedium" style={[styles.textoCentralizado, styles.textoMuted]}>
            Ingressos comprados pelo app aparecem aqui, com o QR pra mostrar na entrada.
          </Text>
        </ScrollView>
      )}

      {!isLoading && !isError && ingressos && ingressos.length > 0 && (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          {ingressos.map((ingresso) => (
            <IngressoCard key={ingresso.id} ingresso={ingresso} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function IngressoCard({ ingresso }: { ingresso: IngressoDoAssociado }) {
  const dataFormatada = ingresso.evento
    ? new Date(ingresso.evento.data).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.cardHeader}>
        <Text variant="titleMedium" style={styles.eventoNome}>
          {ingresso.evento?.nome ?? "Evento não encontrado"}
        </Text>
        <StatusIngressoBadge status={ingresso.status} />
      </View>

      {dataFormatada && (
        <Text variant="bodyMedium" style={styles.textoMuted}>
          {dataFormatada} · {ingresso.evento?.local}
        </Text>
      )}

      <Text variant="bodyMedium" style={styles.textoMuted}>
        {formatarMoeda(ingresso.preco)}
      </Text>

      {ingresso.status === "emitido" ? (
        <View style={styles.qrContainer}>
          <QRCode value={ingresso.id} size={180} />
          <Text variant="bodySmall" style={[styles.textoCentralizado, styles.textoMuted]}>
            Mostre esse QR na entrada
          </Text>
        </View>
      ) : (
        <Text variant="bodySmall" style={styles.textoMuted}>
          Entrada já validada
          {ingresso.usadoEm &&
            ` em ${new Date(ingresso.usadoEm).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}`}
        </Text>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F1" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  centerScroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingBottom: 110,
  },
  avatarErro: { backgroundColor: "#FBEAE9", marginBottom: 8 },
  avatarVazio: { backgroundColor: "#F1D9DC", marginBottom: 8 },
  textoCentralizado: { textAlign: "center" },
  textoMuted: { color: "#5B5147" },
  container: { padding: 20, gap: 12, paddingBottom: 110 },
  card: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  eventoNome: { flex: 1, fontWeight: "700", color: "#2B241D" },
  qrContainer: {
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: "#F1EAE0",
    borderRadius: 16,
  },
});
