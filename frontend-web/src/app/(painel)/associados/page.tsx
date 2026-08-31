"use client";

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

export default function AssociadosPage() {
  const [pagina, setPagina] = useState(1);
  const { data: resultado, isLoading, isError } = useAssociados(pagina);
  const associados = resultado?.itens;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Associados</h1>
          <p className="text-muted-foreground">
            Cadastro, dependentes e situação de cada associado.
          </p>
        </div>
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
        <div className="overflow-x-auto rounded-lg border">
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
                <TableEmptyRow colSpan={4}>Nenhum associado cadastrado ainda.</TableEmptyRow>
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
