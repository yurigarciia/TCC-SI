"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { construirQueryPaginacao, LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type {
  AtualizarEventoInput,
  ConfigurarIngressoInput,
  ConfiguracaoMesaInput,
  DefinirPrecoIngressoInput,
  Evento,
  EventoDetalhado,
  NovoEventoInput,
  PrecosIngressoConfigurados,
} from "./types";

const CHAVE_LISTA = ["eventos"] as const;
const chaveDetalhe = (id: string) => ["eventos", id] as const;

export function useEventos(pagina: number, busca?: string, limite: number = LIMITE_PADRAO) {
  return useQuery({
    queryKey: [...CHAVE_LISTA, pagina, limite, busca ?? ""],
    queryFn: () =>
      apiFetch<PaginaResultado<Evento>>(`/eventos?${construirQueryPaginacao(pagina, limite, busca)}`),
  });
}

export function useEvento(id: string) {
  return useQuery({
    queryKey: chaveDetalhe(id),
    queryFn: () => apiFetch<EventoDetalhado>(`/eventos/${id}`),
    enabled: !!id,
  });
}

export function useCriarEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovoEventoInput) =>
      apiFetch<Evento>("/eventos", { method: "POST", body: JSON.stringify(dados) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
    },
  });
}

export function useAtualizarEvento(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: AtualizarEventoInput) =>
      apiFetch<Evento>(`/eventos/${eventoId}`, {
        method: "PATCH",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(eventoId) });
    },
  });
}

const chavePrecos = (eventoId: string) => ["eventos", eventoId, "precos-ingresso"] as const;

export function usePrecosIngressoEvento(eventoId: string) {
  return useQuery({
    queryKey: chavePrecos(eventoId),
    queryFn: () =>
      apiFetch<PrecosIngressoConfigurados>(`/eventos/${eventoId}/precos-ingresso`),
    enabled: !!eventoId,
  });
}

export function useDefinirPrecoIngressoEvento(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: DefinirPrecoIngressoInput) =>
      apiFetch(`/eventos/${eventoId}/precos-ingresso`, {
        method: "PUT",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chavePrecos(eventoId) });
    },
  });
}

export function useConfigurarMesasEvento(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mesas: ConfiguracaoMesaInput[]) =>
      apiFetch(`/eventos/${eventoId}/mesas`, {
        method: "PUT",
        body: JSON.stringify({ mesas }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(eventoId) });
    },
  });
}

export function useConfigurarIngressoEvento(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: ConfigurarIngressoInput) =>
      apiFetch(`/eventos/${eventoId}/ingresso`, {
        method: "PUT",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(eventoId) });
    },
  });
}

export function usePublicarEvento(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<Evento>(`/eventos/${eventoId}/publicar`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(eventoId) });
    },
  });
}
