"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type {
  ConfigurarIngressoInput,
  ConfiguracaoMesaInput,
  Evento,
  EventoDetalhado,
  NovoEventoInput,
} from "./types";

const CHAVE_LISTA = ["eventos"] as const;
const chaveDetalhe = (id: string) => ["eventos", id] as const;

export function useEventos(pagina: number, limite: number = LIMITE_PADRAO) {
  return useQuery({
    queryKey: [...CHAVE_LISTA, pagina, limite],
    queryFn: () =>
      apiFetch<PaginaResultado<Evento>>(`/eventos?pagina=${pagina}&limite=${limite}`),
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
