import { Chip } from "react-native-paper";
import { coresSemanticas } from "@/theme/paper-theme";
import type { StatusReserva } from "@/features/reservas/types";

const ROTULOS: Record<StatusReserva, { texto: string; cor: string; fundo: string; icone: string }> = {
  confirmada: {
    texto: "Confirmada",
    cor: coresSemanticas.sucesso,
    fundo: coresSemanticas.sucessoFundo,
    icone: "check-circle",
  },
  pendente: {
    texto: "Pendente",
    cor: coresSemanticas.aviso,
    fundo: coresSemanticas.avisoFundo,
    icone: "clock-outline",
  },
  cancelada: {
    texto: "Cancelada",
    cor: coresSemanticas.erro,
    fundo: coresSemanticas.erroFundo,
    icone: "close-circle",
  },
};

export function StatusReservaBadge({ status }: { status: StatusReserva }) {
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
