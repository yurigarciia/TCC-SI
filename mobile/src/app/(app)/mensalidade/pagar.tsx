import { useEffect, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Button, Chip, Divider, Surface, Text, TouchableRipple } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { ErrorSnackbar } from "@/components/error-snackbar";
import { usePagarMinhaMensalidadeOnline } from "@/features/mensalidades/use-mensalidades";
import { ApiError } from "@/lib/api-client";
import { formatarCompetencia, formatarData, formatarMoeda } from "@/lib/format";
import { cores, coresSemanticas, paperTheme } from "@/theme/paper-theme";

type FormaPagamentoSimulada = "pix" | "credito" | "debito";

const FORMAS: {
  valor: FormaPagamentoSimulada;
  rotulo: string;
  descricao: string;
  icone: string;
}[] = [
  { valor: "pix", rotulo: "Pix", descricao: "Aprovação imediata", icone: "qrcode" },
  {
    valor: "credito",
    rotulo: "Cartão de crédito",
    descricao: "Simulado — nenhum dado real é solicitado",
    icone: "credit-card-outline",
  },
  {
    valor: "debito",
    rotulo: "Cartão de débito",
    descricao: "Simulado — nenhum dado real é solicitado",
    icone: "bank-outline",
  },
];

// Gateway de pagamento simulado (checkout fake) — achado numa conversa com o usuário: o botão
// "Pagar online" aprovava a mensalidade na hora, num só toque, sem nenhuma experiência de checkout
// no meio. Como o adapter de pagamento em uso hoje (FakePaymentGatewayAdapter, ver
// use-mensalidades.ts) também já aprova tudo na hora por trás, esta tela só existe pra simular a
// experiência de um checkout de verdade (referência pedida: Mercado Pago) — nenhum dado de cartão
// é de fato coletado ou enviado a lugar algum, por isso a badge de simulação permanece visível o
// tempo todo.
export default function PagarMensalidadeScreen() {
  const { id, competencia, valor, vencimento } = useLocalSearchParams<{
    id: string;
    competencia: string;
    valor: string;
    vencimento: string;
  }>();

  const pagar = usePagarMinhaMensalidadeOnline();
  const [forma, setForma] = useState<FormaPagamentoSimulada>("pix");
  const [aprovado, setAprovado] = useState(false);
  const insets = useSafeAreaInsets();

  // A navbar flutuante inferior (ver (app)/_layout.tsx) pertence ao Tabs raiz, não a este Stack —
  // ela continua renderizada por cima mesmo aqui dentro, cobrindo o botão "Continuar" do rodapé
  // fixo. Achado testando no device de verdade: esconder só enquanto esta tela está em foco e
  // devolver ao sair é o jeito recomendado pelo próprio react-navigation pra telas full-screen
  // dentro de uma tab (setOptions no navigator pai, não um estilo fixo no Tabs).
  const navigation = useNavigation();
  useEffect(() => {
    const tabNavigator = navigation.getParent();
    tabNavigator?.setOptions({ tabBarStyle: { display: "none" } });
    return () => tabNavigator?.setOptions({ tabBarStyle: undefined });
  }, [navigation]);

  const valorNumero = Number(valor);

  function confirmarPagamento() {
    pagar.mutate(id, { onSuccess: () => setAprovado(true) });
  }

  // Achado numa conversa com o usuário: depois de aprovado, o esperado é já voltar pra tela de
  // Mensalidade mostrando o novo status "Paga" (a invalidação de CHAVE_MINHAS em
  // usePagarMinhaMensalidadeOnline garante que ela chega atualizada) — não ficar parado esperando
  // um toque manual. O botão abaixo continua como fallback, pro associado que quiser sair antes.
  useEffect(() => {
    if (!aprovado) return;
    const tempo = setTimeout(() => router.replace("/mensalidade"), 1800);
    return () => clearTimeout(tempo);
  }, [aprovado]);

  if (aprovado) {
    return (
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <AppTopBar titulo="Pagamento" onVoltar={() => router.replace("/mensalidade")} />
        <View style={styles.center}>
          <Avatar.Icon
            icon="check-circle-outline"
            size={72}
            style={styles.avatarSucesso}
            color={paperTheme.colors.primary}
          />
          <Text variant="titleLarge" style={styles.textoCentralizado}>
            Pagamento aprovado!
          </Text>
          <Text variant="bodyMedium" style={[styles.textoCentralizado, styles.textoMuted]}>
            {formatarCompetencia(competencia)} · {formatarMoeda(valorNumero)}
          </Text>
          <Button
            mode="contained"
            style={{ marginTop: 24, borderRadius: 12 }}
            onPress={() => router.replace("/mensalidade")}
          >
            Voltar pra Mensalidade
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <AppTopBar titulo="Pagar mensalidade" onVoltar={() => router.back()} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.cabecalho}>
          <Text variant="headlineSmall" style={styles.tituloPrincipal}>
            Pagamento da mensalidade
          </Text>
          <Chip
            icon="flask-outline"
            compact
            style={styles.chipSimulacao}
            textStyle={styles.chipSimulacaoTexto}
          >
            Simulação para o TCC — nenhum pagamento real é processado
          </Chip>
        </View>

        <Surface style={styles.cardResumo} elevation={1}>
          <Text variant="labelLarge" style={styles.rotuloResumo}>
            Você está pagando
          </Text>
          <Text variant="displaySmall" style={styles.valorResumo}>
            {formatarMoeda(valorNumero)}
          </Text>
          <Divider style={styles.divisor} />
          <View style={styles.linhaResumo}>
            <Text variant="bodyMedium" style={styles.textoMuted}>
              Referente a
            </Text>
            <Text variant="bodyMedium" style={styles.textoResumoForte}>
              {formatarCompetencia(competencia)}
            </Text>
          </View>
          <View style={styles.linhaResumo}>
            <Text variant="bodyMedium" style={styles.textoMuted}>
              Vencimento
            </Text>
            <Text variant="bodyMedium" style={styles.textoResumoForte}>
              {formatarData(vencimento)}
            </Text>
          </View>
        </Surface>

        <Text variant="titleMedium" style={styles.tituloSecao}>
          Forma de pagamento
        </Text>
        <Surface style={styles.cardFormas} elevation={1}>
          {FORMAS.map((item, indice) => {
            const selecionada = forma === item.valor;
            return (
              <View key={item.valor}>
                <TouchableRipple onPress={() => setForma(item.valor)} style={styles.linhaForma}>
                  <View style={styles.linhaFormaConteudo}>
                    <Avatar.Icon
                      icon={item.icone}
                      size={40}
                      style={[
                        styles.iconeForma,
                        selecionada && styles.iconeFormaSelecionado,
                      ]}
                      color={selecionada ? "#FDF8F3" : cores.textoSecundario}
                    />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyLarge" style={styles.rotuloForma}>
                        {item.rotulo}
                      </Text>
                      <Text variant="bodySmall" style={styles.textoMuted}>
                        {item.descricao}
                      </Text>
                    </View>
                    <View
                      style={[styles.radioExterno, selecionada && styles.radioExternoSelecionado]}
                    >
                      {selecionada && <View style={styles.radioInterno} />}
                    </View>
                  </View>
                </TouchableRipple>
                {indice < FORMAS.length - 1 && <Divider />}
              </View>
            );
          })}
        </Surface>

        {pagar.isPending && (
          <Surface style={[styles.cardResumo, styles.cardProcessando]} elevation={1}>
            <ActivityIndicator color={paperTheme.colors.primary} />
            <Text variant="bodyMedium" style={styles.textoMuted}>
              Processando pagamento simulado…
            </Text>
          </Surface>
        )}
      </ScrollView>

      <View style={[styles.rodape, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]}>
        <Button
          mode="contained"
          icon="lock-outline"
          loading={pagar.isPending}
          disabled={pagar.isPending}
          onPress={confirmarPagamento}
          contentStyle={styles.botaoContinuarConteudo}
          style={styles.botaoContinuar}
        >
          {pagar.isPending ? "Processando…" : `Continuar — ${formatarMoeda(valorNumero)}`}
        </Button>
      </View>

      <ErrorSnackbar
        visible={pagar.isError}
        mensagem={
          pagar.error instanceof ApiError
            ? pagar.error.message
            : "Não foi possível confirmar o pagamento. Tente novamente."
        }
        onDismiss={() => pagar.reset()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F1" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  avatarSucesso: { backgroundColor: cores.primariaClara, marginBottom: 12 },
  textoCentralizado: { textAlign: "center" },
  textoMuted: { color: "#5B5147" },
  container: { padding: 20, gap: 14, paddingBottom: 140 },
  cabecalho: { alignItems: "center", gap: 8, marginBottom: 4 },
  tituloPrincipal: { color: "#2B241D", fontWeight: "700", textAlign: "center" },
  chipSimulacao: {
    alignSelf: "center",
    backgroundColor: coresSemanticas.avisoFundo,
    borderRadius: 8,
  },
  chipSimulacaoTexto: { color: coresSemanticas.aviso, fontWeight: "600", fontSize: 12 },
  cardResumo: { borderRadius: 20, backgroundColor: "#FFFFFF", padding: 20, gap: 4 },
  rotuloResumo: { color: "#5B5147" },
  valorResumo: { color: cores.primaria, fontWeight: "700", marginBottom: 4 },
  divisor: { marginVertical: 10 },
  linhaResumo: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  textoResumoForte: { color: "#2B241D", fontWeight: "600" },
  tituloSecao: { color: "#2B241D", fontWeight: "700", marginTop: 4 },
  cardFormas: { borderRadius: 16, backgroundColor: "#FFFFFF", overflow: "hidden" },
  linhaForma: { paddingHorizontal: 16, paddingVertical: 14 },
  linhaFormaConteudo: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconeForma: { backgroundColor: "#F1EAE0" },
  iconeFormaSelecionado: { backgroundColor: cores.primaria },
  rotuloForma: { color: "#2B241D", fontWeight: "600" },
  radioExterno: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#DDD0BC",
    alignItems: "center",
    justifyContent: "center",
  },
  radioExternoSelecionado: { borderColor: cores.primaria },
  radioInterno: { width: 11, height: 11, borderRadius: 6, backgroundColor: cores.primaria },
  cardProcessando: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 16 },
  rodape: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: "#FAF7F1",
    borderTopWidth: 1,
    borderTopColor: "#E9E0D2",
  },
  botaoContinuar: { borderRadius: 12 },
  botaoContinuarConteudo: { paddingVertical: 6 },
});
