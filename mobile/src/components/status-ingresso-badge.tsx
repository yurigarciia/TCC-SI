import { Chip } from "react-native-paper";
import { coresSemanticas } from "@/theme/paper-theme";
import type { StatusIngresso } from "@/features/ingressos/types";

const ROTULOS: Record<StatusIngresso, { texto: string; cor: string; fundo: string; icone: string }> = {
  emitido: {
    texto: "Aguardando entrada",
    cor: coresSemanticas.aviso,
    fundo: coresSemanticas.avisoFundo,
    icone: "clock-outline",
  },
  usado: {
    texto: "Entrada validada",
    cor: coresSemanticas.sucesso,
    fundo: coresSemanticas.sucessoFundo,
    icone: "check-circle",
  },
};

export function StatusIngressoBadge({ status }: { status: StatusIngresso }) {
  const { texto, cor, fundo, icone } = ROTULOS[status];
  return (
    <Chip
      icon={icone}
      textStyle={{ color: cor, fontWeight: "600" }}
      style={{ backgroundColor: fundo, alignSelf: "flex-start", borderRadius: 8 }}
      compact
    >
      {texto}
    </Chip>
  );
}
