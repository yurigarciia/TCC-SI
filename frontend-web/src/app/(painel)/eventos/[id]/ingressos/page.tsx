"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QrCode, TicketPlus } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCategoriasSocio } from "@/features/associados/use-associados";
import { useEvento, usePrecosIngressoEvento } from "@/features/eventos/use-eventos";
import type { PrecosIngressoConfigurados } from "@/features/eventos/types";
import { QrCodeScanner } from "@/features/ingressos/qr-code-scanner";
import { rotuloPerfilComprador, StatusIngressoBadge } from "@/features/ingressos/status-badge";
import { useEmitirIngresso, useIngressosEvento, useRegistrarCheckin } from "@/features/ingressos/use-ingressos";
import { formatarDataHora, formatarMoeda } from "@/lib/format";
import { TableEmptyRow } from "@/components/table-empty-row";
import { Pagination } from "@/components/pagination";

const emitirSchema = z
  .object({
    nomeComprador: z.string().min(2, "Informe o nome do comprador."),
    perfilComprador: z.enum(["socio", "nao_socio", "crianca"]),
    categoriaSocioId: z.string().optional(),
    formaPagamento: z.enum(["presencial", "online"]),
    // String em vez de z.coerce.number() — coerção de número em cima de "" dá 0, não undefined
    // (mesmo motivo já documentado em evento-formulario.tsx). Sobrescreve o preço resolvido pelo
    // backend quando preenchido; convertido pra número só no submit.
    preco: z.string().optional(),
  })
  .superRefine((dados, ctx) => {
    if (dados.perfilComprador === "socio" && !dados.categoriaSocioId) {
      ctx.addIssue({
        code: "custom",
        path: ["categoriaSocioId"],
        message: "Selecione a categoria de sócio do comprador.",
      });
    }
  });

type EmitirFormValues = z.infer<typeof emitirSchema>;

function paraNumeroOpcional(valor?: string): number | undefined {
  if (!valor || !valor.trim()) return undefined;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

// Achado numa conversa com o usuário: o valor cobrado só aparecia depois de já ter emitido o
// ingresso (num toast que passa rápido). Resolve o mesmo preço que o backend vai cobrar — mesma
// fonte de dados de PrecosIngressoConfigurados (GET /eventos/:id/precos-ingresso), só pra prévia;
// quem decide o preço de verdade continua sendo o backend na hora de emitir.
function resolverPrecoPrevisto(
  precos: PrecosIngressoConfigurados | undefined,
  perfil: EmitirFormValues["perfilComprador"] | undefined,
  categoriaSocioId: string | undefined,
): number | null | undefined {
  if (!precos || !perfil) return undefined;
  if (perfil === "nao_socio") return precos.naoSocio;
  if (perfil === "crianca") return precos.crianca;
  // Sócio ainda sem categoria escolhida — undefined (não decidiu ainda), não null (não
  // configurado). Achado numa conversa com o usuário: mostrava o aviso de "preço não
  // configurado" assim que "Sócio" era selecionado, antes até da categoria aparecer pra
  // escolher.
  if (!categoriaSocioId) return undefined;
  return precos.porCategoria.find((p) => p.categoriaSocioId === categoriaSocioId)?.preco ?? null;
}

export default function IngressosEventoPage() {
  const params = useParams<{ id: string }>();
  const { data: evento, isLoading } = useEvento(params.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!evento) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar este evento. Ele pode não existir mais.
      </p>
    );
  }

  return <IngressosConteudo eventoId={params.id} nomeEvento={evento.evento.nome} />;
}

