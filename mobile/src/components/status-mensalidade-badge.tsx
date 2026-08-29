import { Chip } from "react-native-paper";
import { coresSemanticas } from "@/theme/paper-theme";
import type { StatusMensalidade } from "@/features/mensalidades/types";

const ROTULOS: Record<
  StatusMensalidade,
  { texto: string; cor: string; fundo: string; icone: string }
> = {
  paga: {
    texto: "Paga",
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
  inadimplente: {
    texto: "Em atraso",
    cor: coresSemanticas.erro,
    fundo: coresSemanticas.erroFundo,
    icone: "alert-circle",
  },
};

export function StatusMensalidadeBadge({ status }: { status: StatusMensalidade }) {
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
