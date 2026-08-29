import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Associado } from "@/features/auth/types";

export function useCurrentAssociado() {
  return useQuery({
    queryKey: ["associados", "me"],
    queryFn: () => apiFetch<Associado>("/associados/me"),
  });
}
