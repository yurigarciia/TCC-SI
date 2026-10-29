import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Checkbox,
  Divider,
  IconButton,
  RadioButton,
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTopBar } from "@/components/app-top-bar";
import { ErrorSnackbar } from "@/components/error-snackbar";
import { MapaMesasCanvas, LEGENDA_MAPA } from "@/components/mapa-mesas-canvas";
import {
  useComprarMeuIngresso,
  useEventoPublicado,
  useMapaMesas,
  useMeuPrecoIngresso,
  useSolicitarMinhaReserva,
} from "@/features/eventos/use-eventos";
import {
  useComprarIngressoAcompanhante,
  usePrecosAcompanhante,
} from "@/features/ingressos/use-comprar-acompanhante";
import type { PerfilAcompanhante } from "@/features/ingressos/types";
import type { FormaPagamentoReserva, MesaNoMapa } from "@/features/eventos/types";
import { ApiError } from "@/lib/api-client";
import { formatarMoeda } from "@/lib/format";
import { cores, paperTheme } from "@/theme/paper-theme";

interface Acompanhante {
  id: string;
  nome: string;
  perfil: PerfilAcompanhante;
}

const ROTULO_PERFIL: Record<PerfilAcompanhante, string> = {
  nao_socio: "Não-sócio",
  crianca: "Criança",
};

// Tela cheia única de "Comprar ingressos / Reservar mesa" — achado numa conversa com o usuário:
// reserva de mesa e compra de ingresso avulso são a MESMA decisão de compra pro associado (ele
// decide entre as duas, ou simplesmente escolhe uma), então viver em telas/rotas separadas
// (versão anterior) é pior do que um só destino com as duas opções lado a lado (SegmentedButtons
// quando o evento tem as duas, senão vai direto pro único modo disponível). Continua sem nenhum
// Dialog/Portal — tudo rolando na própria tela.
export default function ComprarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useEventoPublicado(id);
  const temSalao = !!data?.evento.salaoId;
  const temIngressoAvulso = !!data?.ingresso;
  // Mesma query de ReservarMesa (mesma queryKey, reaproveita o cache) — achado numa conversa com
  // o usuário: `temSalao` só diz que o evento está vinculado a um salão, não que esse salão tem
  // mesas configuradas de fato. Sem isso, a opção "Mesa" aparecia mesmo sem nenhuma mesa pra
  // reservar.
  const { data: mapa } = useMapaMesas(temSalao ? id : "");
  const temMesas = temSalao && (mapa?.mesas.length ?? 0) > 0;

  const [modo, setModo] = useState<"mesa" | "avulso">(temMesas ? "mesa" : "avulso");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <AppTopBar titulo="Comprar" onVoltar={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <AppTopBar titulo="Comprar" onVoltar={() => router.back()} />
        <View style={styles.center}>
          <Text variant="titleMedium" style={styles.textoCentralizado}>
            Não foi possível carregar este evento.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <AppTopBar titulo={data.evento.nome} onVoltar={() => router.back()} />

      {temMesas && temIngressoAvulso && (
        <View style={styles.segmentedWrapper}>
          <SegmentedButtons
            value={modo}
            onValueChange={(v) => setModo(v as "mesa" | "avulso")}
            buttons={[
              { value: "mesa", label: "Mesa", icon: "table-chair" },
              { value: "avulso", label: "Ingresso avulso", icon: "ticket-outline" },
            ]}
          />
        </View>
      )}

      {modo === "mesa" && temMesas ? (
        <ReservarMesa eventoId={id} />
      ) : (
        <ComprarIngresso eventoId={id} />
      )}
    </SafeAreaView>
  );
}

