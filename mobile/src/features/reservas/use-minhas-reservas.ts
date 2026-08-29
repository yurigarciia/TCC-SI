import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ReservaDoAssociado } from "./types";

// RF13 — "Minhas Reservas". Só reflete reservas que tinham associadoId informado na criação
// (reserva mediada pela diretoria pode continuar sem vínculo, ver nota em
// ListarMinhasReservasUseCase no backend).
export function useMinhasReservas() {
  return useQuery({
    queryKey: ["reservas", "minhas"],
    queryFn: () => apiFetch<ReservaDoAssociado[]>("/reservas/minhas"),
  });
}
