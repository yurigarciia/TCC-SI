"use client";

import { Loader2, Save } from "lucide-react";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-client";
import type { Mensalidade } from "./types";
import { useLancarPagamentoPresencial } from "./use-mensalidades";

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function LancarPagamentoDialog({
  mensalidade,
  onFechar,
}: {
  mensalidade: Mensalidade | null;
  onFechar: () => void;
}) {
  const lancarPagamento = useLancarPagamentoPresencial(mensalidade?.associadoId);
  const [valorPago, setValorPago] = useState("");
  const [dataPagamento, setDataPagamento] = useState(hoje());

  useEffect(() => {
    if (mensalidade) {
      setValorPago(mensalidade.valor.toFixed(2));
      setDataPagamento(hoje());
    }
  }, [mensalidade]);

  function confirmar() {
    if (!mensalidade) return;
    const valor = Number(valorPago.replace(",", "."));
    if (!valor || valor <= 0) {
      toast.error("Informe um valor pago válido.");
      return;
    }

    lancarPagamento.mutate(
      { mensalidadeId: mensalidade.id, valorPago: valor, dataPagamento },
      {
        onSuccess: () => {
          toast.success("Pagamento lançado.");
          onFechar();
        },
        onError: (erro) => {
          toast.error(
            erro instanceof ApiError ? erro.message : "Não foi possível lançar o pagamento.",
          );
        },
      },
    );
  }

  return (
    <Dialog open={!!mensalidade} onOpenChange={(aberto) => !aberto && onFechar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Lançar pagamento</DialogTitle>
        </DialogHeader>

        {mensalidade && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Competência <span className="font-medium text-foreground">{mensalidade.competencia}</span>
            </p>

            <div className="space-y-2">
              <Label htmlFor="valor-pago">Valor pago</Label>
              <Input
                id="valor-pago"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={valorPago}
                onChange={(evento) => setValorPago(evento.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-pagamento">Data do pagamento</Label>
              <Input
                id="data-pagamento"
                type="date"
                value={dataPagamento}
                onChange={(evento) => setDataPagamento(evento.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button disabled={lancarPagamento.isPending} onClick={confirmar}>
            {lancarPagamento.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save aria-hidden="true" />
            )}
            {lancarPagamento.isPending ? "Salvando…" : "Confirmar pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