function IngressosConteudo({ eventoId, nomeEvento }: { eventoId: string; nomeEvento: string }) {
  const [filtroNome, setFiltroNome] = useState("");
  const [pagina, setPagina] = useState(1);
  const [codigoCheckin, setCodigoCheckin] = useState("");
  // Achado numa conversa com o usuário: os cards de "Vender ingresso" e "Check-in" ficavam sempre
  // abertos, competindo com a listagem (o foco de verdade da tela — é o que a diretoria mais
  // consulta) por espaço. Viraram botões de ação que abrem um modal cada, deixando a listagem
  // como o conteúdo principal da página.
  const [modalVenda, setModalVenda] = useState(false);
  const [modalCheckin, setModalCheckin] = useState(false);

  const { data: resultado, isLoading, isError } = useIngressosEvento(
    eventoId,
    pagina,
    filtroNome || undefined,
  );
  const ingressos = resultado?.itens;
  const emitir = useEmitirIngresso(eventoId);
  const checkin = useRegistrarCheckin(eventoId);

  // Dropdown de seleção — busca uma página grande o bastante pra cobrir todas as categorias
  // cadastradas sem precisar de paginação aqui (número de categorias tende a ser pequeno).
  const { data: resultadoCategorias } = useCategoriasSocio(1, undefined, 100);
  const categorias = resultadoCategorias?.itens;
  const { data: precos } = usePrecosIngressoEvento(eventoId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<EmitirFormValues>({
    resolver: zodResolver(emitirSchema),
    defaultValues: { perfilComprador: "socio", formaPagamento: "presencial" },
  });

  const perfilSelecionado = useWatch({ control, name: "perfilComprador" });
  const categoriaSelecionada = useWatch({ control, name: "categoriaSocioId" });
  const precoDigitado = useWatch({ control, name: "preco" });
  const precoPrevisto = resolverPrecoPrevisto(precos, perfilSelecionado, categoriaSelecionada);

  // Sugere o preço resolvido assim que dá pra calcular, mas só enquanto a pessoa não digitou nada
  // por conta própria (setValue sem shouldDirty não marca o campo como "sujo") — permite vender
  // por um valor diferente do configurado sem a sugestão ficar sobrescrevendo o que foi digitado.
  useEffect(() => {
    if (typeof precoPrevisto === "number" && !dirtyFields.preco) {
      setValue("preco", String(precoPrevisto));
    }
  }, [precoPrevisto, dirtyFields.preco, setValue]);

  const onSubmitEmitir = handleSubmit((dados) => {
    emitir.mutate(
      { ...dados, preco: paraNumeroOpcional(dados.preco) },
      {
        onSuccess: (ingresso) => {
          toast.success(`Ingresso emitido — ${formatarMoeda(ingresso.preco)}.`);
          reset({
            nomeComprador: "",
            perfilComprador: "socio",
            categoriaSocioId: undefined,
            formaPagamento: "presencial",
            preco: undefined,
          });
        },
        onError: (erro) => toast.error(erro.message || "Não foi possível emitir o ingresso."),
      },
    );
  });

  const fazerCheckin = (ingressoId: string) => {
    checkin.mutate(ingressoId, {
      onSuccess: () => toast.success("Entrada validada."),
      onError: (erro) => toast.error(erro.message || "Não foi possível registrar o check-in."),
    });
  };

  const processarCheckinPorCodigo = (codigo: string) => {
    checkin.mutate(codigo, {
      onSuccess: () => {
        toast.success("Entrada validada.");
        setCodigoCheckin("");
      },
      onError: (erro) =>
        toast.error(erro.message || "Código não encontrado, ou o ingresso já foi utilizado."),
    });
  };

  const onSubmitCheckinPorCodigo = (evento: FormEvent) => {
    evento.preventDefault();
    if (!codigoCheckin.trim()) return;
    processarCheckinPorCodigo(codigoCheckin.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Breadcrumb
            items={[
              { label: "Eventos", href: "/eventos" },
              { label: nomeEvento, href: `/eventos/${eventoId}` },
              { label: "Ingressos" },
            ]}
          />
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Emissão e check-in de ingressos
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setModalCheckin(true)}>
            <QrCode />
            Check-in
          </Button>
          <Button onClick={() => setModalVenda(true)}>
            <TicketPlus />
            Vender ingresso
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingressos emitidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Buscar por nome do comprador"
            value={filtroNome}
            onChange={(e) => {
              setFiltroNome(e.target.value);
              setPagina(1);
            }}
          />

          {isLoading && <Skeleton className="h-24 w-full" />}
          {isError && (
            <p className="text-sm text-destructive">Não foi possível carregar os ingressos.</p>
          )}
          {ingressos && (
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                {ingressos.length === 0 ? (
                  <TableEmptyRow colSpan={6}>Nenhum ingresso encontrado.</TableEmptyRow>
                ) : (
                  ingressos.map((ingresso) => (
                    <TableRow key={ingresso.id}>
                      <TableCell className="font-medium">{ingresso.nomeComprador}</TableCell>
                      <TableCell>{rotuloPerfilComprador(ingresso.perfilComprador)}</TableCell>
                      <TableCell>{formatarMoeda(ingresso.preco)}</TableCell>
                      <TableCell>
                        <StatusIngressoBadge status={ingresso.status} />
                      </TableCell>
                      <TableCell>
                        {ingresso.usadoEm ? formatarDataHora(ingresso.usadoEm) : "—"}
                      </TableCell>
                      <TableCell>
                        {ingresso.status === "emitido" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={checkin.isPending}
                            onClick={() => fazerCheckin(ingresso.id)}
                          >
                            Check-in
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                </TableBody>
              </Table>
              {resultado && <Pagination pagina={resultado} onMudarPagina={setPagina} />}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalVenda} onOpenChange={setModalVenda}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Vender ingresso presencial</DialogTitle>
            <DialogDescription>
              Venda ingresso presencialmente, sem pagamento online. O ingresso será emitido e o comprador poderá entrar no evento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmitEmitir} className="grid gap-4 sm:grid-cols-3" noValidate>
            <div className="space-y-2 sm:col-span-3">
              <Label htmlFor="nomeComprador">Nome do comprador</Label>
              <Input
                id="nomeComprador"
                placeholder="Ex.: Maria da Silva"
                aria-invalid={!!errors.nomeComprador}
                {...register("nomeComprador")}
              />
              {errors.nomeComprador && (
                <p className="text-sm text-destructive">{errors.nomeComprador.message}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="perfilComprador">Perfil</Label>
              <Controller
                control={control}
                name="perfilComprador"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="perfilComprador" className="w-full">
                      <SelectValue>
                        {(valor: EmitirFormValues["perfilComprador"]) => rotuloPerfilComprador(valor)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="socio">Sócio</SelectItem>
                      <SelectItem value="nao_socio">Não-sócio</SelectItem>
                      <SelectItem value="crianca">Criança</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formaPagamento">Pagamento</Label>
              <Controller
                control={control}
                name="formaPagamento"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="formaPagamento" className="w-full">
                      <SelectValue>
                        {(valor: EmitirFormValues["formaPagamento"]) =>
                          valor === "online" ? "Online" : "Presencial"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {perfilSelecionado === "socio" && (
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="categoriaSocioId">Categoria de sócio</Label>
                <Controller
                  control={control}
                  name="categoriaSocioId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="categoriaSocioId"
                        className="w-full"
                        aria-invalid={!!errors.categoriaSocioId}
                      >
                        <SelectValue placeholder="Selecionar categoria">
                          {(valor: string | null) =>
                            categorias?.find((categoria) => categoria.id === valor)?.nome ??
                            "Selecionar categoria"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categorias?.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoriaSocioId && (
                  <p className="text-sm text-destructive">{errors.categoriaSocioId.message}</p>
                )}
              </div>
            )}
            {(perfilSelecionado === "nao_socio" ||
              perfilSelecionado === "crianca" ||
              (perfilSelecionado === "socio" && categoriaSelecionada)) && (
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="preco">Valor a cobrar</Label>
                <Input
                  id="preco"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  aria-invalid={precoPrevisto === null && !paraNumeroOpcional(precoDigitado)}
                  {...register("preco")}
                />
                {precoPrevisto === null ? (
                  <p className="text-sm text-destructive">
                    Preço não configurado pra esse perfil{perfilSelecionado === "socio" ? " e categoria" : ""}{" "}
                    neste evento — informe o valor manualmente pra vender assim mesmo.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sugestão a partir do preço configurado — pode mudar se for vender por outro
                    valor.
                  </p>
                )}
              </div>
            )}
            <div className="sm:col-span-3 flex justify-end">
              <Button
                type="submit"
                disabled={emitir.isPending || paraNumeroOpcional(precoDigitado) === undefined}
              >
                {emitir.isPending ? "Emitindo…" : "Emitir ingresso"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={modalCheckin} onOpenChange={setModalCheckin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check-in por código (QR)</DialogTitle>
            <DialogDescription>Aponte a câmera pro QR do ingresso, ou digite o código na mão.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <QrCodeScanner onScan={processarCheckinPorCodigo} />
            <form onSubmit={onSubmitCheckinPorCodigo} className="flex gap-2" noValidate>
              <Input
                placeholder="Ou cole/digite o código do ingresso"
                value={codigoCheckin}
                onChange={(e) => setCodigoCheckin(e.target.value)}
              />
              <Button type="submit" disabled={!codigoCheckin.trim() || checkin.isPending}>
                Validar entrada
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
