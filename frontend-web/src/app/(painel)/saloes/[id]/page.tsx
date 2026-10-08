"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Armchair, DoorOpen, Minus, X, Building2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MesaCanvas, pontoMedioElemento, type ModoCroqui } from "@/features/saloes/mesa-canvas";
import type { ElementoEstrutural, Mesa, TipoElementoEstrutural } from "@/features/saloes/types";
import {
  useAdicionarElemento,
  useAdicionarMesa,
  useAtualizarMesa,
  useRemoverElemento,
  useRemoverMesa,
  useSalao,
} from "@/features/saloes/use-saloes";
import { ApiError } from "@/lib/api-client";

const mesaSchema = z.object({
  numero: z.coerce.number().int().positive("Informe um número de mesa válido."),
  capacidade: z.coerce.number().int().positive("Informe a quantidade de lugares."),
  posicaoX: z.coerce.number().int().min(0),
  posicaoY: z.coerce.number().int().min(0),
});

type MesaFormInput = z.input<typeof mesaSchema>;
type MesaFormValues = z.output<typeof mesaSchema>;

const FERRAMENTAS: Array<{ modo: ModoCroqui; rotulo: string; icone: typeof Armchair }> = [
  { modo: "mesa", rotulo: "Mesas", icone: Armchair },
  { modo: "parede", rotulo: "Paredes", icone: Minus },
  { modo: "porta", rotulo: "Portas", icone: DoorOpen },
];

const NOME_TIPO_ELEMENTO: Record<TipoElementoEstrutural, string> = {
  parede: "Parede",
  porta: "Porta",
};

function textoContagemMesas(quantidade: number): string {
  if (quantidade === 0) return "Nenhuma mesa cadastrada";
  if (quantidade === 1) return "1 mesa cadastrada";
  return `${quantidade} mesas cadastradas`;
}

