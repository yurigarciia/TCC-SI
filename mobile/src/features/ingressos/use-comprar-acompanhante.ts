import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { PerfilAcompanhante, PrecosAcompanhante } from "./types";

// Preço fixo de não-sócio/criança pra este evento (não varia por categoria, diferente do preço
// de sócio — ver useMeuPrecoIngresso). Usado no passo "comprar acompanhante" do fluxo de
// ingressos, pra mostrar o valor antes de confirmar.
export function usePrecosAcompanhante(eventoId: string) {
  return useQuery({
    queryKey: ["eventos", eventoId, "precos-ingresso-acompanhante"],
    queryFn: () =>
      apiFetch<PrecosAcompanhante>(`/eventos/${eventoId}/precos-ingresso-acompanhante`),
    enabled: !!eventoId,
  });
}

// Achado numa conversa com o usuário: comprar pelo app só cobria o ingresso do próprio
// associado — sem jeito de levar acompanhante (família/amigo sem cadastro) sem precisar
// procurar a diretoria. Um ingresso por chamada; o fluxo de compra (ver eventos/[id].tsx) repete
// a chamada pra cada acompanhante adicionado.
export function useComprarIngressoAcompanhante(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      nomeComprador,
      perfilComprador,
    }: {
      nomeComprador: string;
      perfilComprador: PerfilAcompanhante;
    }) =>
      apiFetch(`/eventos/${eventoId}/ingressos-acompanhante`, {
        method: "POST",
        body: JSON.stringify({ nomeComprador, perfilComprador }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingressos", "minhas"] });
    },
  });
}
