"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth-token";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clearAuthToken();
    queryClient.clear();
    router.push("/login");
    router.refresh();
  };
}
