"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { construirQueryPaginacao, LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type {
  Associado,
  AssociadoDetalhado,
  AtualizarAssociadoInput,
  CadastrarAssociadoMediadoInput,
  CategoriaSocio,
  CriarCategoriaSocioInput,
} from "./types";

const CHAVE_LISTA = ["associados"] as const;
const chaveDetalhe = (id: string) => ["associados", id] as const;

export function useAssociados(pagina: number, busca?: string, limite: number = LIMITE_PADRAO) {
  return useQuery({
    queryKey: [...CHAVE_LISTA, pagina, limite, busca ?? ""],
    queryFn: () =>
      apiFetch<PaginaResultado<Associado>>(
        `/associados?${construirQueryPaginacao(pagina, limite, busca)}`,
      ),
  });
}

export function useAssociado(id: string) {
  return useQuery({
    queryKey: chaveDetalhe(id),
    queryFn: () => apiFetch<AssociadoDetalhado>(`/associados/${id}`),
    enabled: !!id,
  });
}

const CHAVE_CATEGORIAS = ["categorias-socio"] as const;

export function useCategoriasSocio(
  pagina: number,
  busca?: string,
  limite: number = LIMITE_PADRAO,
) {
  return useQuery({
    queryKey: [...CHAVE_CATEGORIAS, pagina, limite, busca ?? ""],
    queryFn: () =>
      apiFetch<PaginaResultado<CategoriaSocio>>(
        `/categorias-socio?${construirQueryPaginacao(pagina, limite, busca)}`,
      ),
  });
}

export function useCriarCategoriaSocio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarCategoriaSocioInput) =>
      apiFetch<CategoriaSocio>("/categorias-socio", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_CATEGORIAS });
    },
  });
}

export function useCadastrarAssociadoMediado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: CadastrarAssociadoMediadoInput) =>
      apiFetch<{ associado: Associado }>("/associados", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
    },
  });
}

export function useAtualizarAssociado(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: AtualizarAssociadoInput) =>
      apiFetch<Associado>(`/associados/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(id) });
    },
  });
}

export function useAdicionarDependente(associadoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: { nome: string; dataNascimento: string }) =>
      apiFetch(`/associados/${associadoId}/dependentes`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(associadoId) });
    },
  });
}

export function useAprovarCadastro(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoriaSocioId?: string) =>
      apiFetch(`/associados/${id}/aprovar`, {
        method: "POST",
        body: JSON.stringify({ categoriaSocioId: categoriaSocioId || undefined }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(id) });
    },
  });
}

export function useRejeitarCadastro(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`/associados/${id}/rejeitar`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
      queryClient.invalidateQueries({ queryKey: chaveDetalhe(id) });
    },
  });
}
