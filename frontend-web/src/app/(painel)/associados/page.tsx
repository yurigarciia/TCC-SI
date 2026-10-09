"use client";

import { Activity, Calendar, Clock, Mail, Pencil, Phone, Tag, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssociados, useCategoriasSocio } from "@/features/associados/use-associados";
import { StatusAssociadoBadge } from "@/features/associados/status-badge";
import { useSituacaoPagamento } from "@/features/mensalidades/use-mensalidades";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";
import { formatarCpf, formatarData, formatarTelefone, pareceEmail } from "@/lib/format";

const COLUNAS =
  "md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,1.6fr)_6.5rem_6.5rem_2.5rem] md:items-center md:gap-4";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

export default function AssociadosPage() {
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const { data: resultado, isLoading, isError } = useAssociados(pagina, busca || undefined);
  const { data: resultadoCategorias } = useCategoriasSocio(1, undefined, 100);
  const associados = resultado?.itens;
  const { data: situacoes } = useSituacaoPagamento(associados?.map((a) => a.id) ?? []);

  const nomesCategorias = new Map(resultadoCategorias?.itens.map((c) => [c.id, c.nome]));

  const mudarBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground"><Users aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />Associados</h1>
        <p className="text-sm text-muted-foreground">Cadastro e situação de cada associado.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={busca} onChange={mudarBusca} placeholder="Buscar por nome ou CPF" />
        <Button render={<Link href="/associados/novo" />}>Novo associado</Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os associados. Tente novamente em instantes.
        </p>
      )}

      {associados && associados.length === 0 && (
        <p className="rounded-xl border bg-card py-10 text-center text-sm text-muted-foreground shadow-sm">
          {busca ? "Nenhum associado encontrado para esse termo." : "Nenhum associado cadastrado ainda."}
        </p>
      )}

      {associados && associados.length > 0 && (
        <div className="space-y-3">
          <div
            className={`hidden h-12 rounded-xl border bg-card px-4 text-sm font-semibold text-foreground shadow-sm md:grid ${COLUNAS}`}
          >
            <span>Associado</span>
            <span>Categoria</span>
            <span>Situação</span>
            <span>Criado</span>
            <span>Atualizado</span>
            <span />
          </div>
          <ul className="space-y-3">
            {associados.map((associado) => {
              const emDia = situacoes?.[associado.id] !== "inadimplente";
              const email = pareceEmail(associado.contato);
              const contato = email ? associado.contato : formatarTelefone(associado.contato);
              const IconeContato = email ? Mail : Phone;
              return (
                <li
                  key={associado.id}
                  className={`group relative flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition duration-200 hover:scale-[1.01] hover:bg-[#f3e2bf]/60 hover:shadow-md md:grid ${COLUNAS}`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                      {iniciais(associado.nome)}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/associados/${associado.id}`}
                        className="block truncate font-semibold text-foreground after:absolute after:inset-0 after:content-[''] hover:underline"
                      >
                        {associado.nome}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatarCpf(associado.cpf)}</p>
                      <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                        <IconeContato aria-hidden="true" className="size-3.5 shrink-0" />
                        {contato}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-sm">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Tag aria-hidden="true" className="size-3.5" />
                      Categoria
                    </p>
                    <div className="mt-1 flex h-6 items-center">
                      <Badge variant="outline">
                      {nomesCategorias.get(associado.categoriaSocioId ?? "") ?? "Sem categoria"}
                    </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-sm">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Activity aria-hidden="true" className="size-3.5" />
                      Situação
                    </p>
                    <div className="mt-1 flex h-6 flex-wrap items-center gap-2">
                      <StatusAssociadoBadge status={associado.status} />
                      <Badge variant={emDia ? "success" : "destructive"}>
                        {emDia ? "Em dia" : "Inadimplente"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-sm">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar aria-hidden="true" className="size-3.5" />
                      Criado
                    </p>
                    <p className="mt-1 flex h-6 items-center">{formatarData(associado.criadoEm)}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center text-sm">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock aria-hidden="true" className="size-3.5" />
                      Atualizado
                    </p>
                    <p className="mt-1 flex h-6 items-center">{formatarData(associado.atualizadoEm)}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="relative z-10"
                    render={
                      <Link
                        href={`/associados/${associado.id}/editar`}
                        aria-label={`Editar ${associado.nome}`}
                      />
                    }
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ul>
          {resultado && (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm [&>div]:border-t-0">
              <Pagination pagina={resultado} onMudarPagina={setPagina} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
