"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  useCategoriasSocio,
  useCriarCategoriaSocio,
} from "@/features/associados/use-associados";
import { formatarMoeda } from "@/lib/format";

const formSchema = z
  .object({
    nome: z.string().min(2, "Informe o nome da categoria."),
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

// T-FE-003 nunca teve tela pra isso — categorias só eram criadas via API direta em teste manual
// (ver nota do ticket no PLANEJAMENTO-GERAL.md), por isso o Select de "categoria de sócio" em
// /associados/novo sempre aparecia vazio na prática. Isenção de mensalidade (sócio benemérito/
// honorário, comum em entidades tradicionalistas) também nunca tinha sido modelada — ver adendo
// na mesma seção do planejamento.
export default function CategoriasSocioPage() {
  const { data: categorias, isLoading, isError } = useCategoriasSocio();
  const criar = useCriarCategoriaSocio();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { isenta: false },
  });

  const isenta = useWatch({ control, name: "isenta" });

  const onSubmit = handleSubmit((dados) => {
    criar.mutate(
      {
        nome: dados.nome,
        isenta: dados.isenta,
        valorMensalidade: dados.isenta ? undefined : dados.valorMensalidade,
      },
      {
        onSuccess: () => {
          toast.success("Categoria criada.");
          reset({ nome: "", isenta: false, valorMensalidade: undefined });
        },
        onError: () => toast.error("Não foi possível criar a categoria."),
      },
    );
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link
          href="/associados"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Associados
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Categorias de sócio
        </h1>
        <p className="text-muted-foreground">
          Cada categoria define o valor de mensalidade cobrado do associado — ou a isenção, para
          categorias como sócio benemérito/honorário que não pagam mensalidade.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Ex.: Contribuinte"
                  aria-invalid={!!errors.nome}
                  {...register("nome")}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMensalidade">Mensalidade (R$)</Label>
                <Input
                  id="valorMensalidade"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  disabled={isenta}
                  aria-invalid={!!errors.valorMensalidade}
                  {...register("valorMensalidade")}
                />
                {errors.valorMensalidade && (
                  <p className="text-sm text-destructive">
                    {errors.valorMensalidade.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="isenta"
                render={({ field }) => (
                  <Checkbox
                    id="isenta"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isenta" className="font-normal">
                Categoria isenta de mensalidade (ex.: sócio benemérito, honorário)
              </Label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={criar.isPending}>
                {criar.isPending ? "Adicionando…" : "Adicionar categoria"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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

      {categorias && categorias.length === 0 && (
        <p className="text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
      )}

      {categorias && categorias.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Mensalidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria, indice) => (
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
                    <Badge variant={categoria.ativa ? "success" : "outline"}>
                      {categoria.ativa ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
