import { Badge } from "@/components/ui/badge";
import type { StatusMensalidade } from "./types";

const rotulos: Record<
  StatusMensalidade,
  { texto: string; variante: "success" | "warning" | "destructive" }
> = {
  paga: { texto: "Paga", variante: "success" },
  pendente: { texto: "Pendente", variante: "warning" },
  inadimplente: { texto: "Inadimplente", variante: "destructive" },
};

export function StatusMensalidadeBadge({ status }: { status: StatusMensalidade }) {
  const { texto, variante } = rotulos[status];
  return <Badge variant={variante}>{texto}</Badge>;
}
