"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { UsuarioAutenticado } from "./types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<UsuarioAutenticado>("/auth/me"),
    retry: false,
  });
}
