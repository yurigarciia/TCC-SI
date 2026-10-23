import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { MapaMesasCanvas, LEGENDA_MAPA } from "@/components/mapa-mesas-canvas";
import { useEventoPublicado, useMapaMesas } from "@/features/eventos/use-eventos";
import { formatarDataHora } from "@/lib/format";
import { paperTheme } from "@/theme/paper-theme";

// RF11/RF12/RF14 (T-MOB-004) — detalhe do evento. Achado numa conversa com o usuário: a versão
// anterior misturava três coisas na mesma tela — descrição, um croqui "tocável" que já abria um
// modal de reserva, e um botão que abria OUTRO modal com um assistente de várias etapas. Agora: o
// croqui aqui é só pra consulta (MapaMesasCanvas com `interativo={false}`, sem abrir nada ao tocar
// numa mesa) e um único botão leva pra tela cheia dedicada (comprar.tsx) que reúne reserva de
// mesa e compra de ingresso avulso — são a mesma decisão de compra, não duas jornadas separadas
// (outro achado do usuário: destinos diferentes pra cada uma era pior, não melhor). Nenhum
// Dialog/Portal nessa tela nem na de destino.
export default function EventoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useEventoPublicado(id);
  const temSalao = !!data?.evento.salaoId;
  const { data: mesas } = useMapaMesas(temSalao ? id : "");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <AppTopBar titulo="Evento" onVoltar={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <AppTopBar titulo="Evento" onVoltar={() => router.back()} />
        <View style={styles.center}>
          <Text variant="titleMedium" style={styles.textoCentralizado}>
            Não foi possível carregar este evento.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { evento, ingresso } = data;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <AppTopBar titulo={evento.nome} onVoltar={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Surface style={styles.card} elevation={1}>
          <Text variant="bodyMedium" style={styles.textoMuted}>
            {formatarDataHora(evento.data)} · {evento.local}
          </Text>
          {evento.descricao && (
            <Text variant="bodyMedium" style={styles.descricao}>
              {evento.descricao}
            </Text>
          )}
        </Surface>

        {(temSalao || ingresso) && (
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleMedium" style={styles.tituloSecao}>
              Ingressos e mesas
            </Text>
            <Text variant="bodyMedium" style={styles.textoMuted}>
              Reserve uma mesa com seu grupo, ou compre ingresso avulso pra você e seus
              acompanhantes.
            </Text>
            <Button
              mode="contained"
              icon="ticket-outline"
              onPress={() => router.push({ pathname: "/eventos/[id]/comprar", params: { id } })}
              contentStyle={styles.botaoConteudo}
              style={styles.botao}
            >
              Comprar ingressos / Reservar mesa
            </Button>
          </Surface>
        )}

        {temSalao && (
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleMedium" style={styles.tituloSecao}>
              Mapa de mesas
            </Text>
            <Text variant="bodySmall" style={[styles.textoMuted, { marginBottom: 4 }]}>
              Só pra consulta — use o botão &quot;Comprar ingressos / Reservar mesa&quot; acima
              pra escolher a sua.
            </Text>
            <View style={styles.legenda}>
              {LEGENDA_MAPA.map(({ status, rotulo }) => (
                <Text key={status} variant="labelSmall" style={styles.textoMuted}>
                  ● {rotulo}
                </Text>
              ))}
            </View>
            {mesas ? (
              <MapaMesasCanvas mesas={mesas} interativo={false} onMesaPress={() => {}} />
            ) : (
              <ActivityIndicator style={{ marginVertical: 24 }} />
            )}
          </Surface>
        )}
      </ScrollView>
    </SafeAreaView>
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
  textoCentralizado: { textAlign: "center" },
  textoMuted: { color: "#5B5147" },
  container: { padding: 20, gap: 12, paddingBottom: 110 },
  card: { borderRadius: 16, backgroundColor: "#FFFFFF", padding: 16, gap: 6 },
  descricao: { color: "#2B241D", marginTop: 4 },
  tituloSecao: { color: "#2B241D", fontWeight: "700" },
  legenda: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 4 },
  botao: { borderRadius: 12 },
  botaoConteudo: { paddingVertical: 4 },
});
