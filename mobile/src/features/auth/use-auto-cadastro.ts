import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "./auth-context";
import type { Associado, AutoCadastroInput, LoginResponse } from "./types";

// RF01 (canal associado) — cadastro público, entra Pendente de validação até a diretoria aprovar
// (mesmo fluxo do painel web). Loga automaticamente após o cadastro — o associado já pode abrir o
// app e ver o próprio status "Pendente" em vez de precisar logar de novo na mão.
export function useAutoCadastro() {
  const { entrar } = useAuth();
  return useMutation({
    mutationFn: async (dados: AutoCadastroInput) => {
      const associado = await apiFetch<Associado>("/associados/auto-cadastro", {
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
