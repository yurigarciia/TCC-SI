"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { CriarAdministradorInput, Usuario } from "./types";

const CHAVE_LISTA = ["usuarios"] as const;

export function useUsuarios() {
  return useQuery({
    queryKey: CHAVE_LISTA,
    queryFn: () => apiFetch<Usuario[]>("/auth/usuarios"),
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
