import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "./auth-context";
import type { LoginInput, LoginResponse } from "./types";

export function useLogin() {
  const { entrar } = useAuth();
  return useMutation({
    mutationFn: (dados: LoginInput) =>
      apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(dados),
        auth: false,
      }),
    onSuccess: (resposta) => entrar(resposta.accessToken),
  });
}
