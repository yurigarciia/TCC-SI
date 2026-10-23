import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Chip, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { MapaMesasCanvas, LEGENDA_MAPA } from "@/components/mapa-mesas-canvas";
import { useEventoPublicado, useMapaMesas } from "@/features/eventos/use-eventos";
import { formatarData } from "@/lib/format";
import { cores, paperTheme } from "@/theme/paper-theme";

// RF11/RF12/RF14 (T-MOB-004) — detalhe do evento. Achado numa conversa com o usuário: a versão
// anterior misturava três coisas na mesma tela — descrição, um croqui "tocável" que já abria um
// modal de reserva, e um botão que abria OUTRO modal com um assistente de várias etapas. Agora: o
// croqui aqui é só pra consulta (MapaMesasCanvas com `interativo={false}`, sem abrir nada ao tocar
// numa mesa) e um único botão leva pra tela cheia dedicada (comprar.tsx) que reúne reserva de
// mesa e compra de ingresso avulso — são a mesma decisão de compra, não duas jornadas separadas
// (outro achado do usuário: destinos diferentes pra cada uma era pior, não melhor). Nenhum
// Dialog/Portal nessa tela nem na de destino.
//
// Segunda rodada — achado numa conversa com o usuário: a tela tinha título pequeno dividido com o
// botão de voltar, data/local espremidos numa linha só, sem hierarquia nenhuma. Agora: título em
// destaque no corpo (o do AppTopBar continua existindo, mas pequeno, como contexto de navegação),
// badges dedicados pra data e local, descrição num cartão próprio, e um CTA de ingresso que se
// destaca visualmente dos demais cartões (fundo na cor primária, não branco).
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
        <View style={styles.hero}>
          <Text variant="headlineSmall" style={styles.tituloHero}>
            {evento.nome}
          </Text>
          <View style={styles.badges}>
            <Chip
              icon="calendar-blank-outline"
              style={styles.badge}
              textStyle={styles.badgeTexto}
            >
              {formatarData(evento.data)}
            </Chip>
            <Chip icon="map-marker-outline" style={styles.badge} textStyle={styles.badgeTexto}>
              {evento.local}
            </Chip>
          </View>
        </View>

        {evento.descricao && (
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleMedium" style={styles.tituloSecao}>
              Sobre o evento
            </Text>
            <Text variant="bodyMedium" style={styles.descricao}>
              {evento.descricao}
            </Text>
          </Surface>
        )}

        {(temSalao || ingresso) && (
          <Pressable
            onPress={() => router.push({ pathname: "/eventos/[id]/comprar", params: { id } })}
          >
            <View style={styles.cta}>
              <View style={styles.ctaIconeWrap}>
                <MaterialCommunityIcons name="ticket-confirmation-outline" size={26} color={cores.primaria} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={styles.ctaTitulo}>
                  Comprar ingressos / Reservar mesa
                </Text>
                <Text variant="bodySmall" style={styles.ctaSubtitulo}>
                  Garanta sua presença e a dos seus acompanhantes
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#FDF8F3" />
            </View>
          </Pressable>
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
  container: { padding: 20, gap: 14, paddingBottom: 110 },
  hero: { gap: 10 },
  tituloHero: { color: "#2B241D", fontWeight: "700" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DDD0BC" },
  badgeTexto: { color: "#2B241D", fontWeight: "600" },
  card: { borderRadius: 16, backgroundColor: "#FFFFFF", padding: 16, gap: 6 },
  descricao: { color: "#2B241D", lineHeight: 21 },
  tituloSecao: { color: "#2B241D", fontWeight: "700" },
  legenda: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 4 },
  // CTA de destaque — fundo na cor primária (não branco, diferente dos demais cartões) pra chamar
  // mais atenção que o resto da tela, já que é a ação principal do evento.
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: cores.primaria,
    borderRadius: 18,
    padding: 16,
    elevation: 3,
    shadowColor: cores.primariaEscura,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  ctaIconeWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FDF8F3",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTitulo: { color: "#FDF8F3", fontWeight: "700" },
  ctaSubtitulo: { color: "rgba(253, 248, 243, 0.85)", marginTop: 2 },
});
