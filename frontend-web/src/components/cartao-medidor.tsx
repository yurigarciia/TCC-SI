import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CartaoMedidorProps {
  titulo: string;
  descricao: string;
  valor: number | undefined;
  total: number | undefined;
  carregando: boolean;
}

// Medidor (meter) — ratio contra um total, ex.: check-ins feitos sobre ingressos emitidos.
// Preferido a um gráfico de pizza de 2 fatias: ângulo/área são mais difíceis de comparar do que
// uma barra preenchida, e com só 2 categorias a pizza não ganha nada de um "parte-do-todo" que a
// barra já não mostre — as duas fatias são complementares (uma decorre da outra).
export function CartaoMedidor({ titulo, descricao, valor, total, carregando }: CartaoMedidorProps) {
  const percentual = total && total > 0 && valor !== undefined ? Math.round((valor / total) * 100) : undefined;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        {carregando || percentual === undefined ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="font-heading text-3xl font-semibold text-foreground">{percentual}%</p>
            <p className="text-sm text-muted-foreground">
              {valor} de {total}
            </p>
          </div>
        )}
        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
          role="meter"
          aria-label={titulo}
          aria-valuenow={percentual ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {percentual !== undefined && (
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${percentual}%` }}
            />
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
      </CardContent>
    </Card>
  );
}
