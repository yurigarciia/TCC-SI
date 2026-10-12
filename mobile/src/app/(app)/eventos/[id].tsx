import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Checkbox,
  Dialog,
  Divider,
  IconButton,
  Portal,
  RadioButton,
  Snackbar,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { MapaMesasCanvas, LEGENDA_MAPA } from "@/components/mapa-mesas-canvas";
import { ErrorSnackbar } from "@/components/error-snackbar";
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
import { formatarDataHora, formatarMoeda } from "@/lib/format";
import { ApiError } from "@/lib/api-client";
import { cores, paperTheme } from "@/theme/paper-theme";

export default function EventoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useEventoPublicado(id);
  const temSalao = !!data?.evento.salaoId;
  const { data: mesas } = useMapaMesas(temSalao ? id : "");

  const [mesaSelecionada, setMesaSelecionada] = useState<MesaNoMapa | null>(null);
  const [reservaOk, setReservaOk] = useState(false);
  const [wizardAberto, setWizardAberto] = useState(false);

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
  const temMesaLivre = !!mesas?.some((m) => m.status === "livre");

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
            onPress={() => setWizardAberto(true)}
            style={styles.botaoWizard}
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
            Toque numa mesa livre (branca) para reservá-la.
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

      <Portal>
        <Dialog visible={!!mesaSelecionada} onDismiss={() => setMesaSelecionada(null)}>
          {mesaSelecionada && (
            <ConteudoDialogMesa
              eventoId={id}
              mesa={mesaSelecionada}
              onFechar={() => setMesaSelecionada(null)}
              onSucesso={() => setReservaOk(true)}
            />
          )}
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={wizardAberto}
          onDismiss={() => setWizardAberto(false)}
          style={styles.dialogWizard}
        >
          <FluxoIngressoWizard
            eventoId={id}
            temSalao={temSalao}
            temMesaLivre={temMesaLivre}
            temIngressoAvulso={!!ingresso}
            onEscolherMesa={() => setWizardAberto(false)}
            onFechar={() => setWizardAberto(false)}
          />
        </Dialog>
      </Portal>

      <Snackbar visible={reservaOk} onDismiss={() => setReservaOk(false)} duration={4000}>
        Reserva feita! Acompanhe o status em &quot;Minhas Reservas&quot;.
      </Snackbar>
    </ScrollView>
  );
}

