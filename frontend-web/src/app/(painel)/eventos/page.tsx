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
import { StatusEventoBadge } from "@/features/eventos/status-badge";
import { useEventos } from "@/features/eventos/use-eventos";
import { formatarDataHora } from "@/lib/format";
import { TableEmptyRow } from "@/components/table-empty-row";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";

export default function EventosPage() {
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const { data: resultado, isLoading, isError } = useEventos(pagina, busca || undefined);
  const eventos = resultado?.itens;

  const mudarBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Eventos</h1>
        <p className="text-sm text-muted-foreground">Bailes e fandangos.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={busca} onChange={mudarBusca} placeholder="Buscar por nome" />
        <Button render={<Link href="/eventos/novo" />}>Novo evento</Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os eventos. Tente novamente em instantes.
        </p>
      )}

      {eventos && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventos.length === 0 ? (
                <TableEmptyRow colSpan={4}>
                  {busca
                    ? "Nenhum evento encontrado para esse termo."
                    : "Nenhum evento cadastrado ainda."}
                </TableEmptyRow>
              ) : (
                eventos.map((evento, indice) => (
                  <TableRow
                    key={evento.id}
                    className={indice % 2 === 1 ? "bg-muted/50" : undefined}
                  >
                    <TableCell className="font-medium">
                      <Link href={`/eventos/${evento.id}`} className="hover:underline">
                        {evento.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{formatarDataHora(evento.data)}</TableCell>
                    <TableCell>{evento.local}</TableCell>
                    <TableCell>
                      <StatusEventoBadge status={evento.status} />
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
