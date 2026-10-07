"use client";

import { Users } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssociados } from "@/features/associados/use-associados";
import { StatusAssociadoBadge } from "@/features/associados/status-badge";
import { TableEmptyRow } from "@/components/table-empty-row";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";

export default function AssociadosPage() {
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const { data: resultado, isLoading, isError } = useAssociados(pagina, busca || undefined);
  const associados = resultado?.itens;

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
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os associados. Tente novamente em instantes.
        </p>
      )}

      {associados && (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {associados.length === 0 ? (
                <TableEmptyRow colSpan={4}>
                  {busca
                    ? "Nenhum associado encontrado para esse termo."
                    : "Nenhum associado cadastrado ainda."}
                </TableEmptyRow>
              ) : (
                associados.map((associado, indice) => (
                  <TableRow
                    key={associado.id}
                    className={indice % 2 === 1 ? "bg-muted/50" : undefined}
                  >
                    <TableCell className="font-medium">
                      <Link href={`/associados/${associado.id}`} className="hover:underline">
                        {associado.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{associado.cpf}</TableCell>
                    <TableCell className="capitalize">
                      {associado.origem === "auto_cadastro" ? "Auto-cadastro" : "Mediado"}
                    </TableCell>
                    <TableCell>
                      <StatusAssociadoBadge status={associado.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {resultado && <Pagination pagina={resultado} onMudarPagina={setPagina} />}
        </div>
      )}
    </div>
  );
}
