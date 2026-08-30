import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Avatar, Button, Surface, Text } from "react-native-paper";
import { useEventosPublicados } from "@/features/eventos/use-eventos";
import { formatarData } from "@/lib/format";
import { paperTheme } from "@/theme/paper-theme";

// RF13 — vitrine de eventos publicados (bailes/fandangos), ponto de entrada pra RF11 (reservar
// mesa) e RF12 (comprar ingresso), ambos em (app)/eventos/[id].tsx.
export default function EventosPublicadosScreen() {
  const { data: eventos, isLoading, isError, refetch, isRefetching } = useEventosPublicados();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Avatar.Icon icon="alert-circle-outline" size={56} style={styles.avatarErro} />
        <Text variant="titleMedium" style={styles.textoCentralizado}>
          Não foi possível carregar os eventos
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 16 }}>
          Tentar de novo
        </Button>
      </View>
    );
  }

  if (!eventos || eventos.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.centerScroll}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <Avatar.Icon
          icon="calendar-blank-outline"
          size={56}
          style={styles.avatarVazio}
          color={paperTheme.colors.primary}
        />
        <Text variant="titleMedium" style={styles.textoCentralizado}>
          Nenhum evento publicado
        </Text>
        <Text variant="bodyMedium" style={[styles.textoCentralizado, styles.textoMuted]}>
          Volte aqui quando a diretoria publicar o próximo baile ou fandango.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {eventos.map((evento) => (
        <Pressable
          key={evento.id}
          onPress={() => router.push({ pathname: "/eventos/[id]", params: { id: evento.id } })}
        >
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleMedium" style={styles.nome}>
              {evento.nome}
            </Text>
            <Text variant="bodyMedium" style={styles.textoMuted}>
              {formatarData(evento.data)} · {evento.local}
            </Text>
          </Surface>
        </Pressable>
      ))}
    </ScrollView>
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
  centerScroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingBottom: 110,
    backgroundColor: "#FAF7F1",
  },
  avatarErro: { backgroundColor: "#FBEAE9", marginBottom: 8 },
  avatarVazio: { backgroundColor: "#F1D9DC", marginBottom: 8 },
  textoCentralizado: { textAlign: "center" },
  textoMuted: { color: "#5B5147" },
  container: { padding: 20, gap: 12, paddingBottom: 110, backgroundColor: "#FAF7F1" },
  card: { borderRadius: 16, backgroundColor: "#FFFFFF", padding: 16, gap: 4 },
  nome: { color: "#2B241D", fontWeight: "700" },
});
