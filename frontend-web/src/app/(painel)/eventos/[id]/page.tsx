"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusEventoBadge } from "@/features/eventos/status-badge";
import {
  useConfigurarIngressoEvento,
  useConfigurarMesasEvento,
  useEvento,
  usePublicarEvento,
} from "@/features/eventos/use-eventos";
import { useSalao } from "@/features/saloes/use-saloes";
import { formatarDataHora } from "@/lib/format";

const mesasFormSchema = z.object({
  mesas: z.array(
    z.object({
      mesaId: z.string(),
      numero: z.number(),
      preco: z.coerce.number().min(0, "Informe um preço válido."),
      bloqueada: z.boolean(),
    }),
  ),
});

type MesasFormInput = z.input<typeof mesasFormSchema>;
type MesasFormValues = z.output<typeof mesasFormSchema>;

const ingressoFormSchema = z.object({
  quantidadeDisponivel: z.coerce.number().int().min(0, "Informe uma quantidade válida."),
  preco: z.coerce.number().min(0, "Informe um preço válido."),
});

type IngressoFormInput = z.input<typeof ingressoFormSchema>;
type IngressoFormValues = z.output<typeof ingressoFormSchema>;

export default function EventoDetalhePage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useEvento(params.id);

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar este evento. Ele pode não existir mais.
      </p>
    );
  }

  return <EventoDetalheConteudo eventoId={params.id} data={data} />;
}

function EventoDetalheConteudo({
  eventoId,
  data,
}: {
  eventoId: string;
  data: NonNullable<ReturnType<typeof useEvento>["data"]>;
}) {
  const { evento, mesas: configuracoesMesa, ingresso } = data;
  const publicar = usePublicarEvento(eventoId);
  const configurarIngresso = useConfigurarIngressoEvento(eventoId);

  const {
    register: registerIngresso,
    handleSubmit: handleSubmitIngresso,
    formState: { errors: errosIngresso },
  } = useForm<IngressoFormInput, unknown, IngressoFormValues>({
    resolver: zodResolver(ingressoFormSchema),
    values: {
      quantidadeDisponivel: ingresso?.quantidadeDisponivel ?? 0,
      preco: ingresso?.preco ?? 0,
    },
  });

  const onSubmitIngresso = handleSubmitIngresso((dados) => {
    configurarIngresso.mutate(dados, {
      onSuccess: () => toast.success("Ingresso avulso configurado."),
      onError: () => toast.error("Não foi possível salvar o ingresso avulso."),
    });
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{evento.nome}</h1>
          <p className="text-muted-foreground">
            {formatarDataHora(evento.data)} · {evento.local}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusEventoBadge status={evento.status} />
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

      {evento.descricao && <p className="text-foreground">{evento.descricao}</p>}

      {evento.salaoId && (
        <MesasDoEventoCard
          eventoId={eventoId}
          salaoId={evento.salaoId}
          configuracoesMesa={configuracoesMesa}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ingresso avulso</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitIngresso} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div className="space-y-2">
              <Label htmlFor="quantidadeDisponivel">Quantidade disponível</Label>
              <Input
                id="quantidadeDisponivel"
                type="number"
                min={0}
                aria-invalid={!!errosIngresso.quantidadeDisponivel}
                {...registerIngresso("quantidadeDisponivel")}
              />
              {errosIngresso.quantidadeDisponivel && (
                <p className="text-sm text-destructive">
                  {errosIngresso.quantidadeDisponivel.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="preco-ingresso">Preço</Label>
              <Input
                id="preco-ingresso"
                type="number"
                min={0}
                step="0.01"
                aria-invalid={!!errosIngresso.preco}
                {...registerIngresso("preco")}
              />
              {errosIngresso.preco && (
                <p className="text-sm text-destructive">{errosIngresso.preco.message}</p>
              )}
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={configurarIngresso.isPending}>
                {configurarIngresso.isPending ? "Salvando…" : "Salvar ingresso avulso"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function MesasDoEventoCard({
  eventoId,
  salaoId,
  configuracoesMesa,
}: {
  eventoId: string;
  salaoId: string;
  configuracoesMesa: NonNullable<ReturnType<typeof useEvento>["data"]>["mesas"];
}) {
  const { data: salaoData, isLoading } = useSalao(salaoId);
  const configurarMesas = useConfigurarMesasEvento(eventoId);

  const { control, register, handleSubmit, reset } = useForm<
    MesasFormInput,
    unknown,
    MesasFormValues
  >({
    resolver: zodResolver(mesasFormSchema),
    defaultValues: { mesas: [] },
  });
  const { fields } = useFieldArray({ control, name: "mesas" });

  useEffect(() => {
    if (!salaoData) return;
    const configPorMesa = new Map(configuracoesMesa.map((c) => [c.mesaId, c]));
    reset({
      mesas: salaoData.mesas
        .sort((a, b) => a.numero - b.numero)
        .map((mesa) => {
          const config = configPorMesa.get(mesa.id);
          return {
            mesaId: mesa.id,
            numero: mesa.numero,
            preco: config?.preco ?? 0,
            bloqueada: config?.bloqueada ?? false,
          };
        }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaoData]);

  const onSubmit = handleSubmit((dados) => {
    configurarMesas.mutate(
      dados.mesas.map(({ mesaId, preco, bloqueada }) => ({ mesaId, preco, bloqueada })),
      {
        onSuccess: () => toast.success("Configuração de mesas salva."),
        onError: () => toast.error("Não foi possível salvar a configuração de mesas."),
      },
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mesas do croqui vinculado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <Skeleton className="h-24 w-full" />}

        {salaoData && salaoData.mesas.length === 0 && (
          <p className="text-sm text-muted-foreground">
            O croqui vinculado ainda não tem mesas cadastradas.
          </p>
        )}

        {fields.length > 0 && (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-[80px_1fr_auto] items-center gap-3 text-sm font-medium text-muted-foreground">
              <span>Mesa</span>
              <span>Preço</span>
              <span>Bloqueada</span>
            </div>
            {fields.map((campo, indice) => (
              <div
                key={campo.id}
                className="grid grid-cols-[80px_1fr_auto] items-center gap-3 border-b pb-3 last:border-b-0"
              >
                <span className="font-medium">Mesa {campo.numero}</span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  {...register(`mesas.${indice}.preco` as const)}
                />
                <Controller
                  control={control}
                  name={`mesas.${indice}.bloqueada` as const}
                  render={({ field }) => (
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            ))}
            <div className="flex justify-end">
              <Button type="submit" disabled={configurarMesas.isPending}>
                {configurarMesas.isPending ? "Salvando…" : "Salvar mesas"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
