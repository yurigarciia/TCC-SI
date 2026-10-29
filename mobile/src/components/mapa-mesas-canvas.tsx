import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { cores, coresSemanticas } from "@/theme/paper-theme";
import type {
  AreaEstruturalNoMapa,
  ElementoEstruturalNoMapa,
  MesaNoMapa,
  StatusMesaNoMapa,
} from "@/features/eventos/types";

const LARGURA = 640;
const ALTURA = 420;

const ESTILO_POR_STATUS: Record<
  StatusMesaNoMapa,
  { borda: string; fundo: string; texto: string }
> = {
  livre: { borda: "#DDD0BC", fundo: "#FFFFFF", texto: "#2B241D" },
  pendente: { borda: coresSemanticas.aviso, fundo: coresSemanticas.avisoFundo, texto: coresSemanticas.aviso },
  reservada: { borda: coresSemanticas.erro, fundo: coresSemanticas.erroFundo, texto: coresSemanticas.erro },
  bloqueada: { borda: coresSemanticas.prata, fundo: "#F1EAE0", texto: "#5B5147" },
};

export const LEGENDA_MAPA: { status: StatusMesaNoMapa; rotulo: string }[] = [
  { status: "livre", rotulo: "Livre" },
  { status: "pendente", rotulo: "Pendente" },
  { status: "reservada", rotulo: "Reservada" },
  { status: "bloqueada", rotulo: "Bloqueada" },
];

interface MapaMesasCanvasProps {
  mesas: MesaNoMapa[];
  elementos?: ElementoEstruturalNoMapa[];
  areas?: AreaEstruturalNoMapa[];
  onMesaPress: (mesa: MesaNoMapa) => void;
  // false = só pra consulta (ex.: croqui na tela de detalhe do evento, ver (app)/eventos/[id]/
  // index.tsx) — nenhuma mesa responde a toque, nem as livres. true (padrão) = seleção real, usada
  // na tela dedicada de reserva (comprar.tsx).
  interativo?: boolean;
  mesaSelecionadaId?: string | null;
}

// Mesmo plano cartesiano do croqui do painel web (posicaoX/posicaoY em pixels reais, não
// proporcionais) — tamanho sempre fixo com rolagem horizontal no wrapper em vez de encolher o
// canvas, senão mesas com posicaoX maior ficariam cortadas fora da borda em telas estreitas
// (mesmo motivo documentado no MesaCanvas do frontend-web).
//
// Paredes, portas e áreas (tablado, bar, pista...) são desenhadas por cima igual ao editor de
// croqui/mapa de reservas do painel web (MesaCanvas/MapaMesasCanvas) — achado numa conversa com o
// usuário: o app mostrava as mesas soltas num plano em branco, sem nenhuma referência visual do
// salão de verdade, enquanto o administrativo já desenhava tudo isso há tempos.
export function MapaMesasCanvas({
  mesas,
  elementos = [],
  areas = [],
  onMesaPress,
  interativo = true,
  mesaSelecionadaId = null,
}: MapaMesasCanvasProps) {
  return (
    <ScrollView horizontal style={styles.scroll} showsHorizontalScrollIndicator>
      <View style={styles.plano}>
        {mesas.length === 0 && elementos.length === 0 && areas.length === 0 && (
          <Text style={styles.vazio}>Este evento ainda não tem mesas configuradas.</Text>
        )}

        {/* Áreas (tablado, bar, pista de dança...) — chão por baixo de parede/mesa. */}
        {areas.map((area) => (
          <View
            key={area.id}
            style={[
              styles.area,
              { left: area.x, top: area.y, width: area.largura, height: area.altura },
            ]}
          >
            <Text style={styles.areaTexto} numberOfLines={1}>
              {area.nome}
            </Text>
          </View>
        ))}

        {/* Parede/porta — sempre parede antes de porta (mesma ordem do MesaCanvas: a API não
            garante a ordem dos elementos, então sem isso uma parede podia ficar pintada por cima
            da porta, escondendo o traço pontilhado dela). */}
        <Svg style={StyleSheet.absoluteFill} width={LARGURA} height={ALTURA} pointerEvents="none">
          {[...elementos]
            .sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === "porta" ? 1 : -1))
            .map((elemento) => (
              <Line
                key={elemento.id}
                x1={elemento.x1}
                y1={elemento.y1}
                x2={elemento.x2}
                y2={elemento.y2}
                stroke={elemento.tipo === "parede" ? "#5B5147" : "#9C5A1F"}
                strokeWidth={elemento.tipo === "parede" ? 6 : 5}
                strokeDasharray={elemento.tipo === "porta" ? "6 3" : undefined}
                strokeLinecap="round"
              />
            ))}
        </Svg>

        {mesas.map((mesa) => {
          const estilo = ESTILO_POR_STATUS[mesa.status];
          const selecionada = mesa.mesaId === mesaSelecionadaId;
          return (
            <Pressable
              key={mesa.mesaId}
              disabled={!interativo || mesa.status === "bloqueada"}
              onPress={() => onMesaPress(mesa)}
              style={[
                styles.mesa,
                mesa.formato === "retangular" ? styles.mesaRetangular : styles.mesaRedonda,
                {
                  left: mesa.posicaoX,
                  top: mesa.posicaoY,
                  borderColor: selecionada ? cores.primaria : estilo.borda,
                  borderWidth: selecionada ? 3 : 2,
                  backgroundColor: estilo.fundo,
                },
              ]}
            >
              <Text style={{ color: estilo.texto, fontWeight: "700" }}>{mesa.numero}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDD0BC",
    backgroundColor: "#FAF7F1",
  },
  plano: { width: LARGURA, height: ALTURA },
  vazio: { position: "absolute", top: 16, left: 16, color: "#5B5147" },
  area: {
    position: "absolute",
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#C9A15A",
    backgroundColor: "rgba(201, 161, 90, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  areaTexto: { color: "#8A6A2E", fontSize: 11, fontWeight: "600", paddingHorizontal: 6 },
  mesa: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  mesaRedonda: {
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    borderRadius: 22,
  },
  mesaRetangular: {
    width: 56,
    height: 36,
    marginLeft: -28,
    marginTop: -18,
    borderRadius: 10,
  },
});
