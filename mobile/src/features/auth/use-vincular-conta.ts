import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "./auth-context";
import type { Associado, LoginResponse, VincularContaInput } from "./types";

// RF01 (canal associado) — "reivindicar" a conta de um cadastro já feito pela diretoria
// (T-BE-014). Loga automaticamente após vincular, mesmo padrão de useAutoCadastro.
export function useVincularConta() {
  const { entrar } = useAuth();
  return useMutation({
    mutationFn: async (dados: VincularContaInput) => {
      const associado = await apiFetch<Associado>("/associados/vincular-conta", {
        method: "POST",
        body: JSON.stringify(dados),
        auth: false,
      });
      const login = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: dados.email, senha: dados.senha }),
        auth: false,
      });
      return { associado, login };
    },
    onSuccess: ({ login }) => entrar(login.accessToken),
  });
}
