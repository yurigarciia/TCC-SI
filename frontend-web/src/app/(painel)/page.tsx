"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssociados } from "@/features/associados/use-associados";
import { useEventos } from "@/features/eventos/use-eventos";
import { useInadimplentes } from "@/features/mensalidades/use-mensalidades";
import { formatarDataHora } from "@/lib/format";

interface CartaoResumoProps {
  href: string;
  titulo: string;
  valor: number | undefined;
  carregando: boolean;
  descricao: string;
  tom?: "default" | "warning" | "destructive";
}

const TOM_VALOR: Record<NonNullable<CartaoResumoProps["tom"]>, string> = {
  default: "text-foreground",
  warning: "text-warning",
  destructive: "text-destructive",
};

function CartaoResumo({ href, titulo, valor, carregando, descricao, tom = "default" }: CartaoResumoProps) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-colors hover:border-secondary">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <p className={`font-heading text-3xl font-semibold ${TOM_VALOR[tom]}`}>{valor}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: associados, isLoading: carregandoAssociados } = useAssociados();
  const { data: inadimplentes, isLoading: carregandoInadimplentes } = useInadimplentes();
  const { data: eventos, isLoading: carregandoEventos } = useEventos();
  // Computado uma vez (lazy initial state) em vez de Date.now() direto no corpo do componente —
  // chamada impura durante o render quebraria a regra react-hooks/purity.
  const [agora] = useState(() => Date.now());

  const ativos = associados?.filter((a) => a.status === "ativo").length;
  const pendentes = associados?.filter((a) => a.status === "pendente_validacao").length;

  const proximosEventos = eventos
    ?.filter((e) => e.status === "publicado" && new Date(e.data).getTime() >= agora)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Início</h1>
        <p className="text-muted-foreground">
          Painel de gestão de associados, mensalidades e eventos do Pia do Sul.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoResumo
          href="/associados"
          titulo="Associados ativos"
          valor={ativos}
          carregando={carregandoAssociados}
          descricao="Cadastros aprovados"
        />
        <CartaoResumo
          href="/associados"
          titulo="Pendentes de validação"
          valor={pendentes}
          carregando={carregandoAssociados}
          descricao="Auto-cadastro pelo app"
          tom={pendentes ? "warning" : "default"}
        />
        <CartaoResumo
          href="/mensalidades"
          titulo="Inadimplentes"
          valor={inadimplentes?.length}
          carregando={carregandoInadimplentes}
          descricao="Mensalidades em atraso"
          tom={inadimplentes?.length ? "destructive" : "default"}
        />
        <CartaoResumo
          href="/eventos"
          titulo="Eventos publicados"
          valor={eventos?.filter((e) => e.status === "publicado").length}
          carregando={carregandoEventos}
          descricao="Visíveis para reserva/compra"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {carregandoEventos && <Skeleton className="h-24 w-full" />}
          {!carregandoEventos && (!proximosEventos || proximosEventos.length === 0) && (
            <p className="text-sm text-muted-foreground">Nenhum evento publicado no momento.</p>
          )}
          {proximosEventos && proximosEventos.length > 0 && (
            <ul className="divide-y">
              {proximosEventos.map((evento) => (
                <li key={evento.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <div>
                    <Link href={`/eventos/${evento.id}`} className="font-medium hover:underline">
                      {evento.nome}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatarDataHora(evento.data)} · {evento.local}
                    </p>
                  </div>
                  <Badge variant="success">Publicado</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
