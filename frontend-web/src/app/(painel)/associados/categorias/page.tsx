"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { useCategoriasSocio } from "@/features/associados/use-associados";
import { formatarMoeda } from "@/lib/format";
import { TableEmptyRow } from "@/components/table-empty-row";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";

// T-FE-003 nunca teve tela pra isso — categorias só eram criadas via API direta em teste manual
// (ver nota do ticket no PLANEJAMENTO-GERAL.md), por isso o Select de "categoria de sócio" em
// /associados/novo sempre aparecia vazio na prática. Isenção de mensalidade (sócio benemérito/
// honorário, comum em entidades tradicionalistas) também nunca tinha sido modelada — ver adendo
// na mesma seção do planejamento.
export default function CategoriasSocioPage() {
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const { data: resultado, isLoading, isError } = useCategoriasSocio(pagina, busca || undefined);
  const categorias = resultado?.itens;

  const mudarBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/associados"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Associados
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Categorias de sócio
        </h1>
        <p className="text-sm text-muted-foreground">
          Valor de mensalidade por categoria — ou isenção.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={busca} onChange={mudarBusca} placeholder="Buscar por nome" />
        <Button render={<Link href="/associados/categorias/novo" />}>Nova categoria</Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar as categorias. Tente novamente em instantes.
        </p>
      )}

      {categorias && (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Mensalidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.length === 0 ? (
                <TableEmptyRow colSpan={3}>
                  {busca
                    ? "Nenhuma categoria encontrada para esse termo."
                    : "Nenhuma categoria cadastrada ainda."}
                </TableEmptyRow>
              ) : (
                categorias.map((categoria, indice) => (
                  <TableRow
                    key={categoria.id}
                    className={indice % 2 === 1 ? "bg-muted/50" : undefined}
                  >
                    <TableCell className="font-medium">{categoria.nome}</TableCell>
                    <TableCell>
                      {categoria.isenta ? (
                        <Badge variant="secondary">Isenta</Badge>
                      ) : (
                        formatarMoeda(categoria.valorMensalidade)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={categoria.ativa ? "success" : "outline"}>
                        {categoria.ativa ? "Ativa" : "Inativa"}
                      </Badge>
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
