import { Chip } from "react-native-paper";
import { coresSemanticas } from "@/theme/paper-theme";
import type { StatusAssociado } from "@/features/auth/types";

// Mesmo texto/semântica do StatusAssociadoBadge do painel web (frontend-web/src/features/
// associados/status-badge.tsx) — status nunca é só cor (DESIGN-SYSTEM.md §6), sempre texto +
// cor de reforço + ícone.
const ROTULOS: Record<StatusAssociado, { texto: string; cor: string; fundo: string; icone: string }> = {
  ativo: { texto: "Ativo", cor: coresSemanticas.sucesso, fundo: coresSemanticas.sucessoFundo, icone: "check-circle" },
  pendente_validacao: {
    texto: "Pendente de validação",
    cor: coresSemanticas.aviso,
    fundo: coresSemanticas.avisoFundo,
    icone: "clock-outline",
  },
  rejeitado: {
    texto: "Rejeitado",
    cor: coresSemanticas.erro,
    fundo: coresSemanticas.erroFundo,
    icone: "close-circle",
  },
};

export function StatusAssociadoBadge({ status }: { status: StatusAssociado }) {
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
