"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { setAuthToken } from "@/lib/auth-token";
import type { LoginInput, LoginResponse } from "./types";

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
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push("/");
      router.refresh();
    },
  });
}
