"use client";

import { Calendar, Clock3, MapPin, Pencil } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusEventoBadge } from "@/features/eventos/status-badge";
import { useEventos } from "@/features/eventos/use-eventos";
import { formatarDataHora } from "@/lib/format";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";

const COLUNAS =
  "md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)_minmax(0,1.8fr)_2.5rem] md:items-center md:gap-4";

function SeloData({ iso }: { iso: string }) {
  const data = new Date(iso);
  const dia = data.toLocaleDateString("pt-BR", { day: "2-digit" });
  const mes = data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return (
    <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
      <span className="text-sm leading-none font-semibold">{dia}</span>
      <span className="text-[10px] leading-none uppercase">{mes}</span>
    </div>
  );
}

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
        <h1 className="font-heading text-2xl font-semibold text-foreground"><Calendar aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />Eventos</h1>
        <p className="text-sm text-muted-foreground">Bailes e fandangos.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={busca} onChange={mudarBusca} placeholder="Buscar por nome" />
        <Button render={<Link href="/eventos/novo" />}>Novo evento</Button>
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
          Não foi possível carregar os eventos. Tente novamente em instantes.
        </p>
      )}

      {eventos && eventos.length === 0 && (
        <p className="rounded-xl border bg-card py-10 text-center text-sm text-muted-foreground shadow-sm">
          {busca ? "Nenhum evento encontrado para esse termo." : "Nenhum evento cadastrado ainda."}
        </p>
      )}

      {eventos && eventos.length > 0 && (
        <div className="space-y-3">
          <div
            className={`hidden h-12 rounded-xl border bg-card px-4 text-sm font-semibold text-foreground shadow-sm md:grid ${COLUNAS}`}
          >
            <span>Evento</span>
            <span>Status</span>
            <span>Data</span>
            <span />
          </div>
          <ul className="space-y-3">
            {eventos.map((evento) => (
              <li
                key={evento.id}
                className={`group relative flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition duration-200 hover:scale-[1.01] hover:bg-[#f3e2bf]/60 hover:shadow-md md:grid ${COLUNAS}`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <SeloData iso={evento.data} />
                  <div className="min-w-0">
                    <Link
                      href={`/eventos/${evento.id}`}
                      className="block truncate font-semibold text-foreground after:absolute after:inset-0 after:content-[''] hover:underline"
                    >
                      {evento.nome}
                    </Link>
                    <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                      <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                      {evento.local}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center text-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar aria-hidden="true" className="size-3.5" />
                    Status
                  </p>
                  <div className="mt-1 flex h-6 items-center">
                    <StatusEventoBadge status={evento.status} />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center text-sm">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 aria-hidden="true" className="size-3.5" />
                    Data
                  </p>
                  <p className="mt-1 flex h-6 items-center">{formatarDataHora(evento.data)}</p>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="relative z-10"
                  render={
                    <Link href={`/eventos/${evento.id}`} aria-label={`Editar ${evento.nome}`} />
                  }
                >
                  <Pencil aria-hidden="true" />
                </Button>
              </li>
            ))}
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
