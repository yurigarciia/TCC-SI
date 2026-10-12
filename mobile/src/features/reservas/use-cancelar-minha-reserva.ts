import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// Achado numa conversa com o usuário: RF15 (cancelar) já existia no backend, mas só pra
// diretoria — o associado não tinha como desistir de uma mesa reservada pelo próprio app sem
// ligar pra diretoria. Mesmo padrão de reservar-minha, mas no sentido inverso (ver
// CancelarMinhaReservaUseCase).
export function useCancelarMinhaReserva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservaId: string) =>
      apiFetch(`/reservas/${reservaId}/cancelar-minha`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservas", "minhas"] });
    },
  });
}
