"use client";

import {
  Building2Icon,
  CalendarIcon,
  HomeIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

const CHAVE_SIDEBAR_COLAPSADA = "pia_do_sul_sidebar_colapsada";

const itensDeNavegacao: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Início", icon: HomeIcon },
  { href: "/associados", label: "Associados", icon: UsersIcon },
  { href: "/mensalidades", label: "Mensalidades", icon: WalletIcon },
  { href: "/eventos", label: "Eventos", icon: CalendarIcon },
  { href: "/saloes", label: "Salões", icon: Building2Icon },
];

function estaAtivo(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function LinksDeNavegacao({
  pathname,
  onNavigate,
  colapsada = false,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  colapsada?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn("space-y-1", className)}>
      {itensDeNavegacao.map((item) => {
        const ativo = estaAtivo(pathname, item.href);
        const Icone = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              title={colapsada ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                colapsada && "justify-center px-0",
                ativo
                  ? "bg-secondary text-secondary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Icone className="size-4 shrink-0" aria-hidden="true" />
              <span className={cn("truncate", colapsada && "sr-only")}>{item.label}</span>
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

  // Estado de colapso da sidebar (desktop only — o Sheet mobile sempre mostra os rótulos, já é um
  // overlay temporário, não faz sentido encolher). Persistido em localStorage pra não "piscar"
  // expandida a cada navegação; lido só no client (useEffect) pra não divergir da renderização SSR.
  const [colapsada, setColapsada] = useState(false);
  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_SIDEBAR_COLAPSADA);
    // Só roda uma vez, após a hidratação — ler localStorage direto no useState (lazy init)
    // divergiria do HTML renderizado no servidor (que nunca vê localStorage) e quebraria a
    // hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (salvo === "1") setColapsada(true);
  }, []);
  const alternarColapso = () => {
    setColapsada((atual) => {
      const proximo = !atual;
      localStorage.setItem(CHAVE_SIDEBAR_COLAPSADA, proximo ? "1" : "0");
      return proximo;
    });
  };

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
          className={cn(
            "hidden shrink-0 flex-col border-r bg-card p-4 transition-[width] duration-200 sm:flex",
            colapsada ? "w-16" : "w-56",
          )}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("mb-2", colapsada ? "self-center" : "self-end")}
            aria-label={colapsada ? "Expandir menu" : "Encolher menu"}
            title={colapsada ? "Expandir menu" : "Encolher menu"}
            onClick={alternarColapso}
          >
            {colapsada ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
          </Button>
          <LinksDeNavegacao pathname={pathname} colapsada={colapsada} />
        </nav>

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
