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
import { useState, type DragEvent } from "react";
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
  type ItemPaleta,
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
  formato: z.enum(["redonda", "retangular"]),
});

type MesaFormInput = z.input<typeof mesaSchema>;
type MesaFormValues = z.output<typeof mesaSchema>;

const areaSchema = z.object({
  nome: z.string().min(1, "Dê um nome pra essa área (ex.: Tablado, Bar)."),
});

type AreaFormValues = z.infer<typeof areaSchema>;

// Itens arrastáveis do menu lateral — arrastar um deles até dentro do croqui cria o item na hora,
// já com valores padrão, sem formulário de confirmação no meio do caminho. Substitui o fluxo
// antigo (escolher ferramenta → clicar/arrastar no croqui → confirmar num formulário), achado
// pouco intuitivo numa conversa com o usuário.
const ITENS_PALETA: Array<{ item: ItemPaleta; rotulo: string; icone: typeof Armchair }> = [
  { item: "mesa-redonda", rotulo: "Mesa redonda", icone: Circle },
  { item: "mesa-retangular", rotulo: "Mesa retangular", icone: RectangleHorizontal },
  { item: "parede", rotulo: "Parede", icone: Minus },
  { item: "porta", rotulo: "Porta", icone: DoorOpen },
  { item: "area", rotulo: "Área", icone: SquareDashed },
];

const NOME_TIPO_ELEMENTO: Record<TipoElementoEstrutural, string> = {
  parede: "Parede",
  porta: "Porta",
};

