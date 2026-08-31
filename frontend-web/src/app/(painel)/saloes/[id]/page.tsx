"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MesaCanvas } from "@/features/saloes/mesa-canvas";
import { useAdicionarMesa, useSalao } from "@/features/saloes/use-saloes";
import { ApiError } from "@/lib/api-client";

const mesaSchema = z.object({
  numero: z.coerce.number().int().positive("Informe um número de mesa válido."),
  capacidade: z.coerce.number().int().positive("Informe a capacidade de lugares."),
  posicaoX: z.coerce.number().int().min(0),
  posicaoY: z.coerce.number().int().min(0),
});

type MesaFormInput = z.input<typeof mesaSchema>;
type MesaFormValues = z.output<typeof mesaSchema>;

export default function SalaoDetalhePage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useSalao(params.id);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar este salão. Ele pode não existir mais.
      </p>
    );
  }

  return <SalaoDetalheConteudo salaoId={params.id} data={data} />;
}

function SalaoDetalheConteudo({
  salaoId,
  data,
}: {
  salaoId: string;
  data: NonNullable<ReturnType<typeof useSalao>["data"]>;
}) {
  const { salao, mesas } = data;
  const adicionarMesa = useAdicionarMesa(salaoId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MesaFormInput, unknown, MesaFormValues>({
    resolver: zodResolver(mesaSchema),
    defaultValues: { posicaoX: 40, posicaoY: 40 },
  });

  const proximoNumero = mesas.reduce((maior, mesa) => Math.max(maior, mesa.numero), 0) + 1;

  const onSubmit = handleSubmit((dados) => {
    adicionarMesa.mutate(dados, {
      onSuccess: () => {
        toast.success(`Mesa ${dados.numero} adicionada.`);
        reset({
          numero: dados.numero + 1,
          capacidade: dados.capacidade,
          posicaoX: 40,
          posicaoY: 40,
        });
      },
      onError: (erro) => {
        toast.error(
          erro instanceof ApiError && erro.status === 409
            ? `Já existe uma mesa número ${dados.numero} neste salão.`
            : "Não foi possível adicionar a mesa.",
        );
      },
    });
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">{salao.nome}</h1>
        <p className="text-muted-foreground">
          Capacidade total: {salao.capacidadeTotal} pessoas · {mesas.length} mesa(s) cadastrada(s)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa de mesas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MesaCanvas
            mesas={mesas}
            onCanvasClick={({ x, y }) => {
              setValue("posicaoX", x, { shouldValidate: true });
              setValue("posicaoY", y, { shouldValidate: true });
            }}
          />
          <p className="text-xs text-muted-foreground">
            Clique no croqui acima para preencher a posição da mesa no formulário abaixo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar mesa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div className="space-y-2">
              <Label htmlFor="numero">Número da mesa</Label>
              <Input
                id="numero"
                type="number"
                defaultValue={proximoNumero}
                aria-invalid={!!errors.numero}
                {...register("numero")}
              />
              {errors.numero && (
                <p className="text-sm text-destructive">{errors.numero.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidade">Capacidade (lugares)</Label>
              <Input
                id="capacidade"
                type="number"
                aria-invalid={!!errors.capacidade}
                {...register("capacidade")}
              />
              {errors.capacidade && (
                <p className="text-sm text-destructive">{errors.capacidade.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="posicaoX">Posição X</Label>
              <Input id="posicaoX" type="number" {...register("posicaoX")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="posicaoY">Posição Y</Label>
              <Input id="posicaoY" type="number" {...register("posicaoY")} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={adicionarMesa.isPending}>
                {adicionarMesa.isPending ? "Adicionando…" : "Adicionar mesa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
