"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { StatusAssociadoBadge } from "@/features/associados/status-badge";
import {
  useAdicionarDependente,
  useAprovarCadastro,
  useAssociado,
  useAtualizarAssociado,
  useRejeitarCadastro,
} from "@/features/associados/use-associados";
import { MensalidadesCard } from "@/features/mensalidades/mensalidades-card";
import { TableEmptyRow } from "@/components/table-empty-row";
import { formatarTelefone, pareceEmail } from "@/lib/format";

const dadosSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo."),
  contato: z.string().min(8, "Informe um contato válido."),
  vinculoInstitucional: z.string().optional(),
});

type DadosFormValues = z.infer<typeof dadosSchema>;

const dependenteSchema = z.object({
  nome: z.string().min(2, "Informe o nome do dependente."),
  dataNascimento: z.string().min(1, "Informe a data de nascimento."),
});

type DependenteFormValues = z.infer<typeof dependenteSchema>;

export default function AssociadoDetalhePage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useAssociado(params.id);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
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

  return <AssociadoDetalheConteudo associadoId={params.id} data={data} />;
}

function AssociadoDetalheConteudo({
  associadoId,
  data,
}: {
  associadoId: string;
  data: NonNullable<ReturnType<typeof useAssociado>["data"]>;
}) {
  const { associado, dependentes } = data;
  const atualizar = useAtualizarAssociado(associadoId);
  const aprovar = useAprovarCadastro(associadoId);
  const rejeitar = useRejeitarCadastro(associadoId);
  const adicionarDependente = useAdicionarDependente(associadoId);
  const [adicionandoDependente, setAdicionandoDependente] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DadosFormValues>({
    resolver: zodResolver(dadosSchema),
    values: {
      nome: associado.nome,
      contato: associado.contato,
      vinculoInstitucional: associado.vinculoInstitucional ?? "",
    },
  });

  const onSubmitDados = handleSubmit((dados) => {
    atualizar.mutate(
      { ...dados, vinculoInstitucional: dados.vinculoInstitucional || null },
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
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {associado.nome}
          </h1>
          <p className="text-muted-foreground">CPF {associado.cpf}</p>
        </div>
        <StatusAssociadoBadge status={associado.status} />
      </div>

      {associado.status === "pendente_validacao" && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm text-foreground">
              Este cadastro está pendente de validação (auto-cadastro pelo app).
            </p>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="outline" />}>
                  Rejeitar
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Rejeitar este cadastro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O associado não será notificado automaticamente — combine o retorno por fora
                      (WhatsApp/telefone) se necessário.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        rejeitar.mutate(undefined, {
                          onSuccess: () => toast.success("Cadastro rejeitado."),
                          onError: () => toast.error("Não foi possível rejeitar o cadastro."),
                        })
                      }
                    >
                      Confirmar rejeição
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                onClick={() =>
                  aprovar.mutate(undefined, {
                    onSuccess: () => toast.success("Cadastro aprovado — associado está Ativo."),
                    onError: () => toast.error("Não foi possível aprovar o cadastro."),
                  })
                }
                disabled={aprovar.isPending}
              >
                Aprovar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados cadastrais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitDados} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                placeholder="Ex.: João da Silva"
                aria-invalid={!!errors.nome}
                {...register("nome")}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contato">Contato</Label>
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
              <Label htmlFor="vinculoInstitucional">Vínculo institucional</Label>
              <Input
                id="vinculoInstitucional"
                placeholder="Ex.: Piquete Laço Firme"
                {...register("vinculoInstitucional")}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={!isDirty || atualizar.isPending}>
                {atualizar.isPending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dependentes</CardTitle>
          {!adicionandoDependente && (
            <Button variant="outline" size="sm" onClick={() => setAdicionandoDependente(true)}>
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
              <div className="flex-1 space-y-2">
                <Label htmlFor="dependente-nome">Nome</Label>
                <Input
                  id="dependente-nome"
                  placeholder="Ex.: Maria da Silva"
                  {...registerDependente("nome")}
                />
                {errosDependente.nome && (
                  <p className="text-sm text-destructive">{errosDependente.nome.message}</p>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="dependente-data">Data de nascimento</Label>
                <Input id="dependente-data" type="date" {...registerDependente("dataNascimento")} />
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

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data de nascimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dependentes.length === 0 ? (
                  <TableEmptyRow colSpan={2}>Nenhum dependente cadastrado.</TableEmptyRow>
                ) : (
                  dependentes.map((dependente) => (
                    <TableRow key={dependente.id}>
                      <TableCell>{dependente.nome}</TableCell>
                      <TableCell>{dependente.dataNascimento}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {associado.status === "ativo" && <MensalidadesCard associadoId={associadoId} />}
    </div>
  );
}
