"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { CanalReserva, MesaNoMapa, Reserva, SolicitarReservaInput } from "./types";

const chaveMapa = (eventoId: string) => ["eventos", eventoId, "mapa-mesas"] as const;

export function useMapaMesas(eventoId: string) {
  return useQuery({
    queryKey: chaveMapa(eventoId),
    queryFn: () => apiFetch<MesaNoMapa[]>(`/eventos/${eventoId}/mapa-mesas`),
    enabled: !!eventoId,
  });
}

// Reserva registrada pela diretoria (RNF01 — sempre mediada quando entra por este painel), sempre
// confirmada na hora (ver comentário em SolicitarReservaUseCase no backend).
export function useSolicitarReservaMediada(eventoId: string, mesaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: SolicitarReservaInput) =>
      apiFetch<Reserva>(`/eventos/${eventoId}/mesas/${mesaId}/reservar`, {
        method: "POST",
        body: JSON.stringify({ ...dados, canal: "mediado" satisfies CanalReserva }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveMapa(eventoId) });
    },
  });
}

export function useConfirmarReserva(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservaId: string) =>
      apiFetch<Reserva>(`/reservas/${reservaId}/confirmar`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveMapa(eventoId) });
    },
  });
}

export function useCancelarReserva(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservaId: string) =>
      apiFetch<Reserva>(`/reservas/${reservaId}/cancelar`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveMapa(eventoId) });
    },
  });
}

export function useTransferirMesa(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reservaId, novaMesaId }: { reservaId: string; novaMesaId: string }) =>
      apiFetch<Reserva>(`/reservas/${reservaId}/transferir-mesa`, {
        method: "POST",
        body: JSON.stringify({ novaMesaId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveMapa(eventoId) });
    },
  });
}

export function useTransferirTitular(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reservaId, novoTitular }: { reservaId: string; novoTitular: string }) =>
      apiFetch<Reserva>(`/reservas/${reservaId}/transferir-titular`, {
        method: "POST",
        body: JSON.stringify({ novoTitular }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveMapa(eventoId) });
    },
  });
}
