import { Badge } from "@/components/ui/badge";
import type { StatusEvento } from "./types";

// Não existe status "encerrado" no backend (enum só tem rascunho/publicado) — um evento
// publicado cuja data já passou é exibido como "Encerrado" apenas visualmente, calculado a
// partir da data do evento, sem alterar o status persistido.
export function StatusEventoBadge({ status, data }: { status: StatusEvento; data?: string }) {
  if (status === "publicado") {
    const encerrado = data ? new Date(data).getTime() < Date.now() : false;
    return encerrado ? (
      <Badge variant="secondary">Encerrado</Badge>
    ) : (
      <Badge variant="success">Publicado</Badge>
    );
  }
  return <Badge variant="secondary">Rascunho</Badge>;
}
