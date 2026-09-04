"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusEventoBadge } from "@/features/eventos/status-badge";
import { EventoFormulario } from "@/features/eventos/evento-formulario";
import { useEvento, usePrecosIngressoEvento, usePublicarEvento } from "@/features/eventos/use-eventos";

export default function EventoDetalhePage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useEvento(params.id);
  const { data: precos, isLoading: carregandoPrecos } = usePrecosIngressoEvento(params.id);

  if (isLoading || carregandoPrecos) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data || !precos) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar este evento. Ele pode não existir mais.
      </p>
    );
  }

  return <EventoDetalheConteudo eventoId={params.id} data={data} precos={precos} />;
}

function EventoDetalheConteudo({
  eventoId,
  data,
  precos,
}: {
  eventoId: string;
  data: NonNullable<ReturnType<typeof useEvento>["data"]>;
  precos: NonNullable<ReturnType<typeof usePrecosIngressoEvento>["data"]>;
}) {
  const { evento } = data;
  const publicar = usePublicarEvento(eventoId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Breadcrumb items={[{ label: "Eventos", href: "/eventos" }, { label: evento.nome }]} />
          <h1 className="font-heading text-2xl font-semibold text-foreground">{evento.nome}</h1>
          <StatusEventoBadge status={evento.status} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href={`/eventos/${eventoId}/ingressos`} />}>
            Ingressos
          </Button>
          {evento.salaoId && (
            <Button variant="outline" render={<Link href={`/eventos/${eventoId}/mapa`} />}>
              Mapa de mesas
            </Button>
          )}
          {evento.status === "rascunho" && (
            <Button
              onClick={() =>
                publicar.mutate(undefined, {
                  onSuccess: () => toast.success("Evento publicado."),
                  onError: () => toast.error("Não foi possível publicar o evento."),
                })
              }
              disabled={publicar.isPending}
            >
              Publicar
            </Button>
          )}
        </div>
      </div>

      <EventoFormulario modo="editar" eventoId={eventoId} dadosIniciais={{ ...data, precos }} />
    </div>
  );
}
