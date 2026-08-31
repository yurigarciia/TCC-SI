"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type { Mesa, NovaMesaInput, NovoSalaoInput, Salao, SalaoComMesas } from "./types";

const CHAVE_LISTA = ["saloes"] as const;
const chaveDetalhe = (id: string) => ["saloes", id] as const;

export function useSaloes(pagina: number, limite: number = LIMITE_PADRAO) {
  return useQuery({
    queryKey: [...CHAVE_LISTA, pagina, limite],
    queryFn: () =>
      apiFetch<PaginaResultado<Salao>>(`/saloes?pagina=${pagina}&limite=${limite}`),
  });
}

export function useSalao(id: string) {
  return useQuery({
    queryKey: chaveDetalhe(id),
    queryFn: () => apiFetch<SalaoComMesas>(`/saloes/${id}`),
    enabled: !!id,
  });
}

export function useCriarSalao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovoSalaoInput) =>
      apiFetch<Salao>("/saloes", { method: "POST", body: JSON.stringify(dados) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
    },
  });
}

export function useAdicionarMesa(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovaMesaInput) =>
      apiFetch<Mesa>(`/saloes/${salaoId}/mesas`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(salaoId) });
    },
  });
}
