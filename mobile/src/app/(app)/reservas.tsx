import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { StatusReservaBadge } from "@/components/status-reserva-badge";
import { useMinhasReservas } from "@/features/reservas/use-minhas-reservas";
import type { ReservaDoAssociado } from "@/features/reservas/types";
import { paperTheme } from "@/theme/paper-theme";

const ROTULO_CANAL: Record<ReservaDoAssociado["canal"], string> = {
  app: "Reservada pelo app",
  mediado: "Registrada pela diretoria",
};

// RF13 (T-MOB-003) — leitura simples, sem mutation: valida o padrão de consumo da API antes das
// telas de reserva/pagamento (T-MOB-002/T-MOB-004). Só mostra reservas de mesa — ingressos do
// associado não têm endpoint equivalente ainda (fora do escopo de T-BE-012/T-BE-014).
export default function MinhasReservasScreen() {
  const { data: reservas, isLoading, isError, refetch, isRefetching } = useMinhasReservas();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppTopBar titulo="Minhas Reservas" />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Avatar.Icon icon="alert-circle-outline" size={56} style={styles.avatarErro} />
          <Text variant="titleMedium" style={styles.textoCentralizado}>
            Não foi possível carregar suas reservas
          </Text>
          <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 16 }}>
            Tentar de novo
          </Button>
        </View>
      )}

      {!isLoading && !isError && reservas && reservas.length === 0 && (
        <ScrollView
          contentContainerStyle={styles.centerScroll}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <Avatar.Icon
            icon="ticket-confirmation-outline"
            size={56}
            style={styles.avatarVazio}
            color={paperTheme.colors.primary}
          />
          <Text variant="titleMedium" style={styles.textoCentralizado}>
            Nenhuma reserva ainda
          </Text>
          <Text variant="bodyMedium" style={[styles.textoCentralizado, styles.textoMuted]}>
            Suas reservas de mesa em bailes e fandangos aparecem aqui.
          </Text>
        </ScrollView>
      )}

      {!isLoading && !isError && reservas && reservas.length > 0 && (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          {reservas.map((reserva) => (
            <ReservaCard key={reserva.id} reserva={reserva} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ReservaCard({ reserva }: { reserva: ReservaDoAssociado }) {
  const dataFormatada = reserva.evento
    ? new Date(reserva.evento.data).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.cardHeader}>
        <Text variant="titleMedium" style={styles.eventoNome}>
          {reserva.evento?.nome ?? "Evento não encontrado"}
        </Text>
        <StatusReservaBadge status={reserva.status} />
      </View>

      {dataFormatada && (
        <Text variant="bodyMedium" style={styles.textoMuted}>
          {dataFormatada} · {reserva.evento?.local}
        </Text>
      )}

      <View style={styles.detalhes}>
        <DetalheLinha
          icone="table-chair"
          texto={reserva.mesa ? `Mesa ${reserva.mesa.numero}` : "Mesa não encontrada"}
        />
        {reserva.nomeTitular && (
          <DetalheLinha icone="account-outline" texto={`Titular: ${reserva.nomeTitular}`} />
        )}
        <DetalheLinha icone="information-outline" texto={ROTULO_CANAL[reserva.canal]} />
      </View>
    </Surface>
  );
}

function DetalheLinha({ icone, texto }: { icone: string; texto: string }) {
  return (
    <View style={styles.detalheLinha}>
      <Avatar.Icon icon={icone} size={28} style={styles.detalheIcone} />
      <Text variant="bodyMedium">{texto}</Text>
    </View>
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
  detalhes: { marginTop: 4, gap: 8 },
  detalheLinha: { flexDirection: "row", alignItems: "center", gap: 10 },
  detalheIcone: { backgroundColor: "#F1EAE0" },
});
