"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvento } from "@/features/eventos/use-eventos";
import { ESTILO_POR_STATUS, MAPA_MESAS_LEGENDA, MapaMesasCanvas } from "@/features/reservas/mapa-mesas-canvas";
import type { MesaNoMapa } from "@/features/reservas/types";
import {
  useCancelarReserva,
  useConfirmarReserva,
  useMapaMesas,
  useSolicitarReservaMediada,
  useTransferirMesa,
  useTransferirTitular,
} from "@/features/reservas/use-reservas";
import { formatarMoeda } from "@/lib/format";

export default function MapaMesasPage() {
  const params = useParams<{ id: string }>();
  const { data: evento, isLoading: carregandoEvento } = useEvento(params.id);
  const { data: mesas, isLoading: carregandoMapa, isError } = useMapaMesas(params.id);

  if (carregandoEvento || carregandoMapa) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  if (isError || !mesas || !evento) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar o mapa de mesas deste evento.
      </p>
    );
  }

  return <MapaMesasConteudo eventoId={params.id} nomeEvento={evento.evento.nome} mesas={mesas} />;
}

function MapaMesasConteudo({
  eventoId,
  nomeEvento,
  mesas,
}: {
  eventoId: string;
  nomeEvento: string;
  mesas: MesaNoMapa[];
}) {
  const [mesaSelecionada, setMesaSelecionada] = useState<MesaNoMapa | null>(null);

  const mesasLivres = mesas.filter((m) => m.status === "livre");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href={`/eventos/${eventoId}`} className="text-sm text-muted-foreground hover:underline">
          ← {nomeEvento}
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Mapa de mesas</h1>
        <p className="text-muted-foreground">
          Clique numa mesa para registrar, confirmar, cancelar ou transferir uma reserva.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {MAPA_MESAS_LEGENDA.map(({ status, rotulo }) => (
          <span key={status} className="flex items-center gap-1.5">
            <span
              className={`inline-block size-3 rounded-full border-2 ${ESTILO_POR_STATUS[status].split(" ").slice(0, 2).join(" ")}`}
            />
            {rotulo}
          </span>
        ))}
      </div>

      <MapaMesasCanvas mesas={mesas} onMesaClick={setMesaSelecionada} />

      <Dialog open={!!mesaSelecionada} onOpenChange={(aberto) => !aberto && setMesaSelecionada(null)}>
        <DialogContent className="sm:max-w-md">
          {mesaSelecionada && (
            <PainelAcoesMesa
              eventoId={eventoId}
              mesa={mesaSelecionada}
              mesasLivres={mesasLivres}
              onFechar={() => setMesaSelecionada(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PainelAcoesMesa({
  eventoId,
  mesa,
  mesasLivres,
  onFechar,
}: {
  eventoId: string;
  mesa: MesaNoMapa;
  mesasLivres: MesaNoMapa[];
  onFechar: () => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Mesa {mesa.numero}</DialogTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge
            variant={
              mesa.status === "reservada"
                ? "destructive"
                : mesa.status === "pendente"
                  ? "warning"
                  : mesa.status === "bloqueada"
                    ? "secondary"
                    : "outline"
            }
          >
            {mesa.status}
          </Badge>
          <span>
            {mesa.capacidade} lugares · {formatarMoeda(mesa.preco)}
          </span>
        </div>
      </DialogHeader>

      {mesa.status === "livre" && (
        <FormReservarMesa eventoId={eventoId} mesa={mesa} onSucesso={onFechar} />
      )}

      {(mesa.status === "pendente" || mesa.status === "reservada") && mesa.reservaId && (
        <AcoesReservaExistente
          eventoId={eventoId}
          mesa={mesa}
          mesasLivres={mesasLivres}
          onSucesso={onFechar}
        />
      )}

      {mesa.status === "bloqueada" && (
        <p className="text-sm text-muted-foreground">
          Esta mesa está bloqueada para este evento — ajuste a configuração de mesas na página do
          evento se precisar liberá-la.
        </p>
      )}
    </>
  );
}

const reservaSchema = z.object({
  nomeTitular: z.string().min(2, "Informe o nome do titular."),
  formaPagamento: z.enum(["presencial", "online"]),
});

type ReservaFormValues = z.infer<typeof reservaSchema>;

function FormReservarMesa({
  eventoId,
  mesa,
  onSucesso,
}: {
  eventoId: string;
  mesa: MesaNoMapa;
  onSucesso: () => void;
}) {
  const solicitar = useSolicitarReservaMediada(eventoId, mesa.mesaId);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservaFormValues>({
    resolver: zodResolver(reservaSchema),
    defaultValues: { formaPagamento: "presencial" },
  });

  const onSubmit = handleSubmit((dados) => {
    solicitar.mutate(dados, {
      onSuccess: () => {
        toast.success("Reserva registrada.");
        onSucesso();
      },
      onError: () => toast.error("Não foi possível registrar a reserva — a mesa pode ter acabado de ser ocupada."),
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="nomeTitular">Nome do titular</Label>
        <Input id="nomeTitular" aria-invalid={!!errors.nomeTitular} {...register("nomeTitular")} />
        {errors.nomeTitular && (
          <p className="text-sm text-destructive">{errors.nomeTitular.message}</p>
        )}
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
                  {(valor: ReservaFormValues["formaPagamento"]) =>
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
      <div className="flex justify-end">
        <Button type="submit" disabled={solicitar.isPending}>
          {solicitar.isPending ? "Registrando…" : "Registrar reserva"}
        </Button>
      </div>
    </form>
  );
}

function AcoesReservaExistente({
  eventoId,
  mesa,
  mesasLivres,
  onSucesso,
}: {
  eventoId: string;
  mesa: MesaNoMapa;
  mesasLivres: MesaNoMapa[];
  onSucesso: () => void;
}) {
  const confirmar = useConfirmarReserva(eventoId);
  const cancelar = useCancelarReserva(eventoId);
  const transferirMesa = useTransferirMesa(eventoId);
  const transferirTitular = useTransferirTitular(eventoId);

  const [novoTitular, setNovoTitular] = useState("");
  const [novaMesaId, setNovaMesaId] = useState<string | undefined>(undefined);

  const reservaId = mesa.reservaId!;

  return (
    <div className="space-y-4">
      <div className="text-sm">
        <p>
          <span className="text-muted-foreground">Titular: </span>
          {mesa.nomeTitular ?? "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Canal: </span>
          {mesa.canal === "app" ? "App do associado" : "Mediado pela diretoria"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {mesa.status === "pendente" && (
          <Button
            onClick={() =>
              confirmar.mutate(reservaId, {
                onSuccess: () => {
                  toast.success("Reserva confirmada.");
                  onSucesso();
                },
                onError: () => toast.error("Não foi possível confirmar a reserva."),
              })
            }
            disabled={confirmar.isPending}
          >
            Confirmar
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="outline" />}>Cancelar reserva</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar esta reserva?</AlertDialogTitle>
              <AlertDialogDescription>
                A mesa {mesa.numero} volta a ficar livre para novas reservas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  cancelar.mutate(reservaId, {
                    onSuccess: () => {
                      toast.success("Reserva cancelada.");
                      onSucesso();
                    },
                    onError: () => toast.error("Não foi possível cancelar a reserva."),
                  })
                }
              >
                Confirmar cancelamento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-2 border-t pt-4">
        <Label htmlFor="novo-titular">Transferir titularidade</Label>
        <div className="flex gap-2">
          <Input
            id="novo-titular"
            placeholder="Novo nome do titular"
            value={novoTitular}
            onChange={(evento) => setNovoTitular(evento.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={novoTitular.trim().length < 2 || transferirTitular.isPending}
            onClick={() =>
              transferirTitular.mutate(
                { reservaId, novoTitular: novoTitular.trim() },
                {
                  onSuccess: () => {
                    toast.success("Titular transferido.");
                    onSucesso();
                  },
                  onError: () => toast.error("Não foi possível transferir o titular."),
                },
              )
            }
          >
            Transferir
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <Label htmlFor="nova-mesa">Transferir para outra mesa</Label>
        {mesasLivres.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma mesa livre disponível agora.</p>
        ) : (
          <div className="flex gap-2">
            <Select value={novaMesaId} onValueChange={(valor) => setNovaMesaId(valor ?? undefined)}>
              <SelectTrigger id="nova-mesa" className="w-full">
                <SelectValue placeholder="Escolha a mesa de destino">
                  {(valor: string | null) => {
                    const mesa = mesasLivres.find((m) => m.mesaId === valor);
                    return mesa ? `Mesa ${mesa.numero}` : "Escolha a mesa de destino";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {mesasLivres.map((m) => (
                  <SelectItem key={m.mesaId} value={m.mesaId}>
                    Mesa {m.numero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              disabled={!novaMesaId || transferirMesa.isPending}
              onClick={() =>
                novaMesaId &&
                transferirMesa.mutate(
                  { reservaId, novaMesaId },
                  {
                    onSuccess: () => {
                      toast.success("Mesa transferida.");
                      onSucesso();
                    },
                    onError: () =>
                      toast.error("Não foi possível transferir — a mesa de destino pode ter acabado de ser ocupada."),
                  },
                )
              }
            >
              Transferir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
