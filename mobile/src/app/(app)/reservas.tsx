import { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Dialog, Portal, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { ErrorSnackbar } from "@/components/error-snackbar";
import { StatusReservaBadge } from "@/components/status-reserva-badge";
import { useMinhasReservas } from "@/features/reservas/use-minhas-reservas";
import { useCancelarMinhaReserva } from "@/features/reservas/use-cancelar-minha-reserva";
import type { ReservaDoAssociado } from "@/features/reservas/types";
import { ApiError } from "@/lib/api-client";
import { paperTheme } from "@/theme/paper-theme";

const ROTULO_CANAL: Record<ReservaDoAssociado["canal"], string> = {
  app: "Reservada pelo app",
  mediado: "Registrada pela diretoria",
};

const EXPLICACAO_STATUS: Record<ReservaDoAssociado["status"], string | null> = {
  confirmada: null,
  pendente: "Aguardando pagamento presencial — leve o valor da mesa no dia do evento.",
  cancelada: null,
};

// RF13 (T-MOB-003) — leitura simples, sem mutation: valida o padrão de consumo da API antes das
// telas de reserva/pagamento (T-MOB-002/T-MOB-004). Só mostra reservas de mesa — ingressos têm
// tela própria (aba "Ingressos", ver ingressos.tsx), com o QR de check-in.
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
  const [confirmarCancelamento, setConfirmarCancelamento] = useState(false);
  const cancelar = useCancelarMinhaReserva();

  const dataFormatada = reserva.evento
    ? new Date(reserva.evento.data).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;
  const explicacao = EXPLICACAO_STATUS[reserva.status];
  const podeCancelar = reserva.status !== "cancelada";

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

      {explicacao && (
        <Text variant="bodySmall" style={styles.textoExplicacao}>
          {explicacao}
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

      {podeCancelar && (
        <Button
          mode="outlined"
          icon="close-circle-outline"
          textColor="#B3261E"
          style={styles.botaoCancelar}
          onPress={() => setConfirmarCancelamento(true)}
        >
          Cancelar reserva
        </Button>
      )}

      <Portal>
        <Dialog visible={confirmarCancelamento} onDismiss={() => setConfirmarCancelamento(false)}>
          <Dialog.Title>Cancelar reserva?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              A mesa {reserva.mesa ? `${reserva.mesa.numero} ` : ""}fica livre pra outra pessoa
              reservar. Essa ação não pode ser desfeita pelo app.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmarCancelamento(false)} disabled={cancelar.isPending}>
              Voltar
            </Button>
            <Button
              textColor="#B3261E"
              loading={cancelar.isPending}
              disabled={cancelar.isPending}
              onPress={() =>
                cancelar.mutate(reserva.id, {
                  onSuccess: () => setConfirmarCancelamento(false),
                })
              }
            >
              Cancelar reserva
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ErrorSnackbar
        visible={cancelar.isError}
        mensagem={
          cancelar.error instanceof ApiError
            ? cancelar.error.message
            : "Não foi possível cancelar a reserva. Tente novamente."
        }
        onDismiss={() => cancelar.reset()}
      />
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
  textoExplicacao: { color: "#8A5A1F", backgroundColor: "#F3E3C8", padding: 8, borderRadius: 8 },
  botaoCancelar: { marginTop: 8, borderColor: "#B3261E" },
});
