import { Badge } from "@/components/ui/badge";
import type { PerfilComprador, StatusIngresso } from "./types";

export function StatusIngressoBadge({ status }: { status: StatusIngresso }) {
  return status === "usado" ? (
    <Badge variant="success">Usado</Badge>
  ) : (
    <Badge variant="outline">Emitido</Badge>
  );
}

const ROTULO_PERFIL: Record<PerfilComprador, string> = {
  socio: "Sócio",
  nao_socio: "Não-sócio",
  crianca: "Criança",
};

export function rotuloPerfilComprador(perfil: PerfilComprador): string {
  return ROTULO_PERFIL[perfil];
}
