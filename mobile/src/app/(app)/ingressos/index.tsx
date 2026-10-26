import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Dialog,
  Portal,
  SegmentedButtons,
  Surface,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { ErrorSnackbar } from "@/components/error-snackbar";
import { StatusIngressoBadge } from "@/components/status-ingresso-badge";
import { StatusReservaBadge } from "@/components/status-reserva-badge";
import { useMeusIngressos } from "@/features/ingressos/use-meus-ingressos";
import type { IngressoDoAssociado } from "@/features/ingressos/types";
import { useMinhasReservas } from "@/features/reservas/use-minhas-reservas";
import { useCancelarMinhaReserva } from "@/features/reservas/use-cancelar-minha-reserva";
import type { ReservaDoAssociado } from "@/features/reservas/types";
import { ApiError } from "@/lib/api-client";
import { paperTheme } from "@/theme/paper-theme";

// Aba única "Ingressos e Mesas" — achado numa conversa com o usuário: ingresso avulso e reserva
// de mesa são as duas formas de garantir presença num evento, então viver em abas separadas da
// navbar era uma divisão artificial. Um SegmentedButtons alterna entre as duas listas na mesma
// tela; cada uma mantém sua própria tela de detalhe/ação (QR em ingressos/[id].tsx, cancelamento
// aqui mesmo pra reserva).
export default function IngressosEReservasScreen() {
  const { modo: modoInicial } = useLocalSearchParams<{ modo?: string }>();
  const [modo, setModo] = useState<"ingressos" | "mesas">(
    modoInicial === "mesas" ? "mesas" : "ingressos",
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <AppTopBar titulo="Ingressos e Mesas" />
      <View style={styles.segmentedWrapper}>
        <SegmentedButtons
          value={modo}
          onValueChange={(v) => setModo(v as "ingressos" | "mesas")}
          buttons={[
            { value: "ingressos", label: "Ingressos", icon: "qrcode" },
            { value: "mesas", label: "Mesas", icon: "table-chair" },
          ]}
        />
      </View>
      {modo === "ingressos" ? <ListaIngressos /> : <ListaReservas />}
    </SafeAreaView>
  );
}

function ListaIngressos() {
  const { data: ingressos, isLoading, isError, refetch, isRefetching } = useMeusIngressos();

  return (
    <>
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
            Ingressos comprados pelo app aparecem aqui. Toque num ingresso pra ver o QR da entrada.
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
    </>
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
    <Pressable
      onPress={() => router.push({ pathname: "/ingressos/[id]", params: { id: ingresso.id } })}
    >
      <Surface style={styles.card} elevation={1}>
        <View style={styles.cardTopo}>
          <StatusIngressoBadge status={ingresso.status} />
        </View>

        <Text variant="titleMedium" style={styles.nomeComprador} numberOfLines={1}>
          {ingresso.nomeComprador}
        </Text>

        <Text variant="bodyMedium" style={styles.eventoNome} numberOfLines={1}>
          {ingresso.evento?.nome ?? "Evento não encontrado"}
        </Text>

        {dataFormatada && (
          <Text variant="bodySmall" style={styles.textoMuted}>
            {dataFormatada}
            {ingresso.evento?.local ? ` · ${ingresso.evento.local}` : ""}
          </Text>
        )}
      </Surface>
    </Pressable>
  );
}

const ROTULO_CANAL: Record<ReservaDoAssociado["canal"], string> = {
  app: "Reservada pelo app",
  mediado: "Registrada pela diretoria",
};

const EXPLICACAO_STATUS: Record<ReservaDoAssociado["status"], string | null> = {
  confirmada: null,
  pendente: "Aguardando pagamento presencial — leve o valor da mesa no dia do evento.",
  cancelada: null,
};

function ListaReservas() {
  const { data: reservas, isLoading, isError, refetch, isRefetching } = useMinhasReservas();

  return (
    <>
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
            icon="table-chair"
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
    </>
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
      <View style={styles.cardTopo}>
        <StatusReservaBadge status={reserva.status} />
      </View>

      <Text variant="titleMedium" style={styles.eventoNome} numberOfLines={1}>
        {reserva.evento?.nome ?? "Evento não encontrado"}
      </Text>

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
  segmentedWrapper: { paddingHorizontal: 20, paddingTop: 12 },
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
    gap: 4,
  },
  // Badge na própria linha (alinhada à direita) — achado numa conversa com o usuário: dividir a
  // linha com o nome/evento espremia o texto até sumir quando o rótulo do status era mais largo
  // que o esperado.
  cardTopo: { alignItems: "flex-end" },
  nomeComprador: { fontWeight: "700", color: "#2B241D" },
  eventoNome: { fontWeight: "700", color: "#2B241D" },
  textoExplicacao: { color: "#8A5A1F", backgroundColor: "#F3E3C8", padding: 8, borderRadius: 8 },
  detalhes: { marginTop: 4, gap: 8 },
  detalheLinha: { flexDirection: "row", alignItems: "center", gap: 10 },
  detalheIcone: { backgroundColor: "#F1EAE0" },
  botaoCancelar: { marginTop: 8, borderColor: "#B3261E" },
});
