import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type {
  Evento,
  EventoDetalhado,
  FormaPagamentoReserva,
  MesaNoMapa,
} from "./types";

// RF13 — vitrine pública, mesmo endpoint sem auth do painel web.
export function useEventosPublicados() {
  return useQuery({
    queryKey: ["eventos", "publicados"],
    queryFn: () => apiFetch<Evento[]>("/eventos/publicados", { auth: false }),
  });
}

// RF11/RF12 (T-MOB-004) — detalhe público (preço/mesas/ingresso) de um evento já publicado.
export function useEventoPublicado(id: string) {
  return useQuery({
    queryKey: ["eventos", "publicados", id],
    queryFn: () => apiFetch<EventoDetalhado>(`/eventos/publicados/${id}`, { auth: false }),
    enabled: !!id,
  });
}

// RF14 — disponibilidade de mesas em tempo real, mesmo endpoint do painel web (agora também
// acessível pro associado, ver T-MOB-004 no PLANEJAMENTO-GERAL.md).
export function useMapaMesas(eventoId: string) {
  return useQuery({
    queryKey: ["eventos", eventoId, "mapa-mesas"],
    queryFn: () => apiFetch<MesaNoMapa[]>(`/eventos/${eventoId}/mapa-mesas`),
    enabled: !!eventoId,
  });
}

// RF11 (T-MOB-004) — associado solicita a própria mesa pelo app; canal/titular/associadoId são
// sempre resolvidos no backend a partir do usuário autenticado (POST .../reservar-minha), só a
// forma de pagamento vem daqui.
export function useSolicitarMinhaReserva(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mesaId,
      formaPagamento,
    }: {
      mesaId: string;
      formaPagamento: FormaPagamentoReserva;
    }) =>
      apiFetch(`/eventos/${eventoId}/mesas/${mesaId}/reservar-minha`, {
        method: "POST",
        body: JSON.stringify({ formaPagamento }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos", eventoId, "mapa-mesas"] });
      queryClient.invalidateQueries({ queryKey: ["reservas", "minhas"] });
    },
  });
}

// RF12 (T-MOB-004) — associado compra o próprio ingresso pelo app (sempre sócio, canal app,
// pagamento online — tudo resolvido no backend, POST .../meu-ingresso não recebe corpo).
export function useComprarMeuIngresso(eventoId: string) {
  return useMutation({
    mutationFn: () => apiFetch(`/eventos/${eventoId}/meu-ingresso`, { method: "POST" }),
  });
}
