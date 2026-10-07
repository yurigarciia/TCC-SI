"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { clearAuthToken, setAuthToken } from "@/lib/auth-token";
import type { LoginInput, LoginResponse, UsuarioAutenticado } from "./types";

export class AcessoNegadoError extends Error {
  constructor() {
    super("Acesso restrito à diretoria. Use o aplicativo do associado.");
    this.name = "AcessoNegadoError";
  }
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: LoginInput) =>
      apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(dados),
        auth: false,
      }),
    onSuccess: async ({ accessToken }) => {
      setAuthToken(accessToken);
      const usuario = await queryClient.fetchQuery({
        queryKey: ["auth", "me"],
        queryFn: () => apiFetch<UsuarioAutenticado>("/auth/me"),
        staleTime: 0,
      });
      if (usuario.perfil !== "administrador") {
        clearAuthToken();
        queryClient.removeQueries({ queryKey: ["auth", "me"] });
        throw new AcessoNegadoError();
      }
      router.push("/");
      router.refresh();
    },
  });
}
