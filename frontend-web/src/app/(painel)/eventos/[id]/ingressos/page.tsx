"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useEvento } from "@/features/eventos/use-eventos";
import { QrCodeScanner } from "@/features/ingressos/qr-code-scanner";
import { rotuloPerfilComprador, StatusIngressoBadge } from "@/features/ingressos/status-badge";
import { useEmitirIngresso, useIngressosEvento, useRegistrarCheckin } from "@/features/ingressos/use-ingressos";
import { formatarDataHora, formatarMoeda } from "@/lib/format";
import { TableEmptyRow } from "@/components/table-empty-row";
import { Pagination } from "@/components/pagination";

const emitirSchema = z.object({
  nomeComprador: z.string().min(2, "Informe o nome do comprador."),
  perfilComprador: z.enum(["socio", "nao_socio", "crianca"]),
  formaPagamento: z.enum(["presencial", "online"]),
});

type EmitirFormValues = z.infer<typeof emitirSchema>;

export default function IngressosEventoPage() {
  const params = useParams<{ id: string }>();
  const { data: evento, isLoading } = useEvento(params.id);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
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

  const { data: resultado, isLoading, isError } = useIngressosEvento(
    eventoId,
    pagina,
    filtroNome || undefined,
  );
  const ingressos = resultado?.itens;
  const emitir = useEmitirIngresso(eventoId);
  const checkin = useRegistrarCheckin(eventoId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmitirFormValues>({
    resolver: zodResolver(emitirSchema),
    defaultValues: { perfilComprador: "socio", formaPagamento: "presencial" },
  });

  const onSubmitEmitir = handleSubmit((dados) => {
    emitir.mutate(dados, {
      onSuccess: (ingresso) => {
        toast.success(`Ingresso emitido — ${formatarMoeda(ingresso.preco)}.`);
        reset({ nomeComprador: "", perfilComprador: "socio", formaPagamento: "presencial" });
      },
      onError: (erro) => toast.error(erro.message || "Não foi possível emitir o ingresso."),
    });
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
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <Link href={`/eventos/${eventoId}`} className="text-sm text-muted-foreground hover:underline">
          ← {nomeEvento}
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Emissão e check-in de ingressos
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vender ingresso presencial</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitEmitir} className="grid gap-4 sm:grid-cols-3" noValidate>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nomeComprador">Nome do comprador</Label>
              <Input
                id="nomeComprador"
                aria-invalid={!!errors.nomeComprador}
                {...register("nomeComprador")}
              />
              {errors.nomeComprador && (
                <p className="text-sm text-destructive">{errors.nomeComprador.message}</p>
              )}
            </div>
            <div className="space-y-2">
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
              <Label htmlFor="formaPagamento">Forma de pagamento</Label>
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
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" disabled={emitir.isPending}>
                {emitir.isPending ? "Emitindo…" : "Emitir ingresso"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Check-in por código (QR)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

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
            <div className="overflow-x-auto rounded-lg border">
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
    </div>
  );
}
