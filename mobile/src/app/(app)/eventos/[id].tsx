import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, RadioButton, Snackbar, Surface, Text } from "react-native-paper";
import { MapaMesasCanvas, LEGENDA_MAPA } from "@/components/mapa-mesas-canvas";
import { ErrorSnackbar } from "@/components/error-snackbar";
import {
  useComprarMeuIngresso,
  useEventoPublicado,
  useMapaMesas,
  useSolicitarMinhaReserva,
} from "@/features/eventos/use-eventos";
import type { FormaPagamentoReserva, MesaNoMapa } from "@/features/eventos/types";
import { formatarDataHora, formatarMoeda } from "@/lib/format";
import { ApiError } from "@/lib/api-client";
import { paperTheme } from "@/theme/paper-theme";

export default function EventoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useEventoPublicado(id);
  const temSalao = !!data?.evento.salaoId;
  const { data: mesas } = useMapaMesas(temSalao ? id : "");

  const [mesaSelecionada, setMesaSelecionada] = useState<MesaNoMapa | null>(null);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text variant="titleMedium" style={styles.textoCentralizado}>
          Não foi possível carregar este evento.
        </Text>
      </View>
    );
  }

  const { evento, ingresso } = data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.card} elevation={1}>
        <Text variant="headlineSmall" style={styles.nome}>
          {evento.nome}
        </Text>
        <Text variant="bodyMedium" style={styles.textoMuted}>
          {formatarDataHora(evento.data)} · {evento.local}
        </Text>
        {evento.descricao && (
          <Text variant="bodyMedium" style={styles.descricao}>
            {evento.descricao}
          </Text>
        )}
      </Surface>

      {temSalao && (
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.tituloSecao}>
            Mapa de mesas
          </Text>
          <View style={styles.legenda}>
            {LEGENDA_MAPA.map(({ status, rotulo }) => (
              <Text key={status} variant="labelSmall" style={styles.textoMuted}>
                ● {rotulo}
              </Text>
            ))}
          </View>
          {mesas ? (
            <MapaMesasCanvas mesas={mesas} onMesaPress={setMesaSelecionada} />
          ) : (
            <ActivityIndicator style={{ marginVertical: 24 }} />
          )}
        </Surface>
      )}

      {ingresso && <IngressoCard eventoId={id} preco={ingresso.preco} />}

      <Portal>
        <Dialog visible={!!mesaSelecionada} onDismiss={() => setMesaSelecionada(null)}>
          {mesaSelecionada && (
            <ConteudoDialogMesa
              eventoId={id}
              mesa={mesaSelecionada}
              onFechar={() => setMesaSelecionada(null)}
            />
          )}
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

function ConteudoDialogMesa({
  eventoId,
  mesa,
  onFechar,
}: {
  eventoId: string;
  mesa: MesaNoMapa;
  onFechar: () => void;
}) {
  const reservar = useSolicitarMinhaReserva(eventoId);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoReserva>("online");

  return (
    <>
      <Dialog.Title>Mesa {mesa.numero}</Dialog.Title>
      <Dialog.Content style={{ gap: 8 }}>
        <Text variant="bodyMedium">
          {mesa.capacidade} lugares · {formatarMoeda(mesa.preco)}
        </Text>

        {mesa.status === "livre" ? (
          <>
            <Text variant="bodyMedium" style={{ marginTop: 8 }}>
              Como você vai pagar?
            </Text>
            <RadioButton.Group
              value={formaPagamento}
              onValueChange={(valor) => setFormaPagamento(valor as FormaPagamentoReserva)}
            >
              <RadioButton.Item label="Pagar online agora" value="online" />
              <RadioButton.Item label="Pagar presencial no evento" value="presencial" />
            </RadioButton.Group>
          </>
        ) : (
          <>
            <Text variant="bodyMedium" style={styles.textoMuted}>
              Titular: {mesa.nomeTitular ?? "—"}
            </Text>
            <Text variant="bodyMedium" style={styles.textoMuted}>
              Esta mesa já está {mesa.status === "pendente" ? "pendente" : "reservada"}.
            </Text>
          </>
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onFechar}>Fechar</Button>
        {mesa.status === "livre" && (
          <Button
            mode="contained"
            loading={reservar.isPending}
            disabled={reservar.isPending}
            onPress={() =>
              reservar.mutate(
                { mesaId: mesa.mesaId, formaPagamento },
                { onSuccess: onFechar },
              )
            }
          >
            Reservar
          </Button>
        )}
      </Dialog.Actions>
      <ErrorSnackbar
        visible={reservar.isError}
        mensagem={
          reservar.error instanceof ApiError
            ? reservar.error.message
            : "Não foi possível reservar a mesa. Tente novamente."
        }
        onDismiss={() => reservar.reset()}
      />
    </>
  );
}

function IngressoCard({ eventoId, preco }: { eventoId: string; preco: number }) {
  const comprar = useComprarMeuIngresso(eventoId);
  const [sucesso, setSucesso] = useState(false);

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="titleMedium" style={styles.tituloSecao}>
        Ingresso avulso
      </Text>
      <Text variant="headlineSmall" style={styles.preco}>
        {formatarMoeda(preco)}
      </Text>
      <Text variant="bodySmall" style={styles.textoMuted}>
        Preço de sócio, pago online — entrada única, sem mesa.
      </Text>
      <Button
        mode="contained"
        icon="ticket-outline"
        loading={comprar.isPending}
        disabled={comprar.isPending}
        onPress={() => comprar.mutate(undefined, { onSuccess: () => setSucesso(true) })}
        style={styles.botaoComprar}
      >
        Comprar ingresso
      </Button>

      <Snackbar visible={sucesso} onDismiss={() => setSucesso(false)} duration={4000}>
        Ingresso comprado! Apresente seu cadastro na entrada.
      </Snackbar>
      <ErrorSnackbar
        visible={comprar.isError}
        mensagem={
          comprar.error instanceof ApiError
            ? comprar.error.message
            : "Não foi possível comprar o ingresso. Tente novamente."
        }
        onDismiss={() => comprar.reset()}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FAF7F1",
  },
  textoCentralizado: { textAlign: "center" },
  textoMuted: { color: "#5B5147" },
  container: { padding: 20, gap: 12, paddingBottom: 110, backgroundColor: "#FAF7F1" },
  card: { borderRadius: 16, backgroundColor: "#FFFFFF", padding: 16, gap: 6 },
  nome: { color: "#2B241D", fontWeight: "700" },
  descricao: { color: "#2B241D", marginTop: 4 },
  tituloSecao: { color: "#2B241D", fontWeight: "700" },
  legenda: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 4 },
  preco: { color: "#7A2331", fontWeight: "700" },
  botaoComprar: { marginTop: 8, borderRadius: 12 },
});
