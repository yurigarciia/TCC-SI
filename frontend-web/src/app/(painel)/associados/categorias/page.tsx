"use client";

import { Loader2, Pencil, Tag, Trash2 } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAlternarStatusCategoriaSocio,
  useAtualizarCategoriaSocio,
  useCategoriasSocio,
  useExcluirCategoriaSocio,
} from "@/features/associados/use-associados";
import type { CategoriaSocio } from "@/features/associados/types";
import { ApiError } from "@/lib/api-client";
import { formatarMoeda } from "@/lib/format";
import { TableEmptyRow } from "@/components/table-empty-row";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";

// T-FE-003 nunca teve tela pra isso — categorias só eram criadas via API direta em teste manual
// (ver nota do ticket no PLANEJAMENTO-GERAL.md), por isso o Select de "categoria de sócio" em
// /associados/novo sempre aparecia vazio na prática. Isenção de mensalidade (sócio benemérito/
// honorário, comum em entidades tradicionalistas) também nunca tinha sido modelada — ver adendo
// na mesma seção do planejamento.
export default function CategoriasSocioPage() {
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaSocio | null>(null);
  const [categoriaExcluindo, setCategoriaExcluindo] = useState<CategoriaSocio | null>(null);
  const { data: resultado, isLoading, isError } = useCategoriasSocio(pagina, busca || undefined);
  const categorias = resultado?.itens;
  const excluir = useExcluirCategoriaSocio();
  const alternarStatus = useAlternarStatusCategoriaSocio();

  const mudarBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1);
  };

  function confirmarExclusao() {
    if (!categoriaExcluindo) return;
    excluir.mutate(categoriaExcluindo.id, {
      onSuccess: () => {
        toast.success("Categoria excluída.");
        setCategoriaExcluindo(null);
      },
      onError: (erro) => {
        toast.error(
          erro instanceof ApiError
            ? erro.message
            : "Não foi possível excluir a categoria.",
        );
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Breadcrumb items={[{ label: "Associados", href: "/associados" }, { label: "Categorias de associado" }]} />
        <h1 className="font-heading text-2xl font-semibold text-foreground"><Tag aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />
          Categorias de associado
        </h1>
        <p className="text-sm text-muted-foreground">
          Valor de mensalidade por categoria.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={busca} onChange={mudarBusca} placeholder="Buscar por nome" />
        <Button render={<Link href="/associados/categorias/novo" />}>Nova categoria</Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar as categorias. Tente novamente em instantes.
        </p>
      )}

      {categorias && (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Mensalidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.length === 0 ? (
                <TableEmptyRow colSpan={4}>
                  {busca
                    ? "Nenhuma categoria encontrada para esse termo."
                    : "Nenhuma categoria cadastrada ainda."}
                </TableEmptyRow>
              ) : (
                categorias.map((categoria, indice) => (
                  <TableRow
                    key={categoria.id}
                    className={indice % 2 === 1 ? "bg-muted/50" : undefined}
                  >
                    <TableCell className="font-medium">{categoria.nome}</TableCell>
                    <TableCell>
                      {categoria.isenta ? (
                        <Badge variant="secondary">Isenta</Badge>
                      ) : (
                        formatarMoeda(categoria.valorMensalidade)
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="cursor-pointer"
                        disabled={alternarStatus.isPending}
                        title={
                          categoria.ativa
                            ? "Desativar — some do seletor de novos cadastros"
                            : "Reativar categoria"
                        }
                        onClick={() =>
                          alternarStatus.mutate(
                            { id: categoria.id, ativa: !categoria.ativa },
                            {
                              onSuccess: () =>
                                toast.success(
                                  categoria.ativa ? "Categoria desativada." : "Categoria reativada.",
                                ),
                              onError: () =>
                                toast.error("Não foi possível alterar o status da categoria."),
                            },
                          )
                        }
                      >
                        <Badge variant={categoria.ativa ? "success" : "outline"}>
                          {categoria.ativa ? "Ativa" : "Inativa"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${categoria.nome}`}
                        onClick={() => setCategoriaEditando(categoria)}
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${categoria.nome}`}
                        onClick={() => setCategoriaExcluindo(categoria)}
                      >
                        <Trash2 aria-hidden="true" className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {resultado && <Pagination pagina={resultado} onMudarPagina={setPagina} />}
        </div>
      )}

      <Dialog
        open={!!categoriaEditando}
        onOpenChange={(aberto) => !aberto && setCategoriaEditando(null)}
      >
        <DialogContent className="sm:max-w-md">
          {categoriaEditando && (
            <FormularioEditarCategoria
              categoria={categoriaEditando}
              onFechar={() => setCategoriaEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!categoriaExcluindo}
        onOpenChange={(aberto) => !aberto && setCategoriaExcluindo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{categoriaExcluindo?.nome}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Só é possível se nenhum associado estiver vinculado a esta categoria. Não dá pra
              desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={excluir.isPending} onClick={confirmarExclusao}>
              {excluir.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {excluir.isPending ? "Excluindo…" : "Confirmar exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const formSchema = z
  .object({
    nome: z.string().min(2, "Informe o nome da categoria.").max(100, "Máximo de 100 caracteres."),
    isenta: z.boolean(),
    valorMensalidade: z.coerce.number().nonnegative().optional(),
  })
  .superRefine((dados, ctx) => {
    if (!dados.isenta && !(dados.valorMensalidade && dados.valorMensalidade > 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["valorMensalidade"],
        message: "Informe um valor maior que zero.",
      });
    }
  });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

function FormularioEditarCategoria({
  categoria,
  onFechar,
}: {
  categoria: CategoriaSocio;
  onFechar: () => void;
}) {
  const atualizar = useAtualizarCategoriaSocio(categoria.id);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: categoria.nome,
      isenta: categoria.isenta,
      valorMensalidade: categoria.valorMensalidade,
    },
  });

  const isenta = useWatch({ control, name: "isenta" });

  const onSubmit = handleSubmit((dados) => {
    atualizar.mutate(
      {
        nome: dados.nome,
        isenta: dados.isenta,
        valorMensalidade: dados.isenta ? undefined : dados.valorMensalidade,
      },
      {
        onSuccess: () => {
          toast.success("Categoria atualizada.");
          onFechar();
        },
        onError: () => toast.error("Não foi possível atualizar a categoria."),
      },
    );
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar categoria</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="nome-editar">Nome</Label>
          <Input
            id="nome-editar"
            maxLength={100}
            aria-invalid={!!errors.nome}
            {...register("nome")}
          />
          {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valorMensalidade-editar">Mensalidade (R$)</Label>
          <Input
            id="valorMensalidade-editar"
            type="number"
            step="0.01"
            min="0"
            disabled={isenta}
            aria-invalid={!!errors.valorMensalidade}
            {...register("valorMensalidade")}
          />
          {errors.valorMensalidade && (
            <p className="text-sm text-destructive">{errors.valorMensalidade.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="isenta"
            render={({ field }) => (
              <Checkbox
                id="isenta-editar"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="isenta-editar" className="font-normal">
            Categoria isenta de mensalidade
          </Label>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={atualizar.isPending}>
            {atualizar.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {atualizar.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </form>
    </>
  );
}
