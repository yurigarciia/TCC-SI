import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  // Sem href = página atual (último item, não clicável).
  href?: string;
}

// Trilha "Seção / Sub-seção / Página atual" usada no topo das telas aninhadas do painel —
// substitui os links soltos "← Voltar" que cada tela inventava do seu próprio jeito (alguns
// tinham, outros não; nenhum mostrava o caminho completo quando havia mais de um nível, como em
// eventos/[id]/ingressos).
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, indice) => {
        const ultimo = indice === items.length - 1;
        return (
          <Fragment key={item.label}>
            {indice > 0 && (
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
            )}
            {item.href && !ultimo ? (
              <Link
                href={item.href}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground" aria-current={ultimo ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
