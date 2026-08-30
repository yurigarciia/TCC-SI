import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { coresSemanticas } from "@/theme/paper-theme";
import type { MesaNoMapa, StatusMesaNoMapa } from "@/features/eventos/types";

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
  onMesaPress: (mesa: MesaNoMapa) => void;
}

// Mesmo plano cartesiano do croqui do painel web (posicaoX/posicaoY em pixels reais, não
// proporcionais) — tamanho sempre fixo com rolagem horizontal no wrapper em vez de encolher o
// canvas, senão mesas com posicaoX maior ficariam cortadas fora da borda em telas estreitas
// (mesmo motivo documentado no MesaCanvas do frontend-web).
export function MapaMesasCanvas({ mesas, onMesaPress }: MapaMesasCanvasProps) {
  return (
    <ScrollView horizontal style={styles.scroll} showsHorizontalScrollIndicator>
      <View style={styles.plano}>
        {mesas.length === 0 && (
          <Text style={styles.vazio}>Este evento ainda não tem mesas configuradas.</Text>
        )}
        {mesas.map((mesa) => {
          const estilo = ESTILO_POR_STATUS[mesa.status];
          return (
            <Pressable
              key={mesa.mesaId}
              disabled={mesa.status === "bloqueada"}
              onPress={() => onMesaPress(mesa)}
              style={[
                styles.mesa,
                {
                  left: mesa.posicaoX,
                  top: mesa.posicaoY,
                  borderColor: estilo.borda,
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
  mesa: {
    position: "absolute",
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
