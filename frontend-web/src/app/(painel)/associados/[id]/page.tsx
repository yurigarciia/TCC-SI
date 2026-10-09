"use client";

import { Building2, MapPin, Pencil, Phone, Tag, User, Users } from "lucide-react";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
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
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { StatusAssociadoBadge } from "@/features/associados/status-badge";
import {
  useAprovarCadastro,
  useAssociado,
  useCategoriasSocio,
  useRejeitarCadastro,
} from "@/features/associados/use-associados";
import { MensalidadesCard } from "@/features/mensalidades/mensalidades-card";
import { TableEmptyRow } from "@/components/table-empty-row";
import { formatarCep, formatarData, formatarTelefone, pareceEmail } from "@/lib/format";

// Tela só de leitura, sem nenhum campo editável — o que vem da listagem cai aqui por padrão.
// "Editar associado" leva pra /associados/[id]/editar, que concentra os formulários. Separado de
// propósito: facilita liberar "ver" sem liberar "editar" quando o RBAC ganhar granularidade por
// ação (hoje é só administrador/associado — ver CLAUDE.md).
function Campo({
  icone: Icone,
  rotulo,
  valor,
}: {
  icone: React.ComponentType<{ "aria-hidden"?: boolean; className?: string }>;
  rotulo: string;
  valor: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icone aria-hidden className="size-3.5" />
        {rotulo}
      </p>
      <p className="text-sm font-medium text-foreground">{valor}</p>
    </div>
  );
}

export default function AssociadoDetalhePage() {
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

  return <AssociadoDetalheConteudo associadoId={params.id} data={data} />;
}

function AssociadoDetalheConteudo({
  associadoId,
  data,
}: {
  associadoId: string;
  data: NonNullable<ReturnType<typeof useAssociado>["data"]>;
}) {
  const { associado, dependentes, endereco } = data;
  const aprovar = useAprovarCadastro(associadoId);
  const rejeitar = useRejeitarCadastro(associadoId);
  const [categoriaAprovacao, setCategoriaAprovacao] = useState<string | undefined>(undefined);
  const { data: resultadoCategorias } = useCategoriasSocio(1, undefined, 100);
  const categorias = resultadoCategorias?.itens;

  const categoriaAtual = categorias?.find((c) => c.id === associado.categoriaSocioId)?.nome;
  const contato = pareceEmail(associado.contato)
    ? associado.contato
    : formatarTelefone(associado.contato);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Breadcrumb items={[{ label: "Associados", href: "/associados" }, { label: associado.nome }]} />
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            <Users aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />
            {associado.nome}
          </h1>
          <p className="text-muted-foreground">CPF {associado.cpf}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusAssociadoBadge status={associado.status} />
          <Button render={<Link href={`/associados/${associadoId}/editar`} />}>
            <Pencil aria-hidden="true" />
            Editar associado
          </Button>
        </div>
      </div>

      {associado.status === "pendente_validacao" && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex flex-wrap items-end justify-between gap-3 pt-6">
            <div className="space-y-3">
              <p className="text-sm text-foreground">
                Este cadastro está pendente de validação (auto-cadastro pelo app) — auto-cadastro
                não coleta categoria de sócio, então é definida aqui ou depois na edição.
              </p>
              <div className="w-full max-w-xs space-y-2">
                <Label htmlFor="categoriaAprovacao">Categoria de sócio (opcional)</Label>
                <Select
                  value={categoriaAprovacao}
                  onValueChange={(valor) => setCategoriaAprovacao(valor ?? undefined)}
                >
                  <SelectTrigger id="categoriaAprovacao" className="w-full">
                    <SelectValue placeholder="Selecionar categoria">
                      {(valor: string | undefined) =>
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
              </div>
            </div>
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
                  aprovar.mutate(categoriaAprovacao, {
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Campo icone={User} rotulo="Nome completo" valor={associado.nome} />
              </div>
              <Campo icone={Phone} rotulo="Contato" valor={contato} />
              <Campo
                icone={Building2}
                rotulo="Vínculo institucional"
                valor={associado.vinculoInstitucional ?? "—"}
              />
              <Campo
                icone={Tag}
                rotulo="Categoria de sócio"
                valor={categoriaAtual ?? "Sem categoria"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent>
            {endereco ? (
              <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                <Campo icone={MapPin} rotulo="CEP" valor={formatarCep(endereco.cep)} />
                <Campo icone={MapPin} rotulo="Número" valor={endereco.numero} />
                <div className="sm:col-span-2">
                  <Campo icone={MapPin} rotulo="Logradouro" valor={endereco.logradouro} />
                </div>
                <Campo icone={MapPin} rotulo="Complemento" valor={endereco.complemento ?? "—"} />
                <Campo icone={MapPin} rotulo="Bairro" valor={endereco.bairro} />
                <Campo icone={MapPin} rotulo="Cidade" valor={endereco.cidade} />
                <Campo icone={MapPin} rotulo="UF" valor={endereco.uf} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Endereço não cadastrado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dependentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
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

      <p className="text-xs text-muted-foreground">
        Cadastrado em {formatarData(associado.criadoEm)} · Atualizado em{" "}
        {formatarData(associado.atualizadoEm)}
      </p>
    </div>
  );
}
