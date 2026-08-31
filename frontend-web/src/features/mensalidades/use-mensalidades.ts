"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type { ItemInadimplencia, Mensalidade } from "./types";

const CHAVE_INADIMPLENTES = ["mensalidades", "inadimplentes"] as const;
const chaveHistorico = (associadoId: string) => ["mensalidades", "associado", associadoId] as const;

export function useInadimplentes(pagina: number, limite: number = LIMITE_PADRAO) {
  return useQuery({
    queryKey: [...CHAVE_INADIMPLENTES, pagina, limite],
    queryFn: () =>
      apiFetch<PaginaResultado<ItemInadimplencia>>(
        `/mensalidades/inadimplentes?pagina=${pagina}&limite=${limite}`,
      ),
  });
}

export function useHistoricoMensalidades(associadoId: string) {
  return useQuery({
    queryKey: chaveHistorico(associadoId),
    queryFn: () => apiFetch<Mensalidade[]>(`/mensalidades/associado/${associadoId}`),
    enabled: !!associadoId,
  });
}

export function useGerarCobrancasDoMes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<Mensalidade[]>("/mensalidades/gerar", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mensalidades"] });
    },
  });
}

export function useProcessarInadimplencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<Mensalidade[]>("/mensalidades/processar-inadimplencia", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mensalidades"] });
    },
  });
}

export function useLancarPagamentoPresencial(associadoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mensalidadeId: string) =>
      apiFetch<Mensalidade>(`/mensalidades/${mensalidadeId}/pagamento-presencial`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveHistorico(associadoId) });
      queryClient.invalidateQueries({ queryKey: CHAVE_INADIMPLENTES });
    },
  });
}
