"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGerarCobrancasDoMes,
  useInadimplentes,
  useProcessarInadimplencia,
} from "@/features/mensalidades/use-mensalidades";
import { formatarMoeda } from "@/lib/format";
import { TableEmptyRow } from "@/components/table-empty-row";

export default function MensalidadesPage() {
  const { data: inadimplentes, isLoading, isError } = useInadimplentes();
  const gerarCobrancas = useGerarCobrancasDoMes();
  const processarInadimplencia = useProcessarInadimplencia();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Mensalidades e inadimplência
          </h1>
          <p className="text-muted-foreground">
            Relatório sempre disponível — não precisa ser gerado manualmente. O histórico de
            pagamentos de cada associado fica na tela dele.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={gerarCobrancas.isPending}
            onClick={() =>
              gerarCobrancas.mutate(undefined, {
                onSuccess: (geradas) =>
                  toast.success(
                    geradas.length > 0
                      ? `${geradas.length} cobrança(s) gerada(s) para o mês.`
                      : "Nenhuma cobrança nova — já geradas para este mês.",
                  ),
                onError: () => toast.error("Não foi possível gerar as cobranças do mês."),
              })
            }
          >
            Gerar cobranças do mês
          </Button>
          <Button
            variant="outline"
            disabled={processarInadimplencia.isPending}
            onClick={() =>
              processarInadimplencia.mutate(undefined, {
                onSuccess: (processadas) =>
                  toast.success(
                    processadas.length > 0
                      ? `${processadas.length} mensalidade(s) marcada(s) como inadimplente.`
                      : "Nenhuma mensalidade nova em atraso.",
                  ),
                onError: () => toast.error("Não foi possível processar a inadimplência."),
              })
            }
          >
            Processar inadimplência
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Relatório de inadimplência
        </h2>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Não foi possível carregar o relatório. Tente novamente em instantes.
          </p>
        )}

        {inadimplentes && (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Associado</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead>Valor devido</TableHead>
                  <TableHead>Dias em atraso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inadimplentes.length === 0 ? (
                  <TableEmptyRow colSpan={4}>
                    Nenhum associado inadimplente no momento.
                  </TableEmptyRow>
                ) : (
                  inadimplentes.map((item, indice) => (
                    <TableRow
                      key={item.mensalidade.id}
                      className={indice % 2 === 1 ? "bg-muted/50" : undefined}
                    >
                      <TableCell className="font-medium">{item.associadoNome}</TableCell>
                      <TableCell>{item.mensalidade.competencia}</TableCell>
                      <TableCell>{formatarMoeda(item.mensalidade.valor)}</TableCell>
                      <TableCell>{item.diasEmAtraso} dia(s)</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