const TEXTO_INSTRUCAO: Record<ModoCroqui, string> = {
  mesa: "Clique num espaço vazio do croqui pra colocar uma mesa nova, ou numa mesa já colocada pra editar ou excluir ela.",
  parede: "Arraste no croqui pra desenhar uma parede. Clique numa parede já desenhada pra excluir ela.",
  porta: "Arraste no croqui pra desenhar uma porta. Clique numa porta já desenhada pra excluir ela.",
};

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
  const { salao, mesas, elementos } = data;
  const adicionarMesa = useAdicionarMesa(salaoId);
  const atualizarMesa = useAtualizarMesa(salaoId);
  const removerMesa = useRemoverMesa(salaoId);
  const adicionarElemento = useAdicionarElemento(salaoId);
  const removerElemento = useRemoverElemento(salaoId);

  // Achado numa conversa com o usuário: quem usa essa tela não é técnico — coordenada X/Y não
  // significa nada pra essa pessoa, e um formulário solto embaixo do croqui (sem nenhuma pista de
  // que ele se referia ao clique que acabou de dar) obrigava rolar a tela pra digitar a
  // quantidade de lugares. Os dois campos de posição continuam existindo no formulário (por
  // baixo, via input hidden) — só nunca aparecem pra ninguém digitar; a posição em si só se define
  // clicando no croqui. O formulário em si virou um painel pequeno, flutuando bem ao lado do
  // ponto clicado — mesma lógica de antes (adicionar/editar/excluir), só que onde a atenção da
  // pessoa já está.
  const [modo, setModo] = useState<ModoCroqui>("mesa");
  const [mesaEditando, setMesaEditando] = useState<Mesa | null>(null);
  const [posicaoPendente, setPosicaoPendente] = useState<{ x: number; y: number } | null>(null);
  const [elementoSelecionado, setElementoSelecionado] = useState<ElementoEstrutural | null>(null);

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

  function fecharPainel() {
    setMesaEditando(null);
    setPosicaoPendente(null);
    setElementoSelecionado(null);
  }

  function trocarFerramenta(novoModo: ModoCroqui) {
    setModo(novoModo);
    fecharPainel();
  }

  function voltarParaModoAdicionar(numeroSugerido: number) {
    fecharPainel();
    // "" em vez de undefined — reset() com undefined não limpa um input que já teve valor
    // digitado pelo usuário (achado em teste manual: excluir uma mesa editada deixava
    // "Lugares" com o número antigo, mesmo com o formulário voltando pro modo adicionar).
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

  function desenharElemento(segmento: { x1: number; y1: number; x2: number; y2: number }) {
    adicionarElemento.mutate(
      { tipo: modo === "porta" ? "porta" : "parede", ...segmento },
      {
        onSuccess: () => toast.success(`${NOME_TIPO_ELEMENTO[modo === "porta" ? "porta" : "parede"]} adicionada.`),
        onError: () => toast.error("Não foi possível salvar o traço no croqui."),
      },
    );
  }

  function excluirElementoSelecionado() {
    if (!elementoSelecionado) return;
    const nome = NOME_TIPO_ELEMENTO[elementoSelecionado.tipo];
    removerElemento.mutate(elementoSelecionado.id, {
      onSuccess: () => {
        toast.success(`${nome} excluída.`);
        setElementoSelecionado(null);
      },
      onError: () => toast.error(`Não foi possível excluir ${nome === "Porta" ? "a porta" : "a parede"}.`),
    });
  }

  const salvando = adicionarMesa.isPending || atualizarMesa.isPending;
  const painelMesaAberto = !!mesaEditando || !!posicaoPendente;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Breadcrumb items={[{ label: "Salões", href: "/saloes" }, { label: salao.nome }]} />
        <h1 className="font-heading text-2xl font-semibold text-foreground"><Building2 aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />{salao.nome}</h1>
        <p className="text-muted-foreground">
          Capacidade total: {salao.capacidadeTotal} pessoas · {textoContagemMesas(mesas.length)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mapa de mesas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-1.5 rounded-lg border bg-muted/40 p-1">
            {FERRAMENTAS.map(({ modo: ferramenta, rotulo, icone: Icone }) => (
              <Button
                key={ferramenta}
                type="button"
                variant={modo === ferramenta ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => trocarFerramenta(ferramenta)}
              >
                <Icone />
                {rotulo}
              </Button>
            ))}
          </div>

          <MesaCanvas
            mesas={mesas}
            elementos={elementos}
            modo={modo}
            mesaSelecionadaId={mesaEditando?.id}
            posicaoPendente={posicaoPendente}
            onCanvasClick={
              modo === "mesa"
                ? ({ x, y }) => {
                    // Também funciona editando uma mesa — clicar em outro ponto do croqui move ela
                    // pra lá (o ponto tracejado mostra pra onde, o círculo cheio continua no lugar
                    // antigo até salvar).
                    setValue("posicaoX", x, { shouldValidate: true });
                    setValue("posicaoY", y, { shouldValidate: true });
                    setPosicaoPendente({ x, y });
                  }
                : undefined
            }
            onMesaClick={modo === "mesa" ? selecionarMesaParaEditar : undefined}
            onSegmentoDesenhado={modo !== "mesa" ? desenharElemento : undefined}
            onElementoClick={modo !== "mesa" ? setElementoSelecionado : undefined}
            elementoSelecionadoId={elementoSelecionado?.id}
            painelPosicao={
              modo === "mesa"
                ? (posicaoPendente ??
                  (mesaEditando ? { x: mesaEditando.posicaoX, y: mesaEditando.posicaoY } : null))
                : elementoSelecionado
                  ? pontoMedioElemento(elementoSelecionado)
                  : null
            }
            painel={
              modo === "mesa" ? (
                painelMesaAberto ? (
                  <form onSubmit={onSubmit} className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {mesaEditando ? `Mesa ${mesaEditando.numero}` : "Nova mesa"}
                      </p>
                      <button
                        type="button"
                        onClick={fecharPainel}
                        aria-label="Fechar"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <input type="hidden" {...register("posicaoX")} />
                    <input type="hidden" {...register("posicaoY")} />

                    <div className="space-y-1">
                      <Label htmlFor="numero" className="text-xs text-muted-foreground">
                        Número
                      </Label>
                      <Input
                        id="numero"
                        type="number"
                        className="h-8"
                        aria-invalid={!!errors.numero}
                        {...register("numero")}
                      />
                      {errors.numero && (
                        <p className="text-xs text-destructive">{errors.numero.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="capacidade" className="text-xs text-muted-foreground">
                        Quantas pessoas sentam?
                      </Label>
                      <Input
                        id="capacidade"
                        type="number"
                        className="h-8"
                        placeholder="Ex.: 8"
                        autoFocus
                        aria-invalid={!!errors.capacidade}
                        {...register("capacidade")}
                      />
                      {errors.capacidade && (
                        <p className="text-xs text-destructive">{errors.capacidade.message}</p>
                      )}
                    </div>

                    {mesaEditando && (
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              disabled={removerMesa.isPending}
                            />
                          }
                        >
                          {removerMesa.isPending ? "Excluindo…" : "Excluir mesa"}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir mesa {mesaEditando.numero}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Só é possível se esta mesa nunca foi usada em nenhum evento (reserva
                              ou preço configurado). Não dá pra desfazer.
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
                    )}

                    <Button type="submit" size="sm" className="w-full" disabled={salvando}>
                      {salvando
                        ? "Salvando…"
                        : mesaEditando
                          ? "Salvar alterações"
                          : "Adicionar mesa"}
                    </Button>
                  </form>
                ) : null
              ) : elementoSelecionado ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {NOME_TIPO_ELEMENTO[elementoSelecionado.tipo]}
                    </p>
                    <button
                      type="button"
                      onClick={fecharPainel}
                      aria-label="Fechar"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={removerElemento.isPending}
                    onClick={excluirElementoSelecionado}
                  >
                    {removerElemento.isPending ? "Excluindo…" : "Excluir"}
                  </Button>
                </div>
              ) : null
            }
          />
          <p className="text-xs text-muted-foreground">{TEXTO_INSTRUCAO[modo]}</p>
        </CardContent>
      </Card>
    </div>
  );
}
