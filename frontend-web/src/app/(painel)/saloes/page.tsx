"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaloes } from "@/features/saloes/use-saloes";

export default function SaloesPage() {
  const { data: saloes, isLoading, isError } = useSaloes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Croqui de salões
          </h1>
          <p className="text-muted-foreground">
            Salões reutilizáveis com suas mesas — cada evento pode vincular um destes croquis.
          </p>
        </div>
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
        <p className="text-muted-foreground">Nenhum salão cadastrado ainda.</p>
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
    </div>
  );
}
