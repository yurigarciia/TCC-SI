"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCategoriasSocio, useCadastrarAssociadoMediado } from "@/features/associados/use-associados";
import { ApiError } from "@/lib/api-client";
import { formatarCpf, formatarTelefone, pareceEmail } from "@/lib/format";

const dependenteSchema = z.object({
  nome: z.string().min(2, "Informe o nome do dependente."),
  dataNascimento: z.string().min(1, "Informe a data de nascimento."),
});

const formSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo."),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos."),
  contato: z.string().min(8, "Informe um telefone ou e-mail de contato."),
  vinculoInstitucional: z.string().optional(),
  categoriaSocioId: z.string().optional(),
  dependentes: z.array(dependenteSchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function NovoAssociadoPage() {
  const router = useRouter();
  // Dropdown de seleção — busca uma página grande o bastante para cobrir todas as categorias
  // cadastradas sem precisar de paginação aqui (número de categorias tende a ser pequeno).
  const { data: resultadoCategorias } = useCategoriasSocio(1, undefined, 100);
  const categorias = resultadoCategorias?.itens;
  const cadastrar = useCadastrarAssociadoMediado();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { dependentes: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "dependentes" });

  const onSubmit = handleSubmit((dados) => {
    cadastrar.mutate(
      {
        ...dados,
        vinculoInstitucional: dados.vinculoInstitucional || undefined,
        categoriaSocioId: dados.categoriaSocioId || undefined,
        dependentes: dados.dependentes.length > 0 ? dados.dependentes : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Associado cadastrado com sucesso.");
          router.push("/associados");
        },
        onError: (erro) => {
          toast.error(
            erro instanceof ApiError && erro.status === 409
              ? "Já existe um associado com esse CPF."
              : "Não foi possível cadastrar o associado.",
          );
        },
      },
    );
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-1">
        <Breadcrumb items={[{ label: "Associados", href: "/associados" }, { label: "Novo associado" }]} />
        <h1 className="font-heading text-2xl font-semibold text-foreground">Novo associado</h1>
        <p className="text-muted-foreground">
          Cadastro mediado pela diretoria — o associado entra como Ativo imediatamente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do associado</CardTitle>
          <CardDescription>Campos com rótulo sempre visível.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  placeholder="Ex.: João da Silva"
                  aria-invalid={!!errors.nome}
                  {...register("nome")}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Controller
                  control={control}
                  name="cpf"
                  render={({ field }) => (
                    <Input
                      id="cpf"
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      aria-invalid={!!errors.cpf}
                      value={formatarCpf(field.value ?? "")}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contato">Contato (telefone ou e-mail)</Label>
                <Controller
                  control={control}
                  name="contato"
                  render={({ field }) => (
                    <Input
                      id="contato"
                      placeholder="Ex.: (55) 99999-0000"
                      aria-invalid={!!errors.contato}
                      value={
                        pareceEmail(field.value ?? "")
                          ? field.value
                          : formatarTelefone(field.value ?? "")
                      }
                      onChange={(e) => {
                        const bruto = e.target.value;
                        field.onChange(
                          pareceEmail(bruto) ? bruto : bruto.replace(/\D/g, "").slice(0, 11),
                        );
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                {errors.contato && (
                  <p className="text-sm text-destructive">{errors.contato.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vinculoInstitucional">Vínculo institucional (opcional)</Label>
                <Input
                  id="vinculoInstitucional"
                  placeholder="Ex.: Piquete Laço Firme"
                  {...register("vinculoInstitucional")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="categoriaSocioId">Categoria de sócio</Label>
                  <Link
                    href="/associados/categorias/novo"
                    target="_blank"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Nova categoria ↗
                  </Link>
                </div>
                <Controller
                  control={control}
                  name="categoriaSocioId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="categoriaSocioId" className="w-full">
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
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Dependentes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ nome: "", dataNascimento: "" })}
                >
                  Adicionar dependente
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum dependente adicionado.</p>
              )}

              {fields.map((campo, indice) => (
                <div key={campo.id} className="flex items-end gap-3 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`dependentes.${indice}.nome`}>Nome</Label>
                    <Input
                      id={`dependentes.${indice}.nome`}
                      placeholder="Ex.: Maria da Silva"
                      {...register(`dependentes.${indice}.nome` as const)}
                    />
                    {errors.dependentes?.[indice]?.nome && (
                      <p className="text-sm text-destructive">
                        {errors.dependentes[indice]?.nome?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`dependentes.${indice}.dataNascimento`}>
                      Data de nascimento
                    </Label>
                    <Input
                      id={`dependentes.${indice}.dataNascimento`}
                      type="date"
                      {...register(`dependentes.${indice}.dataNascimento` as const)}
                    />
                    {errors.dependentes?.[indice]?.dataNascimento && (
                      <p className="text-sm text-destructive">
                        {errors.dependentes[indice]?.dataNascimento?.message}
                      </p>
                    )}
                  </div>
                  <Button type="button" variant="ghost" onClick={() => remove(indice)}>
                    Remover
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" render={<Link href="/associados" />}>
                Cancelar
              </Button>
              <Button type="submit" disabled={cadastrar.isPending}>
                {cadastrar.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
