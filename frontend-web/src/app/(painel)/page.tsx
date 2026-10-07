"use client";

import { Home, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartaoResumo } from "@/components/cartao-resumo";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssociados, useCategoriasSocio } from "@/features/associados/use-associados";
import { useEventos } from "@/features/eventos/use-eventos";
import { useInadimplentes } from "@/features/mensalidades/use-mensalidades";
import { GraficosDashboard } from "@/features/dashboard/graficos-dashboard";
import { formatarDataHora } from "@/lib/format";

export default function DashboardPage() {
  // Cartões de resumo somam/filtram no cliente — busca uma página grande o bastante pra cobrir o
  // volume real da entidade (ver DESIGN-SYSTEM/PLANEJAMENTO-GERAL: escala pequena, dezenas de
  // associados). Uma contagem por status direto na API fica pra quando o volume justificar.
  const { data: resultadoAssociados, isLoading: carregandoAssociados } = useAssociados(
    1,
    undefined,
    100,
  );
  const { data: resultadoInadimplentes, isLoading: carregandoInadimplentes } = useInadimplentes(
    1,
    undefined,
    100,
  );
  const { data: resultadoEventos, isLoading: carregandoEventos } = useEventos(1, undefined, 100);
  const { data: resultadoCategorias } = useCategoriasSocio(1, undefined, 100);
  const categorias = resultadoCategorias?.itens;
  const associados = resultadoAssociados?.itens;
  const inadimplentes = resultadoInadimplentes?.itens;
  const eventos = resultadoEventos?.itens;
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            <Home aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />
            Início
          </h1>
          <p className="text-muted-foreground">
            Painel de gestão de associados, mensalidades e eventos da sua entidade.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/mensalidades" />}>
            <Wallet aria-hidden="true" />
            Mensalidades
          </Button>
          <Button variant="outline" render={<Link href="/associados/novo" />}>
            <Plus aria-hidden="true" />
            Novo associado
          </Button>
          <Button render={<Link href="/eventos/novo" />}>
            <Plus aria-hidden="true" />
            Novo evento
          </Button>
        </div>
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

      <GraficosDashboard
        associados={associados}
        categorias={categorias}
        inadimplentes={inadimplentes?.length}
        agora={agora}
      />

      <Card className="bg-none! bg-card!">
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
