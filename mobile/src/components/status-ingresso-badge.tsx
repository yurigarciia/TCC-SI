import { Chip } from "react-native-paper";
import { coresSemanticas } from "@/theme/paper-theme";
import type { StatusIngresso } from "@/features/ingressos/types";

// Rótulos curtos de propósito — achado numa conversa com o usuário: "Aguardando entrada"/"Entrada
// validada" faziam o Chip ficar largo demais e espremer o resto do cabeçalho do card (ver
// (app)/ingressos/index.tsx) até sumir. O ícone já carrega o significado extra.
const ROTULOS: Record<StatusIngresso, { texto: string; cor: string; fundo: string; icone: string }> = {
  emitido: {
    texto: "Aguardando",
    cor: coresSemanticas.aviso,
    fundo: coresSemanticas.avisoFundo,
    icone: "clock-outline",
  },
  usado: {
    texto: "Validada",
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
      textStyle={{ color: cor, fontWeight: "600", fontSize: 12, lineHeight: 14 }}
      style={{ backgroundColor: fundo, alignSelf: "flex-start", borderRadius: 8, height: 28 }}
      compact
    >
      {texto}
    </Chip>
  );
}
