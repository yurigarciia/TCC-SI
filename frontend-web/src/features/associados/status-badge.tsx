import { Badge } from "@/components/ui/badge";
import type { StatusAssociado } from "./types";

const rotulos: Record<StatusAssociado, { texto: string; variante: "success" | "warning" | "destructive" }> = {
  ativo: { texto: "Ativo", variante: "success" },
  pendente_validacao: { texto: "Pendente de validação", variante: "warning" },
  rejeitado: { texto: "Rejeitado", variante: "destructive" },
};

export function StatusAssociadoBadge({ status }: { status: StatusAssociado }) {
  const { texto, variante } = rotulos[status];
  return <Badge variant={variante}>{texto}</Badge>;
}
