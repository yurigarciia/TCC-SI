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
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { useEventosPublicados } from "@/features/eventos/use-eventos";
import { formatarData } from "@/lib/format";
import { paperTheme } from "@/theme/paper-theme";

// RF13 — vitrine de eventos publicados (bailes/fandangos), ponto de entrada pro detalhe em
// (app)/eventos/[id]/index.tsx (de onde saem as telas dedicadas de RF11/reservar mesa e
// RF12/comprar ingresso). Estrutura (SafeAreaView +
// AppTopBar + corpo condicional por estado) padronizada com as outras abas — achado numa conversa
// com o usuário: esta tela tinha cabeçalho nativo do Stack (cor/estilo diferente das demais) e,
// sem um wrapper com `flex: 1`, o fundo correto só cobria a área do conteúdo, deixando um resto
// da tela com a cor de fundo padrão (branca) quando a lista era curta.
export default function EventosPublicadosScreen() {
  const { data: eventos, isLoading, isError, refetch, isRefetching } = useEventosPublicados();

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <AppTopBar titulo="Eventos" />

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Avatar.Icon icon="alert-circle-outline" size={56} style={styles.avatarErro} />
          <Text variant="titleMedium" style={styles.textoCentralizado}>
            Não foi possível carregar os eventos
          </Text>
          <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 16 }}>
            Tentar de novo
          </Button>
        </View>
      )}

      {!isLoading && !isError && eventos && eventos.length === 0 && (
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
      )}

      {!isLoading && !isError && eventos && eventos.length > 0 && (
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
      )}
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
  card: { borderRadius: 16, backgroundColor: "#FFFFFF", padding: 16, gap: 4 },
  nome: { color: "#2B241D", fontWeight: "700" },
});
