"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginaResultado } from "@/lib/pagination";

interface PaginationProps {
  /** Resultado paginado retornado pela API — usado para calcular textos e limites. */
  pagina: Pick<PaginaResultado<unknown>, "pagina" | "totalPaginas" | "total" | "limite">;
  onMudarPagina: (pagina: number) => void;
}

// Controles simples de "anterior/próxima" com "Mostrando X–Y de Z", sem input de "ir para a
// página" — decisão do DESIGN-SYSTEM (público com menor familiaridade digital, evitar entradas
// numéricas soltas). Usado abaixo de toda tabela paginada do painel.
export function Pagination({ pagina, onMudarPagina }: PaginationProps) {
  const { pagina: atual, totalPaginas, total, limite } = pagina;

  if (total === 0) {
    return null;
  }

  const inicio = (atual - 1) * limite + 1;
  const fim = Math.min(atual * limite, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t-2 border-border bg-muted/60 px-3 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Mostrando {inicio}–{fim} de {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={atual <= 1}
          onClick={() => onMudarPagina(atual - 1)}
        >
          <ChevronLeftIcon />
          Anterior
        </Button>
        <span className="px-1 text-sm text-muted-foreground">
          Página {atual} de {totalPaginas}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={atual >= totalPaginas}
          onClick={() => onMudarPagina(atual + 1)}
        >
          Próxima
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
