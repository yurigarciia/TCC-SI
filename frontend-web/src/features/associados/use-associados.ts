"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
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

export function useAssociados() {
  return useQuery({
    queryKey: CHAVE_LISTA,
    queryFn: () => apiFetch<Associado[]>("/associados"),
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

export function useCategoriasSocio() {
  return useQuery({
    queryKey: CHAVE_CATEGORIAS,
    queryFn: () => apiFetch<CategoriaSocio[]>("/categorias-socio"),
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
    mutationFn: () => apiFetch(`/associados/${id}/aprovar`, { method: "POST" }),
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
