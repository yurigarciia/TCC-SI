"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type {
  CanalIngresso,
  EmitirIngressoInput,
  Ingresso,
  IngressoDetalhado,
  ResumoIngressosEvento,
} from "./types";

const chaveIngressos = (eventoId: string, pagina: number, nome?: string) =>
  ["eventos", eventoId, "ingressos", pagina, nome ?? ""] as const;

export function useIngressosEvento(
  eventoId: string,
  pagina: number,
  nome?: string,
  limite: number = LIMITE_PADRAO,
) {
  return useQuery({
    queryKey: chaveIngressos(eventoId, pagina, nome),
    queryFn: () => {
      const query = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
      if (nome) query.set("nome", nome);
      return apiFetch<PaginaResultado<Ingresso>>(
        `/eventos/${eventoId}/ingressos?${query.toString()}`,
      );
    },
    enabled: !!eventoId,
  });
}

// "Big numbers" pra acompanhar o evento no dia — agregado no backend, cobre o evento inteiro.
// Chave aninhada sob o mesmo prefixo de useIngressosEvento de propósito: invalidar
// ["eventos", eventoId, "ingressos"] (emitir/check-in, abaixo) já invalida este também, sem
// precisar de uma chamada de invalidação extra.
export function useResumoIngressosEvento(eventoId: string) {
  return useQuery({
    queryKey: ["eventos", eventoId, "ingressos", "resumo"] as const,
    queryFn: () => apiFetch<ResumoIngressosEvento>(`/eventos/${eventoId}/ingressos/resumo`),
    enabled: !!eventoId,
  });
}

// Venda sempre mediada pela diretoria neste painel (RNF01) — o canal "app" é exclusivo da compra
// pelo associado no aplicativo (T-MOB), sempre com pagamento online (ver emissao-ingresso.json).
export function useEmitirIngresso(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: EmitirIngressoInput) =>
      apiFetch<Ingresso>(`/eventos/${eventoId}/ingressos`, {
        method: "POST",
        body: JSON.stringify({ ...dados, canal: "mediado" satisfies CanalIngresso }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos", eventoId, "ingressos"] });
    },
  });
}

// Detalhe de um ingresso lido por QR (ou código digitado) — alimenta a tela de conferência antes
// do check-in de verdade (ver useRegistrarCheckin, abaixo). `enabled: !!id` porque o id só existe
// depois de uma leitura — a query fica ociosa enquanto a câmera ainda não achou nada.
export function useIngresso(id: string | null) {
  return useQuery({
    queryKey: ["ingressos", id] as const,
    queryFn: () => apiFetch<IngressoDetalhado>(`/ingressos/${id}`),
    enabled: !!id,
    retry: false,
  });
}

// Check-in por id (leitura de QR — o painel web trata o código lido como o próprio id do
// ingresso, digitado ou colado por um leitor USB/câmera que funciona como teclado) ou pelo botão
// na linha da busca manual por nome (emissao-ingresso.json: "os dois formatos coexistem").
export function useRegistrarCheckin(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ingressoId: string) =>
      apiFetch<Ingresso>(`/ingressos/${ingressoId}/checkin`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos", eventoId, "ingressos"] });
    },
  });
}
