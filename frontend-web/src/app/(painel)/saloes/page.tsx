"use client";

import { Building2 } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaloes } from "@/features/saloes/use-saloes";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";

export default function SaloesPage() {
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const { data: resultado, isLoading, isError } = useSaloes(pagina, busca || undefined);
  const saloes = resultado?.itens;

  const mudarBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground"><Building2 aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />Croqui de salões</h1>
        <p className="text-sm text-muted-foreground">Croquis de mesas reutilizáveis nos eventos.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={busca} onChange={mudarBusca} placeholder="Buscar por nome" />
        <Button render={<Link href="/saloes/novo" />}>Novo salão</Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os salões. Tente novamente em instantes.
        </p>
      )}

      {saloes && saloes.length === 0 && (
        <p className="text-muted-foreground">
          {busca ? "Nenhum salão encontrado para esse termo." : "Nenhum salão cadastrado ainda."}
        </p>
      )}

      {saloes && saloes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {saloes.map((salao) => (
            <Link key={salao.id} href={`/saloes/${salao.id}`}>
              <Card className="transition-colors hover:border-secondary">
                <CardHeader>
                  <CardTitle>{salao.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Capacidade total: {salao.capacidadeTotal} pessoas
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {resultado && <Pagination pagina={resultado} onMudarPagina={setPagina} />}
    </div>
  );
}
