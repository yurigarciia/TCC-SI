import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type TomCartaoResumo = "default" | "success" | "warning" | "destructive";

const TOM_VALOR: Record<TomCartaoResumo, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

interface CartaoResumoProps {
  titulo: string;
  valor: string | number | undefined;
  carregando: boolean;
  descricao: string;
  tom?: TomCartaoResumo;
  href?: string;
}

// "Big number" — extraído da tela Início (T-FE-002) pra ser reaproveitado em qualquer lugar que
// precise de um número em destaque com legenda (achado numa conversa com o usuário: pediu o
// mesmo tipo de cartão pra acompanhar um evento no dia, na tela de ingressos).
export function CartaoResumo({ titulo, valor, carregando, descricao, tom = "default", href }: CartaoResumoProps) {
  const conteudo = (
    <Card className={href ? "h-full transition-colors hover:border-secondary" : "h-full"}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        {carregando ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className={`font-heading text-3xl font-semibold ${TOM_VALOR[tom]}`}>{valor}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
      </CardContent>
    </Card>
  );

  if (!href) return conteudo;
  return (
    <Link href={href} className="block">
      {conteudo}
    </Link>
  );
}
