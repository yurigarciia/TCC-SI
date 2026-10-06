"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartaoResumo } from "@/components/cartao-resumo";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/auth/use-current-user";
import { useAssociados } from "@/features/associados/use-associados";
import { useEventos } from "@/features/eventos/use-eventos";
import { useInadimplentes } from "@/features/mensalidades/use-mensalidades";
import { formatarDataHora } from "@/lib/format";

function saudacao(timestamp: number): string {
  const hora = new Date(timestamp).getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardPage() {
  const { data: usuario } = useCurrentUser();
  const primeiroNome = usuario?.nome?.split(" ")[0];
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
      <section className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
        <svg
          className="pointer-events-none absolute inset-0 size-full text-primary-foreground opacity-[0.08]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="roseta-banner" width="90" height="90" patternUnits="userSpaceOnUse">
              <g transform="translate(45 45) scale(0.18)" fill="none" stroke="currentColor" strokeWidth="6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ellipse
                    key={i}
                    cx="0"
                    cy="-108"
                    rx="34"
                    ry="92"
                    fill="currentColor"
                    stroke="none"
                    transform={`rotate(${i * 45})`}
                  />
                ))}
                <circle r="150" />
                <circle r="128" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#roseta-banner)" />
        </svg>
        <div className="relative">
          <p className="text-sm font-medium opacity-80">{saudacao(agora)}</p>
          <h1 className="font-heading text-3xl font-semibold">
            {primeiroNome ? `Olá, ${primeiroNome}!` : "Início"}
          </h1>
          <p className="mt-2 max-w-xl text-primary-foreground/85">
            Painel de gestão de associados, mensalidades e eventos da sua entidade.
          </p>
        </div>
      </section>

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
