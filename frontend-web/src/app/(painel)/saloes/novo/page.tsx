"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCriarSalao } from "@/features/saloes/use-saloes";

const formSchema = z.object({
  nome: z.string().min(2, "Informe o nome do salão."),
  capacidadeTotal: z.coerce.number().int().positive("Informe uma capacidade válida."),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export default function NovoSalaoPage() {
  const router = useRouter();
  const criar = useCriarSalao();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = handleSubmit((dados) => {
    criar.mutate(dados, {
      onSuccess: (salao) => {
        toast.success("Salão cadastrado. Agora adicione as mesas.");
        router.push(`/saloes/${salao.id}`);
      },
      onError: () => toast.error("Não foi possível cadastrar o salão."),
    });
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Breadcrumb items={[{ label: "Salões", href: "/saloes" }, { label: "Novo salão" }]} />
        <h1 className="font-heading text-2xl font-semibold text-foreground">Novo salão</h1>
        <p className="text-muted-foreground">
          Uma entidade pode ter mais de um salão cadastrado.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Dados do salão</CardTitle>
          <CardDescription>As mesas são adicionadas na próxima tela.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do salão</Label>
              <Input
                id="nome"
                placeholder="Ex.: Salão Social da entidade"
                aria-invalid={!!errors.nome}
                {...register("nome")}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacidadeTotal">Capacidade total estimada</Label>
              <Input
                id="capacidadeTotal"
                type="number"
                min={1}
                placeholder="Ex.: 200"
                aria-invalid={!!errors.capacidadeTotal}
                {...register("capacidadeTotal")}
              />
              {errors.capacidadeTotal && (
                <p className="text-sm text-destructive">{errors.capacidadeTotal.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" render={<Link href="/saloes" />}>
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
