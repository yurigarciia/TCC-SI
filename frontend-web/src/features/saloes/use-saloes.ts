"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { construirQueryPaginacao, LIMITE_PADRAO, type PaginaResultado } from "@/lib/pagination";
import type {
  AreaEstrutural,
  AtualizarAreaEstruturalInput,
  AtualizarMesaInput,
  ElementoEstrutural,
  Mesa,
  NovaAreaEstruturalInput,
  NovaMesaInput,
  NovoElementoEstruturalInput,
  NovoSalaoInput,
  Salao,
  SalaoComMesas,
} from "./types";

const CHAVE_LISTA = ["saloes"] as const;
const chaveDetalhe = (id: string) => ["saloes", id] as const;

export function useSaloes(pagina: number, busca?: string, limite: number = LIMITE_PADRAO) {
  return useQuery({
    queryKey: [...CHAVE_LISTA, pagina, limite, busca ?? ""],
    queryFn: () =>
      apiFetch<PaginaResultado<Salao>>(`/saloes?${construirQueryPaginacao(pagina, limite, busca)}`),
  });
}

export function useSalao(id: string) {
  return useQuery({
    queryKey: chaveDetalhe(id),
    queryFn: () => apiFetch<SalaoComMesas>(`/saloes/${id}`),
    enabled: !!id,
  });
}

export function useCriarSalao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovoSalaoInput) =>
      apiFetch<Salao>("/saloes", { method: "POST", body: JSON.stringify(dados) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE_LISTA });
    },
  });
}

// Grava a resposta da API direto no cache do salão (em vez de só invalidar e esperar um refetch)
// — achado numa conversa com o usuário: arrastar/adicionar qualquer coisa no croqui fazia o item
// sumir por um instante e reaparecer, porque a tela ficava esperando a rodada extra de rede do
// refetch pra mostrar o resultado de novo. Gravando aqui, a mudança aparece assim que a mutação
// termina; a invalidação continua rodando por baixo, só que sem travar a UI por ela.
function atualizarCacheSalao(
  queryClient: ReturnType<typeof useQueryClient>,
  salaoId: string,
  atualizar: (atual: SalaoComMesas) => SalaoComMesas,
) {
  queryClient.setQueryData<SalaoComMesas>(chaveDetalhe(salaoId), (atual) =>
    atual ? atualizar(atual) : atual,
  );
  queryClient.invalidateQueries({ queryKey: chaveDetalhe(salaoId), refetchType: "none" });
}

export function useAdicionarMesa(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovaMesaInput) =>
      apiFetch<Mesa>(`/saloes/${salaoId}/mesas`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    onSuccess: (mesaCriada) => {
      atualizarCacheSalao(queryClient, salaoId, (atual) => ({
        ...atual,
        mesas: [...atual.mesas, mesaCriada],
      }));
    },
  });
}

// Achado numa conversa com o usuário (QA do cadastro/edição de croqui): só dava pra adicionar
// mesa, nunca corrigir um clique errado. Editar não tem restrição — número/capacidade/posição
// nunca invalidam reserva nenhuma (ver adendo em T-FE-005 no PLANEJAMENTO-GERAL.md).
export function useAtualizarMesa(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mesaId, dados }: { mesaId: string; dados: AtualizarMesaInput }) =>
      apiFetch<Mesa>(`/saloes/${salaoId}/mesas/${mesaId}`, {
        method: "PATCH",
        body: JSON.stringify(dados),
      }),
    onSuccess: (mesaAtualizada) => {
      atualizarCacheSalao(queryClient, salaoId, (atual) => ({
        ...atual,
        mesas: atual.mesas.map((m) => (m.id === mesaAtualizada.id ? mesaAtualizada : m)),
      }));
    },
  });
}

// Backend recusa (409) se a mesa já foi usada em reserva ou configuração de evento — ver
// RemoverMesaUseCase.
export function useRemoverMesa(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mesaId: string) =>
      apiFetch<void>(`/saloes/${salaoId}/mesas/${mesaId}`, { method: "DELETE" }),
    onSuccess: (_dados, mesaId) => {
      atualizarCacheSalao(queryClient, salaoId, (atual) => ({
        ...atual,
        mesas: atual.mesas.filter((m) => m.id !== mesaId),
      }));
    },
  });
}

// Parede/porta desenhada no croqui — achado numa conversa com o usuário: mesas soltas num plano
// em branco não davam pra reconhecer o salão de verdade.
export function useAdicionarElemento(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovoElementoEstruturalInput) =>
      apiFetch<ElementoEstrutural>(`/saloes/${salaoId}/elementos`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    onSuccess: (elementoCriado) => {
      atualizarCacheSalao(queryClient, salaoId, (atual) => ({
        ...atual,
        elementos: [...atual.elementos, elementoCriado],
      }));
    },
  });
}

export function useRemoverElemento(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (elementoId: string) =>
      apiFetch<void>(`/saloes/${salaoId}/elementos/${elementoId}`, { method: "DELETE" }),
    onSuccess: (_dados, elementoId) => {
      atualizarCacheSalao(queryClient, salaoId, (atual) => ({
        ...atual,
        elementos: atual.elementos.filter((e) => e.id !== elementoId),
      }));
    },
  });
}

// Área nomeada livremente (tablado, bar, pista de dança...) — mesmo raciocínio de
// parede/porta, mas como retângulo em vez de traço. Ver AreaEstrutural no backend.
export function useAdicionarArea(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: NovaAreaEstruturalInput) =>
      apiFetch<AreaEstrutural>(`/saloes/${salaoId}/areas`, {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    onSuccess: (areaCriada) => {
      atualizarCacheSalao(queryClient, salaoId, (atual) => ({
        ...atual,
        areas: [...atual.areas, areaCriada],
      }));
    },
  });
}

// Usado tanto pra arrastar a área pro croqui (só x/y) quanto pra renomear ela.
export function useAtualizarArea(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ areaId, dados }: { areaId: string; dados: AtualizarAreaEstruturalInput }) =>
      apiFetch<AreaEstrutural>(`/saloes/${salaoId}/areas/${areaId}`, {
        method: "PATCH",
        body: JSON.stringify(dados),
      }),
    onSuccess: (areaAtualizada) => {
      atualizarCacheSalao(queryClient, salaoId, (atual) => ({
        ...atual,
        areas: atual.areas.map((a) => (a.id === areaAtualizada.id ? areaAtualizada : a)),
      }));
    },
  });
}

export function useRemoverArea(salaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (areaId: string) =>
      apiFetch<void>(`/saloes/${salaoId}/areas/${areaId}`, { method: "DELETE" }),
    onSuccess: (_dados, areaId) => {
      atualizarCacheSalao(queryClient, salaoId, (atual) => ({
        ...atual,
        areas: atual.areas.filter((a) => a.id !== areaId),
      }));
    },
  });
}