function ReservarMesa({ eventoId }: { eventoId: string }) {
  const { data: mapa, isLoading, isError, refetch } = useMapaMesas(eventoId);
  const reservar = useSolicitarMinhaReserva(eventoId);

  const [mesaSelecionada, setMesaSelecionada] = useState<MesaNoMapa | null>(null);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoReserva>("online");
  const [reservaOk, setReservaOk] = useState(false);

  function selecionarMesa(mesa: MesaNoMapa) {
    if (mesa.status !== "livre") return;
    setMesaSelecionada(mesa);
  }

  function confirmarReserva() {
    if (!mesaSelecionada) return;
    reservar.mutate(
      { mesaId: mesaSelecionada.mesaId, formaPagamento },
      { onSuccess: () => setReservaOk(true) },
    );
  }

  if (reservaOk) {
    return (
      <View style={styles.center}>
        <Avatar.Icon
          icon="check-circle-outline"
          size={64}
          style={styles.avatarSucesso}
          color={paperTheme.colors.primary}
        />
        <Text variant="titleMedium" style={styles.textoCentralizado}>
          Reserva feita!
        </Text>
        <Text variant="bodyMedium" style={[styles.textoCentralizado, styles.textoMuted]}>
          Acompanhe o status da sua mesa em &quot;Ingressos e Mesas&quot;.
        </Text>
        <Button
          mode="contained"
          style={{ marginTop: 20, borderRadius: 12 }}
          onPress={() => router.replace({ pathname: "/ingressos", params: { modo: "mesas" } })}
        >
          Ver minhas reservas
        </Button>
        <Button mode="text" style={{ marginTop: 4 }} onPress={() => router.back()}>
          Voltar ao evento
        </Button>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Surface style={styles.card} elevation={1}>
          <Text variant="bodySmall" style={[styles.textoMuted, { marginBottom: 4 }]}>
            Toque numa mesa livre (branca) para selecioná-la.
          </Text>
          <View style={styles.legenda}>
            {LEGENDA_MAPA.map(({ status, rotulo }) => (
              <Text key={status} variant="labelSmall" style={styles.textoMuted}>
                ● {rotulo}
              </Text>
            ))}
          </View>
          {isLoading && <ActivityIndicator style={{ marginVertical: 24 }} />}
          {isError && (
            <View style={styles.center}>
              <Text variant="bodyMedium" style={styles.textoCentralizado}>
                Não foi possível carregar o mapa de mesas.
              </Text>
              <Button mode="contained" onPress={() => refetch()} style={{ marginTop: 12 }}>
                Tentar de novo
              </Button>
            </View>
          )}
          {mapa && (
            <MapaMesasCanvas
              mesas={mapa.mesas}
              elementos={mapa.elementos}
              areas={mapa.areas}
              onMesaPress={selecionarMesa}
              mesaSelecionadaId={mesaSelecionada?.mesaId}
            />
          )}
        </Surface>

        {mesaSelecionada ? (
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleMedium" style={styles.tituloSecao}>
              Mesa {mesaSelecionada.numero}
            </Text>
            <Text variant="bodyMedium" style={styles.textoMuted}>
              {mesaSelecionada.capacidade} lugares · {formatarMoeda(mesaSelecionada.preco)}
            </Text>

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
            {formaPagamento === "presencial" && (
              <Text variant="bodySmall" style={styles.textoMuted}>
                A mesa fica reservada como &quot;Pendente&quot; até a diretoria confirmar o
                pagamento na entrada do evento.
              </Text>
            )}

            <Button
              mode="contained"
              icon="table-chair"
              loading={reservar.isPending}
              disabled={reservar.isPending}
              onPress={confirmarReserva}
              contentStyle={{ paddingVertical: 4 }}
              style={{ marginTop: 12, borderRadius: 12 }}
            >
              Reservar mesa {mesaSelecionada.numero}
            </Button>
          </Surface>
        ) : (
          <Surface style={[styles.card, styles.cardDica]} elevation={1}>
            <Text variant="bodyMedium" style={styles.textoMuted}>
              Selecione uma mesa livre no mapa acima pra ver preço, capacidade e confirmar a
              reserva.
            </Text>
          </Surface>
        )}
      </ScrollView>

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

function ComprarIngresso({ eventoId }: { eventoId: string }) {
  const { data: meuPreco, isLoading: carregandoMeuPreco } = useMeuPrecoIngresso(eventoId);
  const { data: precosAcompanhante } = usePrecosAcompanhante(eventoId);
  const comprarMeu = useComprarMeuIngresso(eventoId);
  const comprarAcompanhante = useComprarIngressoAcompanhante(eventoId);

  const [comigo, setComigo] = useState(true);
  const [acompanhantes, setAcompanhantes] = useState<Acompanhante[]>([]);
  const [formAberto, setFormAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoPerfil, setNovoPerfil] = useState<PerfilAcompanhante>("nao_socio");
  const [comprando, setComprando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [compraOk, setCompraOk] = useState(false);

  const precoMeu = meuPreco?.preco ?? null;
  const precoPorPerfil: Record<PerfilAcompanhante, number | null> = {
    nao_socio: precosAcompanhante?.naoSocio ?? null,
    crianca: precosAcompanhante?.crianca ?? null,
  };

  const total =
    (comigo && precoMeu ? precoMeu : 0) +
    acompanhantes.reduce((soma, a) => soma + (precoPorPerfil[a.perfil] ?? 0), 0);
  const quantidade = (comigo ? 1 : 0) + acompanhantes.length;

  function adicionarAcompanhante() {
    if (novoNome.trim().length < 2) return;
    setAcompanhantes((lista) => [
      ...lista,
      { id: `${Date.now()}`, nome: novoNome.trim(), perfil: novoPerfil },
    ]);
    setNovoNome("");
    setNovoPerfil("nao_socio");
    setFormAberto(false);
  }

  function removerAcompanhante(idAcompanhante: string) {
    setAcompanhantes((lista) => lista.filter((a) => a.id !== idAcompanhante));
  }

  async function confirmarCompra() {
    setErro(null);
    setComprando(true);
    try {
      if (comigo) {
        await comprarMeu.mutateAsync();
      }
      for (const acompanhante of acompanhantes) {
        await comprarAcompanhante.mutateAsync({
          nomeComprador: acompanhante.nome,
          perfilComprador: acompanhante.perfil,
        });
      }
      setCompraOk(true);
    } catch (e) {
      setErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível concluir a compra de todos os ingressos. Veja em Meus Ingressos o que já foi emitido.",
      );
    } finally {
      setComprando(false);
    }
  }

  if (compraOk) {
    return (
      <View style={styles.center}>
        <Avatar.Icon
          icon="check-circle-outline"
          size={64}
          style={styles.avatarSucesso}
          color={paperTheme.colors.primary}
        />
        <Text variant="titleMedium" style={styles.textoCentralizado}>
          Ingresso{quantidade === 1 ? "" : "s"} emitido{quantidade === 1 ? "" : "s"}!
        </Text>
        <Text variant="bodyMedium" style={[styles.textoCentralizado, styles.textoMuted]}>
          Encontre o QR de entrada em &quot;Meus Ingressos&quot;.
        </Text>
        <Button
          mode="contained"
          style={{ marginTop: 20, borderRadius: 12 }}
          onPress={() => router.replace("/ingressos")}
        >
          Ver meus ingressos
        </Button>
        <Button mode="text" style={{ marginTop: 4 }} onPress={() => router.back()}>
          Voltar ao evento
        </Button>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Surface style={styles.card} elevation={1}>
          <View style={styles.linhaCheckbox}>
            <Checkbox.Android
              status={comigo ? "checked" : "unchecked"}
              onPress={() => setComigo((v) => !v)}
              disabled={carregandoMeuPreco || precoMeu == null}
            />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">Meu ingresso (sócio)</Text>
              <Text variant="bodySmall" style={styles.textoMuted}>
                {carregandoMeuPreco
                  ? "Carregando preço..."
                  : precoMeu != null
                    ? formatarMoeda(precoMeu)
                    : "Preço não configurado pra sua categoria — fale com a diretoria"}
              </Text>
            </View>
          </View>

          {acompanhantes.length > 0 && <Divider style={{ marginVertical: 8 }} />}

          {acompanhantes.map((a) => (
            <View key={a.id} style={styles.linhaAcompanhante}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{a.nome}</Text>
                <Text variant="bodySmall" style={styles.textoMuted}>
                  {ROTULO_PERFIL[a.perfil]}
                  {precoPorPerfil[a.perfil] != null
                    ? ` — ${formatarMoeda(precoPorPerfil[a.perfil]!)}`
                    : ""}
                </Text>
              </View>
              <IconButton icon="close" size={18} onPress={() => removerAcompanhante(a.id)} />
            </View>
          ))}

          {!formAberto && (
            <Button
              mode="text"
              icon="account-plus-outline"
              onPress={() => setFormAberto(true)}
              style={{ alignSelf: "flex-start", marginTop: 4 }}
            >
              Adicionar acompanhante
            </Button>
          )}
        </Surface>

        {formAberto && (
          <Surface style={[styles.card, styles.cardFormulario]} elevation={1}>
            <Text variant="titleMedium" style={styles.tituloSecao}>
              Novo acompanhante
            </Text>
            <TextInput
              mode="outlined"
              label="Nome do acompanhante"
              value={novoNome}
              onChangeText={setNovoNome}
              maxLength={150}
            />
            <RadioButton.Group
              value={novoPerfil}
              onValueChange={(v) => setNovoPerfil(v as PerfilAcompanhante)}
            >
              <RadioButton.Item
                label={`Não-sócio${precoPorPerfil.nao_socio != null ? ` — ${formatarMoeda(precoPorPerfil.nao_socio)}` : ""}`}
                value="nao_socio"
              />
              <RadioButton.Item
                label={`Criança${precoPorPerfil.crianca != null ? ` — ${formatarMoeda(precoPorPerfil.crianca)}` : ""}`}
                value="crianca"
              />
            </RadioButton.Group>
            <View style={styles.linhaBotoesForm}>
              <Button onPress={() => setFormAberto(false)}>Cancelar</Button>
              <Button
                mode="contained"
                disabled={novoNome.trim().length < 2}
                onPress={adicionarAcompanhante}
              >
                Adicionar
              </Button>
            </View>
          </Surface>
        )}

        <Surface style={styles.card} elevation={1}>
          <View style={styles.linhaTotal}>
            <Text variant="titleMedium">
              Total ({quantidade} ingresso{quantidade === 1 ? "" : "s"})
            </Text>
            <Text variant="titleMedium" style={{ color: cores.primaria, fontWeight: "700" }}>
              {formatarMoeda(total)}
            </Text>
          </View>
          <Button
            mode="contained"
            icon="ticket-outline"
            loading={comprando}
            disabled={comprando || quantidade === 0}
            onPress={confirmarCompra}
            contentStyle={{ paddingVertical: 4 }}
            style={{ marginTop: 8, borderRadius: 12 }}
          >
            Comprar
          </Button>
        </Surface>
      </ScrollView>

      <ErrorSnackbar visible={!!erro} mensagem={erro ?? ""} onDismiss={() => setErro(null)} />
    </>
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
  segmentedWrapper: { paddingHorizontal: 20, paddingTop: 12 },
  textoCentralizado: { textAlign: "center" },
  textoMuted: { color: "#5B5147" },
  avatarSucesso: { backgroundColor: cores.primariaClara, marginBottom: 8 },
  container: { padding: 20, gap: 12, paddingBottom: 110 },
  card: { borderRadius: 16, backgroundColor: "#FFFFFF", padding: 16, gap: 4 },
  cardDica: { backgroundColor: "#F1EAE0" },
  cardFormulario: { backgroundColor: "#F1EAE0", gap: 8 },
  tituloSecao: { color: "#2B241D", fontWeight: "700" },
  legenda: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 4 },
  linhaCheckbox: { flexDirection: "row", alignItems: "center", gap: 4 },
  linhaAcompanhante: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  linhaBotoesForm: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  linhaTotal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