// Comprimento padrão (px) de parede/porta ao serem soltas no croqui — a API ainda não tem
// endpoint pra reposicionar/redimensionar um traço depois de criado (só mesa e área têm PATCH),
// então, por ora, errar o lugar ou o tamanho significa excluir e soltar de novo.
const META_LARGURA_PAREDE = 50;
const META_LARGURA_PORTA = 25;

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
  const { salao, mesas, elementos, areas } = data;
  const adicionarMesa = useAdicionarMesa(salaoId);
  const atualizarMesa = useAtualizarMesa(salaoId);
  const removerMesa = useRemoverMesa(salaoId);
  const adicionarElemento = useAdicionarElemento(salaoId);
  const removerElemento = useRemoverElemento(salaoId);
  const adicionarArea = useAdicionarArea(salaoId);
  const atualizarArea = useAtualizarArea(salaoId);
  const removerArea = useRemoverArea(salaoId);

  // Só um desses três por vez — selecionar um dos outros dois sempre fecha o anterior (ver
  // selecionarMesaParaEditar/selecionarArea/selecionarElemento), pra nunca abrir dois painéis
  // flutuando ao mesmo tempo.
  const [mesaEditando, setMesaEditando] = useState<Mesa | null>(null);
  const [areaEditando, setAreaEditando] = useState<AreaEstrutural | null>(null);
  const [elementoSelecionado, setElementoSelecionado] = useState<ElementoEstrutural | null>(null);

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
    defaultValues: { numero: proximoNumero, capacidade: 4, formato: "redonda" },
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
    setAreaEditando(null);
    setElementoSelecionado(null);
  }

  function selecionarMesaParaEditar(mesa: Mesa) {
    setAreaEditando(null);
    setElementoSelecionado(null);
    setMesaEditando(mesa);
    reset({ numero: mesa.numero, capacidade: mesa.capacidade, formato: mesa.formato });
  }

  function selecionarArea(area: AreaEstrutural) {
    setMesaEditando(null);
    setElementoSelecionado(null);
    setAreaEditando(area);
    resetArea({ nome: area.nome });
  }

  function selecionarElemento(elemento: ElementoEstrutural) {
    setMesaEditando(null);
    setAreaEditando(null);
    setElementoSelecionado(elemento);
  }

  function moverMesa(mesa: Mesa, posicao: { x: number; y: number }) {
    atualizarMesa.mutate(
      { mesaId: mesa.id, dados: { posicaoX: posicao.x, posicaoY: posicao.y } },
      { onError: () => toast.error(`Não foi possível mover a mesa ${mesa.numero}.`) },
    );
  }

  function moverArea(area: AreaEstrutural, posicao: { x: number; y: number }) {
    atualizarArea.mutate(
      { areaId: area.id, dados: posicao },
      { onError: () => toast.error(`Não foi possível mover "${area.nome}".`) },
    );
  }

  function aoSoltarItem(item: ItemPaleta, posicao: { x: number; y: number }) {
    if (item === "mesa-redonda" || item === "mesa-retangular") {
      const formato: FormatoMesa = item === "mesa-redonda" ? "redonda" : "retangular";
      adicionarMesa.mutate(
        { numero: proximoNumero, capacidade: 4, posicaoX: posicao.x, posicaoY: posicao.y, formato },
        {
          onSuccess: (mesa) => toast.success(`Mesa ${mesa.numero} adicionada.`),
          onError: (erro) =>
            toast.error(
              erro instanceof ApiError && erro.status === 409
                ? `Já existe uma mesa número ${proximoNumero} neste salão.`
                : "Não foi possível adicionar a mesa.",
            ),
        },
      );
      return;
    }

    if (item === "parede" || item === "porta") {
      const metaLargura = item === "parede" ? META_LARGURA_PAREDE : META_LARGURA_PORTA;
      adicionarElemento.mutate(
        {
          tipo: item,
          x1: posicao.x - metaLargura,
          y1: posicao.y,
          x2: posicao.x + metaLargura,
          y2: posicao.y,
        },
        {
          onSuccess: () => toast.success(`${NOME_TIPO_ELEMENTO[item]} adicionada.`),
          onError: () => toast.error("Não foi possível salvar o traço no croqui."),
        },
      );
      return;
    }

    // Abre o painel de renomear na hora — o nome padrão ("Nova área") é só um placeholder, e
    // quem soltou o item provavelmente já sabe o nome que quer dar (ex.: "Tablado").
    adicionarArea.mutate(
      { nome: "Nova área", x: posicao.x, y: posicao.y, largura: 120, altura: 80 },
      {
        onSuccess: (area) => {
          setMesaEditando(null);
          setElementoSelecionado(null);
          setAreaEditando(area);
          resetArea({ nome: area.nome });
        },
        onError: () => toast.error("Não foi possível salvar a área no croqui."),
      },
    );
  }

  const onSubmit = handleSubmit((dados) => {
    if (!mesaEditando) return;
    atualizarMesa.mutate(
      { mesaId: mesaEditando.id, dados },
      {
        onSuccess: () => {
          toast.success(`Mesa ${dados.numero} atualizada.`);
          fecharPainel();
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
  });

  const excluirMesaSelecionada = () => {
    if (!mesaEditando) return;
    const numero = mesaEditando.numero;
    removerMesa.mutate(mesaEditando.id, {
      onSuccess: () => {
        toast.success(`Mesa ${numero} excluída.`);
        fecharPainel();
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

  function excluirElementoSelecionado() {
    if (!elementoSelecionado) return;
    const nome = NOME_TIPO_ELEMENTO[elementoSelecionado.tipo];
    removerElemento.mutate(elementoSelecionado.id, {
      onSuccess: () => {
        toast.success(`${nome} excluída.`);
        fecharPainel();
      },
      onError: () => toast.error(`Não foi possível excluir ${nome === "Porta" ? "a porta" : "a parede"}.`),
    });
  }

  const onSubmitArea = handleSubmitArea((dados) => {
    if (!areaEditando) return;
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

  function aoArrastarItemPaleta(evento: DragEvent<HTMLDivElement>, item: ItemPaleta) {
    evento.dataTransfer.effectAllowed = "copy";
    evento.dataTransfer.setData("text/plain", item);
  }

  const painelPosicao = mesaEditando
    ? { x: mesaEditando.posicaoX, y: mesaEditando.posicaoY }
    : areaEditando
      ? pontoMedioArea(areaEditando)
      : elementoSelecionado
        ? pontoMedioElemento(elementoSelecionado)
        : null;

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
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex shrink-0 flex-row gap-2 overflow-x-auto sm:w-40 sm:flex-col sm:overflow-visible">
              {ITENS_PALETA.map(({ item, rotulo, icone: Icone }) => (
                <div
                  key={item}
                  draggable
                  onDragStart={(evento) => aoArrastarItemPaleta(evento, item)}
                  className="flex shrink-0 cursor-grab items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground active:cursor-grabbing"
                  title={`Arraste até o croqui para adicionar: ${rotulo}`}
                >
                  <Icone className="size-4 text-muted-foreground" />
                  {rotulo}
                </div>
              ))}
            </div>

            <MesaCanvas
              mesas={mesas}
              elementos={elementos}
              areas={areas}
              onItemSolto={aoSoltarItem}
              onMesaClick={selecionarMesaParaEditar}
              onMesaArrastada={moverMesa}
              mesaSelecionadaId={mesaEditando?.id}
              onElementoClick={selecionarElemento}
              elementoSelecionadoId={elementoSelecionado?.id}
              onAreaClick={selecionarArea}
              onAreaArrastada={moverArea}
              areaSelecionadaId={areaEditando?.id}
              painelPosicao={painelPosicao}
              painel={
                mesaEditando ? (
                  <form onSubmit={onSubmit} className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">Mesa {mesaEditando.numero}</p>
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

                    <Button type="submit" size="sm" className="w-full" disabled={atualizarMesa.isPending}>
                      {atualizarMesa.isPending ? "Salvando…" : "Salvar alterações"}
                    </Button>
                  </form>
                ) : areaEditando ? (
                  <form onSubmit={onSubmitArea} className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">Editar área</p>
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

                    <Button type="submit" size="sm" className="w-full" disabled={atualizarArea.isPending}>
                      {atualizarArea.isPending ? "Salvando…" : "Salvar nome"}
                    </Button>
                  </form>
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
          </div>
          <p className="text-xs text-muted-foreground">
            Arraste um item do menu ao lado até o croqui para adicionar. Arraste um item já
            colocado para mudar de lugar, ou clique nele para editar/excluir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
