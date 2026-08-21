import { Badge } from "@/components/ui/badge";
import type { StatusEvento } from "./types";

export function StatusEventoBadge({ status }: { status: StatusEvento }) {
  return status === "publicado" ? (
    <Badge variant="success">Publicado</Badge>
  ) : (
    <Badge variant="secondary">Rascunho</Badge>
  );
}
