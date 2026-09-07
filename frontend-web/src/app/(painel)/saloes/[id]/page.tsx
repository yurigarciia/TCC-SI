"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MesaCanvas } from "@/features/saloes/mesa-canvas";
import type { Mesa } from "@/features/saloes/types";
import { useAdicionarMesa, useAtualizarMesa, useRemoverMesa, useSalao } from "@/features/saloes/use-saloes";
import { ApiError } from "@/lib/api-client";

const mesaSchema = z.object({
  numero: z.coerce.number().int().positive("Informe um número de mesa válido."),
  capacidade: z.coerce.number().int().positive("Informe a capacidade de lugares."),
  posicaoX: z.coerce.number().int().min(0),
  posicaoY: z.coerce.number().int().min(0),
});

type MesaFormInput = z.input<typeof mesaSchema>;
type MesaFormValues = z.output<typeof mesaSchema>;

function textoContagemMesas(quantidade: number): string {
  if (quantidade === 0) return "Nenhuma mesa cadastrada";
  if (quantidade === 1) return "1 mesa cadastrada";
  return `${quantidade} mesas cadastradas`;
}

export default function SalaoDetalhePage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useSalao(params.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
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
  const atualizarMesa = useAtualizarMesa(salaoId);
  const removerMesa = useRemoverMesa(salaoId);

  // Achado numa conversa com o usuário (QA do cadastro/edição de croqui — antes só dava pra
  // adicionar mesa, nunca corrigir um clique errado): clicar numa mesa já existente no croqui
  // agora abre ela pra editar (numero/capacidade/posição) em vez de silenciosamente preparar uma
  // mesa nova na mesma posição. `posicaoPendente` é só o marcador tracejado de prévia — sem ele,
  // clicar no croqui não mudava nada visualmente ali até o formulário ser de fato salvo.
  const [mesaEditando, setMesaEditando] = useState<Mesa | null>(null);
  const [posicaoPendente, setPosicaoPendente] = useState<{ x: number; y: number } | null>(null);

  const proximoNumero = mesas.reduce((maior, mesa) => Math.max(maior, mesa.numero), 0) + 1;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MesaFormInput, unknown, MesaFormValues>({
    resolver: zodResolver(mesaSchema),
    defaultValues: { numero: proximoNumero, posicaoX: 40, posicaoY: 40 },
  });

  function voltarParaModoAdicionar(numeroSugerido: number) {
    setMesaEditando(null);
    setPosicaoPendente(null);
    // "" em vez de undefined — reset() com undefined não limpa um input que já teve valor
    // digitado pelo usuário (achado em teste manual: excluir uma mesa editada deixava
    // "Capacidade" com o número antigo, mesmo com o formulário voltando pro modo adicionar).
    reset({ numero: numeroSugerido, capacidade: "" as unknown as number, posicaoX: 40, posicaoY: 40 });
  }

  function selecionarMesaParaEditar(mesa: Mesa) {
    setMesaEditando(mesa);
    setPosicaoPendente(null);
    reset({
      numero: mesa.numero,
      capacidade: mesa.capacidade,
      posicaoX: mesa.posicaoX,
      posicaoY: mesa.posicaoY,
    });
  }

  const onSubmit = handleSubmit((dados) => {
    if (mesaEditando) {
      atualizarMesa.mutate(
        { mesaId: mesaEditando.id, dados },
        {
          onSuccess: () => {
            toast.success(`Mesa ${dados.numero} atualizada.`);
            voltarParaModoAdicionar(proximoNumero);
          },
          onError: (erro) => {
            toast.error(
              erro instanceof ApiError && erro.status === 409
                ? `Já existe uma mesa número ${dados.numero} neste salão.`
                : "Não foi possível salvar as alterações da mesa.",
            );
          },
        },
      );
      return;
    }

    adicionarMesa.mutate(dados, {
      onSuccess: () => {
        toast.success(`Mesa ${dados.numero} adicionada.`);
        setPosicaoPendente(null);
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

  const excluirMesaSelecionada = () => {
    if (!mesaEditando) return;
    const numero = mesaEditando.numero;
    removerMesa.mutate(mesaEditando.id, {
      onSuccess: () => {
        toast.success(`Mesa ${numero} excluída.`);
        voltarParaModoAdicionar(proximoNumero - 1 > 0 ? proximoNumero - 1 : 1);
      },
      onError: (erro) => {
        toast.error(
          erro instanceof ApiError && erro.status === 409
            ? `A mesa ${numero} já foi usada em algum evento (reserva ou preço configurado) e não pode ser excluída.`
            : `Não foi possível excluir a mesa ${numero}.`,
        );
      },
    });
  };

  const salvando = adicionarMesa.isPending || atualizarMesa.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Breadcrumb items={[{ label: "Salões", href: "/saloes" }, { label: salao.nome }]} />
        <h1 className="font-heading text-2xl font-semibold text-foreground">{salao.nome}</h1>
        <p className="text-muted-foreground">
          Capacidade total: {salao.capacidadeTotal} pessoas · {textoContagemMesas(mesas.length)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa de mesas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MesaCanvas
            mesas={mesas}
            mesaSelecionadaId={mesaEditando?.id}
            posicaoPendente={posicaoPendente}
            onCanvasClick={({ x, y }) => {
              setValue("posicaoX", x, { shouldValidate: true });
              setValue("posicaoY", y, { shouldValidate: true });
              setPosicaoPendente({ x, y });
            }}
            onMesaClick={selecionarMesaParaEditar}
          />
          <p className="text-xs text-muted-foreground">
            Clique numa área vazia do croqui pra posicionar uma mesa nova, ou numa mesa já
            existente pra editar ou excluir ela.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{mesaEditando ? `Editar mesa ${mesaEditando.numero}` : "Adicionar mesa"}</CardTitle>
          {mesaEditando && (
            <CardDescription>
              Excluir só é permitido se esta mesa nunca foi usada em nenhum evento.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div className="space-y-2">
              <Label htmlFor="numero">Número da mesa</Label>
              <Input
                id="numero"
                type="number"
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
                placeholder="Ex.: 8"
                aria-invalid={!!errors.capacidade}
                {...register("capacidade")}
              />
              {errors.capacidade && (
                <p className="text-sm text-destructive">{errors.capacidade.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="posicaoX">Posição X</Label>
              <Input id="posicaoX" type="number" placeholder="Ex.: 0" {...register("posicaoX")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="posicaoY">Posição Y</Label>
              <Input id="posicaoY" type="number" placeholder="Ex.: 0" {...register("posicaoY")} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              {mesaEditando && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button type="button" variant="outline" disabled={removerMesa.isPending} />
                      }
                    >
                      {removerMesa.isPending ? "Excluindo…" : "Excluir mesa"}
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir mesa {mesaEditando.numero}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Só é possível se esta mesa nunca foi usada em nenhum evento (reserva ou
                          preço configurado). Não dá pra desfazer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={excluirMesaSelecionada}>
                          Confirmar exclusão
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => voltarParaModoAdicionar(proximoNumero)}
                  >
                    Cancelar edição
                  </Button>
                </>
              )}
              <Button type="submit" disabled={salvando}>
                {salvando
                  ? "Salvando…"
                  : mesaEditando
                    ? "Salvar alterações"
                    : "Adicionar mesa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
