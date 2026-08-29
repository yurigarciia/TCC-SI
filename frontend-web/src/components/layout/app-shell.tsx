"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/features/auth/use-current-user";
import { useLogout } from "@/features/auth/use-logout";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const itensDeNavegacao = [
  { href: "/", label: "Início" },
  { href: "/associados", label: "Associados" },
  { href: "/mensalidades", label: "Mensalidades" },
  { href: "/eventos", label: "Eventos" },
  { href: "/saloes", label: "Salões" },
];

function estaAtivo(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function LinksDeNavegacao({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <ul className={cn("space-y-1", className)}>
      {itensDeNavegacao.map((item) => {
        const ativo = estaAtivo(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                ativo
                  ? "bg-secondary text-secondary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: usuario, isLoading } = useCurrentUser();
  const logout = useLogout();
  // Fecha o menu mobile ao tocar num link (ver onNavigate em LinksDeNavegacao) — evita o drawer
  // ficar aberto sobre a próxima tela.
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <header className="flex h-14 items-center justify-between gap-3 border-b bg-card px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="-ml-1 sm:hidden"
            aria-label="Abrir menu de navegação"
            onClick={() => setMenuAberto(true)}
          >
            <MenuIcon />
          </Button>
          <span className="truncate font-heading text-lg font-semibold text-foreground">
            Pia do Sul
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            usuario && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {usuario.email} · {usuario.perfil}
              </span>
            )
          )}
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>

      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetContent side="left" className="p-0">
          <SheetHeader className="border-b">
            <SheetTitle>Pia do Sul</SheetTitle>
          </SheetHeader>
          <nav aria-label="Navegação principal" className="p-4">
            <LinksDeNavegacao pathname={pathname} onNavigate={() => setMenuAberto(false)} />
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1">
        <nav
          aria-label="Navegação principal"
          className="hidden w-56 shrink-0 border-r bg-card p-4 sm:block"
        >
          <LinksDeNavegacao pathname={pathname} />
        </nav>

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
