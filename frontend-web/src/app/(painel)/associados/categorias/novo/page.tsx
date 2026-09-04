"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCriarCategoriaSocio } from "@/features/associados/use-associados";

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

export default function NovaCategoriaSocioPage() {
  const router = useRouter();
  const criar = useCriarCategoriaSocio();

  const {
    register,
    control,
    handleSubmit,
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
          router.push("/associados/categorias");
        },
        onError: () => toast.error("Não foi possível criar a categoria."),
      },
    );
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Breadcrumb
          items={[
            { label: "Associados", href: "/associados" },
            { label: "Categorias de sócio", href: "/associados/categorias" },
            { label: "Nova categoria" },
          ]}
        />
        <h1 className="font-heading text-2xl font-semibold text-foreground">Nova categoria</h1>
        <p className="text-muted-foreground">
          Define a categoria e o valor de mensalidade cobrado do associado.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Dados da categoria</CardTitle>
          <CardDescription>
            Categorias isentas (ex.: sócio benemérito, honorário) nunca geram mensalidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Ex.: Contribuinte"
                aria-invalid={!!errors.nome}
                {...register("nome")}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
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
                <p className="text-sm text-destructive">{errors.valorMensalidade.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="isenta"
                render={({ field }) => (
                  <Checkbox id="isenta" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="isenta" className="font-normal">
                Categoria isenta de mensalidade (ex.: sócio benemérito, honorário)
              </Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" render={<Link href="/associados/categorias" />}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criar.isPending}>
                {criar.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
