"use client";

import { Calendar, CalendarClock, Clock3, MapPin, Pencil, ShieldCheck } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusEventoBadge } from "@/features/eventos/status-badge";
import { useEventos } from "@/features/eventos/use-eventos";
import { formatarDataHora } from "@/lib/format";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputComIcone } from "@/components/input-com-icone";

// Período padrão do filtro de data: dá uma visão útil sem precisar abrir o seletor — eventos do
// último mês (pra conferir os que acabaram de acontecer) até daqui a um ano (cobre o planejamento
// com antecedência típico de bailes e fandangos).
function periodoPadrao() {
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setMonth(inicio.getMonth() - 1);
  const fim = new Date(hoje);
  fim.setFullYear(fim.getFullYear() + 1);
  const paraIso = (d: Date) => d.toISOString().slice(0, 10);
  return { inicio: paraIso(inicio), fim: paraIso(fim) };
}

const COLUNAS =
  "md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,2.2fr)_2.5rem] md:items-center md:gap-4";

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
  const [status, setStatus] = useState<string>("todos");
  const [{ inicio: dataInicioPadrao, fim: dataFimPadrao }] = useState(periodoPadrao);
  const [dataInicio, setDataInicio] = useState(dataInicioPadrao);
  const [dataFim, setDataFim] = useState(dataFimPadrao);
  const { data: resultado, isLoading, isError } = useEventos(pagina, busca || undefined, undefined, {
    status: status === "todos" ? undefined : status,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  });
  const eventos = resultado?.itens;

  const mudarBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1);
  };

  const mudarStatus = (valor: string | null) => {
    setStatus(valor ?? "todos");
    setPagina(1);
  };

  const mudarDataInicio = (valor: string) => {
    setDataInicio(valor);
    setPagina(1);
  };

  const mudarDataFim = (valor: string) => {
    setDataFim(valor);
    setPagina(1);
  };

  const ROTULOS_STATUS: Record<string, string> = {
    todos: "Todos os status",
    rascunho: "Rascunho",
    publicado: "Publicado",
  };

  const criarSeletorStatus = (idPrefixo: string) => (
    <Select value={status} onValueChange={mudarStatus}>
      <SelectTrigger
        id={`${idPrefixo}-status`}
        className={`h-8 w-44 gap-1.5 text-xs ${status !== "todos" ? "border-primary text-primary" : "text-muted-foreground"}`}
      >
        <ShieldCheck aria-hidden="true" className="size-3.5 shrink-0" />
        <SelectValue placeholder="Status" className="min-w-0 truncate">
          {(valor: string | null) => ROTULOS_STATUS[valor ?? "todos"] ?? "Status"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todos os status</SelectItem>
        <SelectItem value="rascunho">Rascunho</SelectItem>
        <SelectItem value="publicado">Publicado</SelectItem>
      </SelectContent>
    </Select>
  );

  const dataAlterada = dataInicio !== dataInicioPadrao || dataFim !== dataFimPadrao;

  const criarFiltroData = (idPrefixo: string) => (
    <div className="flex items-center gap-2">
      <label htmlFor={`${idPrefixo}-data-inicio`} className="text-xs text-muted-foreground">
        De
      </label>
      <InputComIcone
        icon={CalendarClock}
        id={`${idPrefixo}-data-inicio`}
        type="date"
        className={`h-8 w-40 text-xs ${dataAlterada ? "border-primary text-primary" : ""}`}
        value={dataInicio}
        onChange={(e) => mudarDataInicio(e.target.value)}
      />
      <label htmlFor={`${idPrefixo}-data-fim`} className="text-xs text-muted-foreground">
        Até
      </label>
      <InputComIcone
        icon={CalendarClock}
        id={`${idPrefixo}-data-fim`}
        type="date"
        className={`h-8 w-40 text-xs ${dataAlterada ? "border-primary text-primary" : ""}`}
        value={dataFim}
        onChange={(e) => mudarDataFim(e.target.value)}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground"><Calendar aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />Eventos</h1>
        <p className="text-sm text-muted-foreground">Bailes e fandangos.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={busca} onChange={mudarBusca} placeholder="Buscar por nome" />
        <Button render={<Link href="/eventos/novo" />}>Novo evento</Button>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {criarSeletorStatus("mobile")}
        {criarFiltroData("mobile")}
      </div>

      {/* Fora dos ramos de loading/erro/vazio de propósito — achado numa conversa com o usuário:
          os filtros viviam dentro do bloco "achou resultados", então sumiam durante o
          carregamento e quando a busca não encontrava nada, exatamente quando a pessoa mais
          precisa ajustá-los pra tentar de novo. */}
      <div className="hidden items-center justify-between rounded-xl border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm md:flex">
        <span>Evento</span>
        <div className="flex items-center gap-3">
          {criarSeletorStatus("desktop")}
          {criarFiltroData("desktop")}
        </div>
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
                    <StatusEventoBadge status={evento.status} data={evento.data} />
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
