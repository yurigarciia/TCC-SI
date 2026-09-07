"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { construirQueryPaginacao, LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type {
  AtualizarMesaInput,
  Mesa,
  NovaMesaInput,
  NovoSalaoInput,
  Salao,
  SalaoComMesas,
} from "./types";

const CHAVE_LISTA = ["saloes"] as const;
const chaveDetalhe = (id: string) => ["saloes", id] as const;

export function useSaloes(pagina: number, busca?: string, limite: number = LIMITE_PADRAO) {
  return useQuery({
    queryKey: [...CHAVE_LISTA, pagina, limite, busca ?? ""],
    queryFn: () =>
      apiFetch<PaginaResultado<Salao>>(`/saloes?${construirQueryPaginacao(pagina, limite, busca)}`),
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

// Achado numa conversa com o usuário (QA do cadastro/edição de croqui): só dava pra adicionar
// mesa, nunca corrigir um clique errado. Editar não tem restrição — número/capacidade/posição
// nunca invalidam reserva nenhuma (ver adendo em T-FE-005 no PLANEJAMENTO-GERAL.md).
export function useAtualizarMesa(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mesaId, dados }: { mesaId: string; dados: AtualizarMesaInput }) =>
      apiFetch<Mesa>(`/saloes/${salaoId}/mesas/${mesaId}`, {
        method: "PATCH",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(salaoId) });
    },
  });
}

// Backend recusa (409) se a mesa já foi usada em reserva ou configuração de evento — ver
// RemoverMesaUseCase.
export function useRemoverMesa(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mesaId: string) =>
      apiFetch<void>(`/saloes/${salaoId}/mesas/${mesaId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(salaoId) });
    },
  });
}
