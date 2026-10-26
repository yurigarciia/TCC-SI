import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { AppTopBar } from "@/components/app-top-bar";
import { StatusIngressoBadge } from "@/components/status-ingresso-badge";
import { useMeusIngressos } from "@/features/ingressos/use-meus-ingressos";
import { formatarMoeda } from "@/lib/format";
import { paperTheme } from "@/theme/paper-theme";

// Tela dedicada do ingresso — achado numa conversa com o usuário: o QR deve ficar escondido na
// lista (ver index.tsx) e só aparecer aqui, ao tocar no card. Fica acessível mesmo com o
// ingresso já "usado": a diretoria pode precisar reler o mesmo QR (ex.: reentrada, checagem
// manual) e o id do ingresso nunca muda, então não há motivo pra esconder o código depois da
// primeira validação.
export default function IngressoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: ingressos, isLoading, isError, refetch } = useMeusIngressos();
  const ingresso = ingressos?.find((i) => i.id === id);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <AppTopBar titulo="Ingresso" onVoltar={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !ingresso) {
    return (
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <AppTopBar titulo="Ingresso" onVoltar={() => router.back()} />
        <View style={styles.center}>
          <Text variant="titleMedium" style={styles.textoCentralizado}>
            {isError ? "Não foi possível carregar este ingresso." : "Ingresso não encontrado."}
          </Text>
          {isError && (
            <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 16 }}>
              Tentar de novo
            </Button>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const dataFormatada = ingresso.evento
    ? new Date(ingresso.evento.data).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <AppTopBar
        titulo={`${ingresso.nomeComprador} #${String(ingresso.codigo).padStart(3, "0")}`}
        onVoltar={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Surface style={styles.card} elevation={1}>
          <View style={styles.cardTopo}>
            <StatusIngressoBadge status={ingresso.status} />
          </View>

          <Text variant="titleMedium" style={styles.eventoNome}>
            {ingresso.evento?.nome ?? "Evento não encontrado"}
          </Text>

          {dataFormatada && (
            <Text variant="bodyMedium" style={styles.textoMuted}>
              {dataFormatada}
              {ingresso.evento?.local ? ` · ${ingresso.evento.local}` : ""}
            </Text>
          )}

          <Text variant="bodyMedium" style={styles.textoMuted}>
            {formatarMoeda(ingresso.preco)}
          </Text>

          {ingresso.status === "usado" && ingresso.usadoEm && (
            <Text variant="bodySmall" style={styles.textoValidado}>
              Entrada validada em{" "}
              {new Date(ingresso.usadoEm).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </Text>
          )}

          <View style={styles.qrContainer}>
            <QRCode value={ingresso.id} size={220} />
            <Text variant="titleMedium" style={styles.codigo}>
              #{String(ingresso.codigo).padStart(3, "0")}
            </Text>
            <Text variant="bodySmall" style={[styles.textoCentralizado, styles.textoMuted]}>
              Mostre esse QR na entrada
            </Text>
          </View>
        </Surface>
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
  textoValidado: {
    color: "#1B3B26",
    backgroundColor: "#DCEADF",
    padding: 8,
    borderRadius: 8,
  },
  container: { padding: 20, gap: 12, paddingBottom: 110 },
  card: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    gap: 8,
  },
  cardTopo: { alignItems: "flex-end" },
  eventoNome: { fontWeight: "700", color: "#2B241D" },
  codigo: { fontWeight: "700", color: "#2E5E3E", letterSpacing: 1 },
  qrContainer: {
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 20,
    backgroundColor: "#F1EAE0",
    borderRadius: 16,
  },
});
