"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarData, formatarMoeda } from "@/lib/format";
import { TableEmptyRow } from "@/components/table-empty-row";
import { StatusMensalidadeBadge } from "./status-badge";
import { useHistoricoMensalidades, useLancarPagamentoPresencial } from "./use-mensalidades";

// RF06/RF05 — histórico de mensalidades do associado, com lançamento de pagamento presencial
// (canal mediado, mesmo padrão dos outros módulos). Só faz sentido para associados Ativos: a
// geração de cobrança (T-BE-005) só cria mensalidade para quem está com status ativo.
export function MensalidadesCard({ associadoId }: { associadoId: string }) {
  const { data: mensalidades, isLoading, isError } = useHistoricoMensalidades(associadoId);
  const lancarPagamento = useLancarPagamentoPresencial(associadoId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mensalidades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <Skeleton className="h-10 w-full" />}

        {isError && (
          <p className="text-sm text-destructive">Não foi possível carregar as mensalidades.</p>
        )}

        {mensalidades && (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competência</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mensalidades.length === 0 ? (
                  <TableEmptyRow colSpan={5}>
                    Nenhuma mensalidade gerada ainda para este associado.
                  </TableEmptyRow>
                ) : (
                  mensalidades.map((mensalidade) => (
                    <TableRow key={mensalidade.id}>
                      <TableCell>{mensalidade.competencia}</TableCell>
                      <TableCell>{formatarMoeda(mensalidade.valor)}</TableCell>
                      <TableCell>{formatarData(mensalidade.vencimento)}</TableCell>
                      <TableCell>
                        <StatusMensalidadeBadge status={mensalidade.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {mensalidade.status !== "paga" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={lancarPagamento.isPending}
                            onClick={() =>
                              lancarPagamento.mutate(mensalidade.id, {
                                onSuccess: () => toast.success("Pagamento lançado."),
                                onError: () =>
                                  toast.error("Não foi possível lançar o pagamento."),
                              })
                            }
                          >
                            Lançar pagamento
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
