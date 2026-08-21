"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/features/auth/use-current-user";
import { useLogout } from "@/features/auth/use-logout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const itensDeNavegacao = [
  { href: "/", label: "Início" },
  { href: "/associados", label: "Associados" },
  { href: "/mensalidades", label: "Mensalidades" },
  { href: "/eventos", label: "Eventos" },
  { href: "/saloes", label: "Salões" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: usuario, isLoading } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 sm:px-6">
        <span className="font-heading text-lg font-semibold text-foreground">Pia do Sul</span>
        <div className="flex items-center gap-3">
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

      <div className="flex flex-1">
        <nav
          aria-label="Navegação principal"
          className="hidden w-56 shrink-0 border-r bg-card p-4 sm:block"
        >
          <ul className="space-y-1">
            {itensDeNavegacao.map((item) => {
              const ativo =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
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
        </nav>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
