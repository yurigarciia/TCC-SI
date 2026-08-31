"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type { CriarAdministradorInput, Usuario } from "./types";

const CHAVE_LISTA = ["usuarios"] as const;

export function useUsuarios(pagina: number, limite: number = LIMITE_PADRAO) {
  return useQuery({
    queryKey: [...CHAVE_LISTA, pagina, limite],
    queryFn: () =>
      apiFetch<PaginaResultado<Usuario>>(`/auth/usuarios?pagina=${pagina}&limite=${limite}`),
  });
}

export function useCriarAdministrador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarAdministradorInput) =>
      apiFetch<Usuario>("/auth/usuarios", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
    },
  });
}