function ConteudoDialogMesa({
  eventoId,
  mesa,
  onFechar,
  onSucesso,
}: {
  eventoId: string;
  mesa: MesaNoMapa;
  onFechar: () => void;
  onSucesso: () => void;
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
            {formaPagamento === "presencial" && (
              <Text variant="bodySmall" style={styles.textoMuted}>
                A mesa fica reservada como &quot;Pendente&quot; até a diretoria confirmar o pagamento
                na entrada do evento.
              </Text>
            )}
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
                {
                  onSuccess: () => {
                    onSucesso();
                    onFechar();
                  },
                },
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

interface Acompanhante {
  id: string;
  nome: string;
  perfil: PerfilAcompanhante;
}

const ROTULO_PERFIL: Record<PerfilAcompanhante, string> = {
  nao_socio: "Não-sócio",
  crianca: "Criança",
};

// Fluxo único de compra — achado numa conversa com o usuário: a tela antiga mostrava o mapa de
// mesas "solto" sem instrução e, embaixo, um cartão avulso só com preço e botão, sem nenhuma
// orientação de qual caminho escolher nem jeito de comprar pra acompanhantes. Agora é um só
// ponto de entrada ("Comprar ingressos / Reservar mesa") que primeiro pergunta mesa x avulso, e
// no caminho avulso deixa montar uma lista (eu + acompanhantes não-sócio/criança) antes de
// confirmar a compra de todos de uma vez.
function FluxoIngressoWizard({
  eventoId,
  temSalao,
  temMesaLivre,
  temIngressoAvulso,
  onEscolherMesa,
  onFechar,
}: {
  eventoId: string;
  temSalao: boolean;
  temMesaLivre: boolean;
  temIngressoAvulso: boolean;
  onEscolherMesa: () => void;
  onFechar: () => void;
}) {
  const [etapa, setEtapa] = useState<"opcoes" | "avulso" | "novoAcompanhante">(
    temSalao && temMesaLivre && temIngressoAvulso ? "opcoes" : temIngressoAvulso ? "avulso" : "opcoes",
  );
  const [comigo, setComigo] = useState(true);
  const [acompanhantes, setAcompanhantes] = useState<Acompanhante[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [novoPerfil, setNovoPerfil] = useState<PerfilAcompanhante>("nao_socio");
  const [comprando, setComprando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const { data: meuPreco, isLoading: carregandoMeuPreco } = useMeuPrecoIngresso(eventoId);
  const { data: precosAcompanhante } = usePrecosAcompanhante(eventoId);
  const comprarMeu = useComprarMeuIngresso(eventoId);
  const comprarAcompanhante = useComprarIngressoAcompanhante(eventoId);

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
    setEtapa("avulso");
  }

  function removerAcompanhante(id: string) {
    setAcompanhantes((lista) => lista.filter((a) => a.id !== id));
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
      onFechar();
      router.push("/ingressos");
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

  if (etapa === "opcoes") {
    return (
      <>
        <Dialog.Title>O que você quer fazer?</Dialog.Title>
        <Dialog.Content style={{ gap: 12 }}>
          {temSalao && (
            <Button
              mode="outlined"
              icon="table-chair"
              disabled={!temMesaLivre}
              onPress={onEscolherMesa}
              contentStyle={{ paddingVertical: 4 }}
            >
              {temMesaLivre ? "Reservar uma mesa" : "Nenhuma mesa livre no momento"}
            </Button>
          )}
          {temIngressoAvulso && (
            <Button
              mode="contained"
              icon="ticket-outline"
              onPress={() => setEtapa("avulso")}
              contentStyle={{ paddingVertical: 4 }}
            >
              Comprar ingresso avulso (sem mesa)
            </Button>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onFechar}>Cancelar</Button>
        </Dialog.Actions>
      </>
    );
  }

  if (etapa === "novoAcompanhante") {
    return (
      <>
        <Dialog.Title>Adicionar acompanhante</Dialog.Title>
        <Dialog.Content style={{ gap: 10 }}>
          <TextInput
            mode="outlined"
            label="Nome do acompanhante"
            value={novoNome}
            onChangeText={setNovoNome}
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
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setEtapa("avulso")}>Cancelar</Button>
          <Button mode="contained" disabled={novoNome.trim().length < 2} onPress={adicionarAcompanhante}>
            Adicionar
          </Button>
        </Dialog.Actions>
      </>
    );
  }

  return (
    <>
      <Dialog.Title>Ingresso avulso</Dialog.Title>
      <Dialog.Content style={{ gap: 4, maxHeight: 420 }}>
        <ScrollView>
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

          <Button
            mode="text"
            icon="account-plus-outline"
            onPress={() => setEtapa("novoAcompanhante")}
            style={{ alignSelf: "flex-start", marginTop: 4 }}
          >
            Adicionar acompanhante
          </Button>

          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.linhaTotal}>
            <Text variant="titleMedium">Total ({quantidade} ingresso{quantidade === 1 ? "" : "s"})</Text>
            <Text variant="titleMedium" style={{ color: cores.primaria, fontWeight: "700" }}>
              {formatarMoeda(total)}
            </Text>
          </View>
        </ScrollView>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onFechar} disabled={comprando}>
          Cancelar
        </Button>
        <Button
          mode="contained"
          loading={comprando}
          disabled={comprando || quantidade === 0}
          onPress={confirmarCompra}
        >
          Comprar
        </Button>
      </Dialog.Actions>
      <ErrorSnackbar visible={!!erro} mensagem={erro ?? ""} onDismiss={() => setErro(null)} />
    </>
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
  botaoWizard: { marginTop: 8, borderRadius: 12 },
  dialogWizard: { maxHeight: "85%" },
  linhaCheckbox: { flexDirection: "row", alignItems: "center", gap: 4 },
  linhaAcompanhante: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  linhaTotal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
});
