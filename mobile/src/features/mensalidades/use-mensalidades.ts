import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Mensalidade } from "./types";

const CHAVE_MINHAS = ["mensalidades", "minhas"] as const;

// RF05/RF06/RF08 (lado associado, T-MOB-002) — "ver mensalidade atual e histórico".
export function useMinhasMensalidades() {
  return useQuery({
    queryKey: CHAVE_MINHAS,
    queryFn: () => apiFetch<Mensalidade[]>("/mensalidades/minhas"),
  });
}

// O adapter de pagamento em uso hoje (FakePaymentGatewayAdapter) aprova a cobrança na hora — não
// há checkout/redirecionamento real ainda (decisão de provedor em aberto, ver PLANEJAMENTO-GERAL.md
// Open Questions). Por isso "pagar" no app encadeia iniciar+confirmar como uma ação só, do ponto
// de vista do associado. Quando um provedor real entrar, esse hook é o único lugar a mudar — a
// tela não precisa saber como o checkout funciona por dentro.
export function usePagarMinhaMensalidadeOnline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mensalidadeId: string) => {
      await apiFetch(`/mensalidades/minhas/${mensalidadeId}/pagamento-online/iniciar`, {
        method: "POST",
      });
      return apiFetch<Mensalidade>(
        `/mensalidades/minhas/${mensalidadeId}/pagamento-online/confirmar`,
        { method: "POST" },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_MINHAS });
    },
  });
}
