import { router } from "expo-router";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { useAuth } from "@/features/auth/auth-context";
import { useCurrentAssociado } from "@/features/associado/use-current-associado";
import { useEventosPublicados } from "@/features/eventos/use-eventos";
import { formatarData } from "@/lib/format";
import { paperTheme } from "@/theme/paper-theme";

// Tela inicial — achado numa conversa com o usuário: a versão anterior (avatar + CPF + "Meus
// dados") competia pela atenção com o que a pessoa realmente abre o app todo dia pra ver.
// Identidade/dados cadastrais e "Sair" se mudaram pra aba Perfil (ver (app)/perfil.tsx); aqui fica
// só a saudação e, pelo menos, os próximos eventos — o resto (avisos de status, outras seções)
// continua podendo crescer abaixo sem disputar espaço com o cabeçalho.
export default function InicioScreen() {
  const { sair } = useAuth();
  const { data: associado, isLoading, isError, refetch, isRefetching } = useCurrentAssociado();
  const { data: eventos } = useEventosPublicados();

  const proximosEventos = [...(eventos ?? [])]
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !associado) {
    return (
      <SafeAreaView style={styles.center}>
        <Avatar.Icon icon="alert-circle-outline" size={56} style={styles.avatarErro} />
        <Text variant="titleMedium" style={styles.erroTitulo}>
          Não foi possível carregar seu cadastro
        </Text>
        <Text variant="bodyMedium" style={styles.erroTexto}>
          Verifique sua conexão e tente novamente.
        </Text>
        <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 16 }}>
          Tentar de novo
        </Button>
        <Button mode="text" onPress={sair} style={{ marginTop: 4 }}>
          Sair
        </Button>
      </SafeAreaView>
    );
  }

  const primeiroNome = associado.nome.split(" ")[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <AppTopBar titulo="Início" />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <Text variant="headlineSmall" style={styles.saudacao}>
          Seja bem-vindo(a), {primeiroNome}
        </Text>

        {associado.status === "pendente_validacao" && (
          <Surface style={[styles.card, styles.cardAviso]} elevation={1}>
            <View style={styles.cardTitulo}>
              <Avatar.Icon icon="clock-outline" size={36} style={styles.avatarAviso} />
              <Text variant="titleMedium" style={styles.cardAvisoTitulo}>
                Aguardando validação
              </Text>
            </View>
            <Text variant="bodyMedium">
              Seu cadastro está pendente de validação pela diretoria. Assim que for aprovado,
              você poderá usar todos os recursos do app.
            </Text>
          </Surface>
        )}

        {associado.status === "rejeitado" && (
          <Surface style={[styles.card, styles.cardErro]} elevation={1}>
            <View style={styles.cardTitulo}>
              <Avatar.Icon icon="close-circle-outline" size={36} style={styles.avatarErroCard} />
              <Text variant="titleMedium" style={styles.cardErroTitulo}>
                Cadastro não aprovado
              </Text>
            </View>
            <Text variant="bodyMedium">
              Entre em contato com a diretoria para mais informações sobre seu cadastro.
            </Text>
          </Surface>
        )}

        <View style={styles.secaoEventos}>
          <View style={styles.secaoEventosHeader}>
            <Text variant="titleMedium" style={styles.secaoEventosTitulo}>
              Próximos eventos
            </Text>
            <Button mode="text" compact onPress={() => router.push("/eventos")}>
              Ver todos
            </Button>
          </View>

          {proximosEventos.length === 0 ? (
            <Surface style={[styles.cardEvento, styles.cardEventoVazio]} elevation={1}>
              <Text variant="bodyMedium" style={styles.textoMuted}>
                Nenhum evento publicado no momento. Volte aqui quando a diretoria publicar o
                próximo baile ou fandango.
              </Text>
            </Surface>
          ) : (
            proximosEventos.map((evento) => (
              <Pressable
                key={evento.id}
                onPress={() =>
                  router.push({ pathname: "/eventos/[id]", params: { id: evento.id } })
                }
              >
                <Surface style={styles.cardEvento} elevation={1}>
                  <Avatar.Icon icon="calendar-star" size={40} style={styles.avatarEvento} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" style={styles.eventoNome} numberOfLines={1}>
                      {evento.nome}
                    </Text>
                    <Text variant="bodySmall" style={styles.textoMuted}>
                      {formatarData(evento.data)} · {evento.local}
                    </Text>
                  </View>
                </Surface>
              </Pressable>
            ))
          )}
        </View>
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
    backgroundColor: "#FAF7F1",
    padding: 24,
  },
  avatarErro: { backgroundColor: "#FBEAE9", marginBottom: 8 },
  erroTitulo: { textAlign: "center" },
  erroTexto: { color: "#5B5147", textAlign: "center", marginTop: 4 },
  container: { padding: 20, gap: 16, paddingBottom: 110 },
  saudacao: { color: "#2B241D", fontWeight: "700" },
  card: { borderRadius: 20, backgroundColor: "#FFFFFF", padding: 20, gap: 10 },
  cardTitulo: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardAviso: { backgroundColor: "#FBF3E6" },
  cardAvisoTitulo: { color: "#B7791F", fontWeight: "700" },
  avatarAviso: { backgroundColor: "#F3E3C8" },
  cardErro: { backgroundColor: "#FBEAE9" },
  cardErroTitulo: { color: "#B3261E", fontWeight: "700" },
  avatarErroCard: { backgroundColor: "#F5D3D1" },
  textoMuted: { color: "#5B5147" },
  secaoEventos: { gap: 10 },
  secaoEventosHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secaoEventosTitulo: { color: "#2B241D", fontWeight: "700" },
  cardEvento: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  cardEventoVazio: { backgroundColor: "#F1EAE0" },
  avatarEvento: { backgroundColor: "#DCEADF" },
  eventoNome: { color: "#2B241D", fontWeight: "600" },
});
