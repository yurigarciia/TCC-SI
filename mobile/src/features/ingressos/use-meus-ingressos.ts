import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { IngressoDoAssociado } from "./types";

// "Meus Ingressos" — achado numa conversa com o usuário: comprar pelo app não bastava, o
// associado precisa reabrir o ingresso depois pra mostrar o QR na portaria. O id do ingresso É
// o payload do QR (mesmo valor que o scanner da diretoria no painel web lê).
export function useMeusIngressos() {
  return useQuery({
    queryKey: ["ingressos", "minhas"],
    queryFn: () => apiFetch<IngressoDoAssociado[]>("/ingressos/minhas"),
  });
}
