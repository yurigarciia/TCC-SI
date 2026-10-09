"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Armchair,
  Building2,
  Circle,
  DoorOpen,
  Minus,
  RectangleHorizontal,
  SquareDashed,
  X,
} from "lucide-react";
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
import {
  MesaCanvas,
  pontoMedioArea,
  pontoMedioElemento,
  type ModoCroqui,
} from "@/features/saloes/mesa-canvas";
import type {
  AreaEstrutural,
  ElementoEstrutural,
  FormatoMesa,
  Mesa,
  TipoElementoEstrutural,
} from "@/features/saloes/types";
import {
  useAdicionarArea,
  useAdicionarElemento,
  useAdicionarMesa,
  useAtualizarArea,
  useAtualizarMesa,
  useRemoverArea,
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
  formato: z.enum(["redonda", "retangular"]),
});

type MesaFormInput = z.input<typeof mesaSchema>;
type MesaFormValues = z.output<typeof mesaSchema>;

const areaSchema = z.object({
  nome: z.string().min(1, "Dê um nome pra essa área (ex.: Tablado, Bar)."),
});

type AreaFormValues = z.infer<typeof areaSchema>;

const FERRAMENTAS: Array<{ modo: ModoCroqui; rotulo: string; icone: typeof Armchair }> = [
  { modo: "mesa", rotulo: "Mesas", icone: Armchair },
  { modo: "parede", rotulo: "Paredes", icone: Minus },
  { modo: "porta", rotulo: "Portas", icone: DoorOpen },
  { modo: "area", rotulo: "Áreas", icone: SquareDashed },
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
  mesa: "Clique num espaço vazio pra colocar uma mesa nova, arraste uma mesa já colocada pra mudar de lugar, ou clique nela pra editar/excluir.",
  parede: "Arraste no croqui pra desenhar uma parede. Clique numa parede já desenhada pra excluir ela.",
  porta: "Arraste no croqui pra desenhar uma porta. Clique numa porta já desenhada pra excluir ela.",
  area: "Arraste pra marcar uma área nova (ex.: tablado, bar). Arraste uma área existente pra mudar de lugar, ou clique nela pra renomear/excluir.",
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
  const { salao, mesas, elementos, areas } = data;
  const adicionarMesa = useAdicionarMesa(salaoId);
  const atualizarMesa = useAtualizarMesa(salaoId);
  const removerMesa = useRemoverMesa(salaoId);
  const adicionarElemento = useAdicionarElemento(salaoId);
  const removerElemento = useRemoverElemento(salaoId);
  const adicionarArea = useAdicionarArea(salaoId);
  const atualizarArea = useAtualizarArea(salaoId);
  const removerArea = useRemoverArea(salaoId);

  // Achado numa conversa com o usuário: quem usa essa tela não é técnico — coordenada X/Y não
  // significa nada pra essa pessoa, e um formulário solto embaixo do croqui (sem nenhuma pista de
  // que ele se referia ao clique que acabou de dar) obrigava rolar a tela pra digitar a
  // quantidade de lugares. Os dois campos de posição continuam existindo no formulário (por
  // baixo, via input hidden) — só nunca aparecem pra ninguém digitar; a posição em si se define
  // clicando/arrastando no croqui. O formulário em si virou um painel pequeno, flutuando bem ao
  // lado do ponto clicado — mesma lógica de antes (adicionar/editar/excluir), só que onde a
  // atenção da pessoa já está.
  const [modo, setModo] = useState<ModoCroqui>("mesa");
  const [mesaEditando, setMesaEditando] = useState<Mesa | null>(null);
  const [posicaoPendente, setPosicaoPendente] = useState<{ x: number; y: number } | null>(null);
  const [elementoSelecionado, setElementoSelecionado] = useState<ElementoEstrutural | null>(null);
  const [areaEditando, setAreaEditando] = useState<AreaEstrutural | null>(null);
  const [areaPendente, setAreaPendente] = useState<{
    x: number;
    y: number;
    largura: number;
    altura: number;
  } | null>(null);

  const proximoNumero = mesas.reduce((maior, mesa) => Math.max(maior, mesa.numero), 0) + 1;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MesaFormInput, unknown, MesaFormValues>({
    resolver: zodResolver(mesaSchema),
    defaultValues: { numero: proximoNumero, posicaoX: 40, posicaoY: 40, formato: "redonda" },
  });
  const formatoAtual = watch("formato");

  const {
    register: registerArea,
    handleSubmit: handleSubmitArea,
    reset: resetArea,
    formState: { errors: errosArea },
  } = useForm<AreaFormValues>({ resolver: zodResolver(areaSchema), defaultValues: { nome: "" } });

  function fecharPainel() {
    setMesaEditando(null);
    setPosicaoPendente(null);
    setElementoSelecionado(null);
    setAreaEditando(null);
    setAreaPendente(null);
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
    reset({
      numero: numeroSugerido,
      capacidade: "" as unknown as number,
      posicaoX: 40,
      posicaoY: 40,
      formato: "redonda",
    });
  }

  function selecionarMesaParaEditar(mesa: Mesa) {
    setMesaEditando(mesa);
    setPosicaoPendente(null);
    reset({
      numero: mesa.numero,
      capacidade: mesa.capacidade,
      posicaoX: mesa.posicaoX,
      posicaoY: mesa.posicaoY,
      formato: mesa.formato,
    });
  }

  function moverMesa(mesa: Mesa, posicao: { x: number; y: number }) {
    atualizarMesa.mutate(
      { mesaId: mesa.id, dados: { posicaoX: posicao.x, posicaoY: posicao.y } },
      { onError: () => toast.error(`Não foi possível mover a mesa ${mesa.numero}.`) },
    );
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
          formato: dados.formato,
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

  function moverArea(area: AreaEstrutural, posicao: { x: number; y: number }) {
    atualizarArea.mutate(
      { areaId: area.id, dados: posicao },
      { onError: () => toast.error(`Não foi possível mover "${area.nome}".`) },
    );
  }

  const onSubmitArea = handleSubmitArea((dados) => {
    if (areaEditando) {
      atualizarArea.mutate(
        { areaId: areaEditando.id, dados: { nome: dados.nome } },
        {
          onSuccess: () => {
            toast.success(`"${dados.nome}" atualizada.`);
            fecharPainel();
          },
          onError: () => toast.error("Não foi possível renomear a área."),
        },
      );
      return;
    }

    if (!areaPendente) return;
    adicionarArea.mutate(
      { ...areaPendente, nome: dados.nome },
      {
        onSuccess: () => {
          toast.success(`"${dados.nome}" adicionada.`);
          fecharPainel();
        },
        onError: () => toast.error("Não foi possível salvar a área no croqui."),
      },
    );
  });

  function excluirAreaSelecionada() {
    if (!areaEditando) return;
    const nome = areaEditando.nome;
    removerArea.mutate(areaEditando.id, {
      onSuccess: () => {
        toast.success(`"${nome}" excluída.`);
        fecharPainel();
      },
      onError: () => toast.error(`Não foi possível excluir "${nome}".`),
    });
  }

  const salvando = adicionarMesa.isPending || atualizarMesa.isPending;
  const painelMesaAberto = !!mesaEditando || !!posicaoPendente;
  const painelAreaAberto = !!areaEditando || !!areaPendente;

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
            areas={areas}
            modo={modo}
            mesaSelecionadaId={mesaEditando?.id}
            posicaoPendente={posicaoPendente}
            onCanvasClick={
              modo === "mesa"
                ? ({ x, y }) => {
                    setValue("posicaoX", x, { shouldValidate: true });
                    setValue("posicaoY", y, { shouldValidate: true });
                    setPosicaoPendente({ x, y });
                  }
                : undefined
            }
            onMesaClick={modo === "mesa" ? selecionarMesaParaEditar : undefined}
            onMesaArrastada={modo === "mesa" ? moverMesa : undefined}
            onSegmentoDesenhado={modo === "parede" || modo === "porta" ? desenharElemento : undefined}
            onElementoClick={modo === "parede" || modo === "porta" ? setElementoSelecionado : undefined}
            elementoSelecionadoId={elementoSelecionado?.id}
            onAreaDesenhada={
              modo === "area"
                ? (retangulo) => {
                    setAreaPendente(retangulo);
                    resetArea({ nome: "" });
                  }
                : undefined
            }
            onAreaClick={
              modo === "area"
                ? (area) => {
                    setAreaEditando(area);
                    setAreaPendente(null);
                    resetArea({ nome: area.nome });
                  }
                : undefined
            }
            onAreaArrastada={modo === "area" ? moverArea : undefined}
            areaSelecionadaId={areaEditando?.id}
            painelPosicao={
              modo === "mesa"
                ? (posicaoPendente ??
                  (mesaEditando ? { x: mesaEditando.posicaoX, y: mesaEditando.posicaoY } : null))
                : modo === "area"
                  ? (areaPendente
                      ? { x: areaPendente.x + areaPendente.largura, y: areaPendente.y }
                      : areaEditando
                        ? pontoMedioArea(areaEditando)
                        : null)
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
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Formato</Label>
                      <div className="flex gap-1.5 rounded-lg border bg-muted/40 p-1">
                        {(
                          [
                            { valor: "redonda" as FormatoMesa, rotulo: "Redonda", icone: Circle },
                            {
                              valor: "retangular" as FormatoMesa,
                              rotulo: "Retangular",
                              icone: RectangleHorizontal,
                            },
                          ]
                        ).map(({ valor, rotulo, icone: Icone }) => (
                          <Button
                            key={valor}
                            type="button"
                            size="sm"
                            variant={formatoAtual === valor ? "default" : "ghost"}
                            className="h-7 flex-1 text-xs"
                            onClick={() =>
                              setValue("formato", valor, { shouldDirty: true, shouldValidate: true })
                            }
                          >
                            <Icone className="size-3.5" />
                            {rotulo}
                          </Button>
                        ))}
                      </div>
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
              ) : modo === "area" ? (
                painelAreaAberto ? (
                  <form onSubmit={onSubmitArea} className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {areaEditando ? "Editar área" : "Nova área"}
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
                    <div className="space-y-1">
                      <Label htmlFor="area-nome" className="text-xs text-muted-foreground">
                        Nome (ex.: Tablado, Bar, Pista de dança)
                      </Label>
                      <Input
                        id="area-nome"
                        className="h-8"
                        autoFocus
                        aria-invalid={!!errosArea.nome}
                        {...registerArea("nome")}
                      />
                      {errosArea.nome && (
                        <p className="text-xs text-destructive">{errosArea.nome.message}</p>
                      )}
                    </div>

                    {areaEditando && (
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              disabled={removerArea.isPending}
                            />
                          }
                        >
                          {removerArea.isPending ? "Excluindo…" : "Excluir área"}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir “{areaEditando.nome}”?</AlertDialogTitle>
                            <AlertDialogDescription>Não dá pra desfazer.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={excluirAreaSelecionada}>
                              Confirmar exclusão
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <Button
                      type="submit"
                      size="sm"
                      className="w-full"
                      disabled={adicionarArea.isPending || atualizarArea.isPending}
                    >
                      {adicionarArea.isPending || atualizarArea.isPending
                        ? "Salvando…"
                        : areaEditando
                          ? "Salvar nome"
                          : "Adicionar área"}
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
