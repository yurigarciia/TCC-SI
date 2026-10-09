"use client";

import { Building2, Calendar, Phone, Save, Tag, User, UserPlus, Users } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputComIcone } from "@/components/input-com-icone";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CamposEndereco, enderecoSchema } from "@/features/associados/campos-endereco";
import {
  useAdicionarDependente,
  useAssociado,
  useAtualizarAssociado,
  useCategoriasSocio,
} from "@/features/associados/use-associados";
import { formatarTelefone, pareceEmail } from "@/lib/format";

const ID_FORM_DADOS = "form-dados-associado";

const dadosSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo."),
  contato: z.string().min(8, "Informe um contato válido."),
  vinculoInstitucional: z.string().optional(),
  categoriaSocioId: z.string().optional(),
  endereco: enderecoSchema,
});

type DadosFormValues = z.infer<typeof dadosSchema>;

const dependenteSchema = z.object({
  nome: z.string().min(2, "Informe o nome do dependente."),
  dataNascimento: z.string().min(1, "Informe a data de nascimento."),
});

type DependenteFormValues = z.infer<typeof dependenteSchema>;

export default function EditarAssociadoPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useAssociado(params.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar este associado. Ele pode não existir mais.
      </p>
    );
  }

  return <EditarAssociadoConteudo associadoId={params.id} data={data} />;
}

function EditarAssociadoConteudo({
  associadoId,
  data,
}: {
  associadoId: string;
  data: NonNullable<ReturnType<typeof useAssociado>["data"]>;
}) {
  const { associado, dependentes } = data;
  const atualizar = useAtualizarAssociado(associadoId);
  const adicionarDependente = useAdicionarDependente(associadoId);
  const [adicionandoDependente, setAdicionandoDependente] = useState(false);
  // Dropdown de seleção — busca uma página grande o bastante para cobrir todas as categorias
  // cadastradas sem precisar de paginação aqui (mesmo raciocínio de associados/novo).
  const { data: resultadoCategorias } = useCategoriasSocio(1, undefined, 100);
  const categorias = resultadoCategorias?.itens;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<DadosFormValues>({
    resolver: zodResolver(dadosSchema),
    values: {
      nome: associado.nome,
      contato: associado.contato,
      vinculoInstitucional: associado.vinculoInstitucional ?? "",
      categoriaSocioId: associado.categoriaSocioId ?? "",
      endereco: {
        cep: data.endereco?.cep ?? "",
        logradouro: data.endereco?.logradouro ?? "",
        numero: data.endereco?.numero ?? "",
        complemento: data.endereco?.complemento ?? "",
        bairro: data.endereco?.bairro ?? "",
        cidade: data.endereco?.cidade ?? "",
        uf: data.endereco?.uf ?? "",
      },
    },
  });

  const onSubmitDados = handleSubmit((dados) => {
    atualizar.mutate(
      {
        ...dados,
        vinculoInstitucional: dados.vinculoInstitucional || null,
        categoriaSocioId: dados.categoriaSocioId || null,
        endereco: { ...dados.endereco, complemento: dados.endereco.complemento || undefined },
      },
      {
        onSuccess: () => {
          toast.success("Dados atualizados.");
          reset(dados);
        },
        onError: () => toast.error("Não foi possível salvar as alterações."),
      },
    );
  });

  const {
    register: registerDependente,
    handleSubmit: handleSubmitDependente,
    reset: resetDependente,
    formState: { errors: errosDependente },
  } = useForm<DependenteFormValues>({ resolver: zodResolver(dependenteSchema) });

  const onSubmitDependente = handleSubmitDependente((dados) => {
    adicionarDependente.mutate(dados, {
      onSuccess: () => {
        toast.success("Dependente adicionado.");
        resetDependente({ nome: "", dataNascimento: "" });
        setAdicionandoDependente(false);
      },
      onError: () => toast.error("Não foi possível adicionar o dependente."),
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Breadcrumb
            items={[
              { label: "Associados", href: "/associados" },
              { label: associado.nome, href: `/associados/${associadoId}` },
              { label: "Editar" },
            ]}
          />
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            <Users aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />
            Editar {associado.nome}
          </h1>
        </div>
        <Button type="submit" form={ID_FORM_DADOS} disabled={!isDirty || atualizar.isPending}>
          <Save aria-hidden="true" />
          {atualizar.isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>

      <form id={ID_FORM_DADOS} onSubmit={onSubmitDados} className="space-y-6" noValidate>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="nome">Nome completo</Label>
                <InputComIcone
                  icon={User}
                  id="nome"
                  placeholder="Ex.: João da Silva"
                  aria-invalid={!!errors.nome}
                  {...register("nome")}
                />
                {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contato">Contato</Label>
                <Controller
                  control={control}
                  name="contato"
                  render={({ field }) => (
                    <InputComIcone
                      icon={Phone}
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

              <div className="space-y-1.5">
                <Label htmlFor="vinculoInstitucional">Vínculo institucional</Label>
                <InputComIcone
                  icon={Building2}
                  id="vinculoInstitucional"
                  placeholder="Ex.: Piquete Laço Firme"
                  {...register("vinculoInstitucional")}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="categoriaSocioId">Categoria de sócio</Label>
                <Controller
                  control={control}
                  name="categoriaSocioId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="categoriaSocioId" className="w-full">
                        <Tag aria-hidden="true" className="size-4 text-muted-foreground" />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent>
            <CamposEndereco control={control} errors={errors} setValue={setValue} />
          </CardContent>
        </Card>
      </div>
      </form>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dependentes</CardTitle>
          {!adicionandoDependente && (
            <Button variant="outline" size="sm" onClick={() => setAdicionandoDependente(true)}>
              <UserPlus aria-hidden="true" />
              Adicionar dependente
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {adicionandoDependente && (
            <form
              onSubmit={onSubmitDependente}
              className="flex flex-wrap items-end gap-3 rounded-lg border p-3"
              noValidate
            >
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="dependente-nome">Nome</Label>
                <InputComIcone
                  icon={User}
                  id="dependente-nome"
                  placeholder="Ex.: Maria da Silva"
                  {...registerDependente("nome")}
                />
                {errosDependente.nome && (
                  <p className="text-sm text-destructive">{errosDependente.nome.message}</p>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="dependente-data">Data de nascimento</Label>
                <InputComIcone
                  icon={Calendar}
                  id="dependente-data"
                  type="date"
                  {...registerDependente("dataNascimento")}
                />
                {errosDependente.dataNascimento && (
                  <p className="text-sm text-destructive">
                    {errosDependente.dataNascimento.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={adicionarDependente.isPending}>
                Salvar
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAdicionandoDependente(false)}
              >
                Cancelar
              </Button>
            </form>
          )}

          {dependentes.length === 0 && !adicionandoDependente && (
            <p className="text-sm text-muted-foreground">Nenhum dependente cadastrado.</p>
          )}
          {dependentes.length > 0 && (
            <ul className="space-y-2">
              {dependentes.map((dependente) => (
                <li
                  key={dependente.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{dependente.nome}</span>
                  <span className="text-muted-foreground">{dependente.dataNascimento}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
