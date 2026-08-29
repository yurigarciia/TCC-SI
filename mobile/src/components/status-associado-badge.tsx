import { Chip } from "react-native-paper";
import { coresSemanticas } from "@/theme/paper-theme";
import type { StatusAssociado } from "@/features/auth/types";

// Mesmo texto/semântica do StatusAssociadoBadge do painel web (frontend-web/src/features/
// associados/status-badge.tsx) — status nunca é só cor (DESIGN-SYSTEM.md §6), sempre texto +
// cor de reforço.
const ROTULOS: Record<StatusAssociado, { texto: string; cor: string }> = {
  ativo: { texto: "Ativo", cor: coresSemanticas.sucesso },
  pendente_validacao: { texto: "Pendente de validação", cor: coresSemanticas.aviso },
  rejeitado: { texto: "Rejeitado", cor: coresSemanticas.erro },
};

export function StatusAssociadoBadge({ status }: { status: StatusAssociado }) {
  const { texto, cor } = ROTULOS[status];
  return (
    <Chip
      textStyle={{ color: cor, fontWeight: "600" }}
      style={{ backgroundColor: `${cor}1A`, alignSelf: "flex-start" }}
      compact
    >
      {texto}
    </Chip>
  );
}
