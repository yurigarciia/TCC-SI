"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { construirQueryPaginacao, LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type {
  AlterarSenhaInput,
  AtualizarUsuarioInput,
  CriarAdministradorInput,
  Usuario,
} from "./types";

const CHAVE_LISTA = ["usuarios"] as const;

// perfil: tela de usuários do painel é gestão de contas administrativas — por padrão filtra só
// "administrador", pra não listar associados junto (eles não têm acesso ao painel).
export function useUsuarios(
  pagina: number,
  busca?: string,
  limite: number = LIMITE_PADRAO,
  perfil: "administrador" | "associado" = "administrador",
) {
  return useQuery({
    queryKey: [...CHAVE_LISTA, pagina, limite, busca ?? "", perfil],
    queryFn: () =>
      apiFetch<PaginaResultado<Usuario>>(
        `/auth/usuarios?${construirQueryPaginacao(pagina, limite, busca)}&perfil=${perfil}`,
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

export function useAtualizarUsuario(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: AtualizarUsuarioInput) =>
      apiFetch<Usuario>(`/auth/usuarios/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
    },
  });
}

export function useExcluirUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/auth/usuarios/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
    },
  });
}

// Self-service — não tem chave de cache pra invalidar, não altera nenhuma lista.
export function useAlterarSenha() {
  return useMutation({
    mutationFn: (dados: AlterarSenhaInput) =>
      apiFetch("/auth/alterar-senha", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
  });
}
