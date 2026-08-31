"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { construirQueryPaginacao, LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type { CriarAdministradorInput, Usuario } from "./types";

const CHAVE_LISTA = ["usuarios"] as const;

export function useUsuarios(pagina: number, busca?: string, limite: number = LIMITE_PADRAO) {
  return useQuery({
    queryKey: [...CHAVE_LISTA, pagina, limite, busca ?? ""],
    queryFn: () =>
      apiFetch<PaginaResultado<Usuario>>(
        `/auth/usuarios?${construirQueryPaginacao(pagina, limite, busca)}`,
      ),
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
