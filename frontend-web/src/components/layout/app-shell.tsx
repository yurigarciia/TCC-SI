"use client";

import {
  Building2Icon,
  CalendarIcon,
  ChevronDownIcon,
  HomeIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  TagIcon,
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

interface ItemDeNavegacao {
  href: string;
  label: string;
  icon: LucideIcon;
  // Só "Associados" tem subitens hoje (Associados/Categorias) — estrutura genérica pra caso outra
  // seção precise do mesmo padrão no futuro (ex.: Eventos ganhar "Salões" como subitem).
  subitens?: { href: string; label: string; icon: LucideIcon }[];
}

const itensDeNavegacao: ItemDeNavegacao[] = [
  { href: "/", label: "Início", icon: HomeIcon },
  {
    href: "/associados",
    label: "Associados",
    icon: UsersIcon,
    subitens: [
      { href: "/associados", label: "Associados", icon: UsersIcon },
      { href: "/associados/categorias", label: "Categorias", icon: TagIcon },
    ],
  },
  { href: "/mensalidades", label: "Mensalidades", icon: WalletIcon },
  { href: "/eventos", label: "Eventos", icon: CalendarIcon },
  { href: "/saloes", label: "Salões", icon: Building2Icon },
];

function estaEmSecao(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// O subitem "Associados" (/associados) não pode ficar marcado como ativo em
// /associados/categorias — os dois são subitens irmãos da mesma seção, prefixo sozinho não
// distingue.
function subitemEstaAtivo(pathname: string, subitens: { href: string }[], href: string): boolean {
  const maisEspecifico = subitens
    .filter((s) => estaEmSecao(pathname, s.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return maisEspecifico?.href === href;
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
  // Grupo com subitens abre sozinho quando a navegação (inclusive troca de rota sem remount, ex.:
  // clicar num link pra dentro da seção vindo de fora da sidebar) entra nele — nunca esconde onde
  // o usuário está; só depois disso ele pode fechar manualmente.
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const item = itensDeNavegacao.find((i) => i.subitens && estaEmSecao(pathname, i.href));
    if (!item) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGruposAbertos((atual) => (atual[item.href] ? atual : { ...atual, [item.href]: true }));
  }, [pathname]);

  return (
    <ul className={cn("space-y-1", className)}>
      {itensDeNavegacao.map((item) => {
        const emSecao = estaEmSecao(pathname, item.href);
        const Icone = item.icon;

        if (!item.subitens) {
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                title={colapsada ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  colapsada && "justify-center px-0",
                  emSecao
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <Icone className="size-4 shrink-0" aria-hidden="true" />
                <span className={cn("truncate", colapsada && "sr-only")}>{item.label}</span>
              </Link>
            </li>
          );
        }

        // Sidebar encolhida: sem espaço pra submenu flutuante, o ícone do grupo vira atalho
        // direto pro primeiro subitem (Associados).
        if (colapsada) {
          return (
            <li key={item.href}>
              <Link
                href={item.subitens[0].href}
                onClick={onNavigate}
                title={item.label}
                className={cn(
                  "flex items-center justify-center rounded-md px-0 py-2 text-sm font-medium transition-colors",
                  emSecao
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <Icone className="size-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </li>
          );
        }

        const aberto = gruposAbertos[item.href] ?? false;

        return (
          <li key={item.href}>
            <button
              type="button"
              onClick={() =>
                setGruposAbertos((atual) => ({ ...atual, [item.href]: !aberto }))
              }
              aria-expanded={aberto}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                // Fundo+texto de "ativo" só quando o grupo está fechado — expandido, é o
                // subitem que carrega o destaque (ver abaixo), o pai fica com o texto normal.
                // Antes o texto claro (feito pra ficar sobre o fundo verde) aparecia sem o
                // fundo, quase invisível sobre o cinza claro da sidebar.
                emSecao && !aberto
                  ? "bg-secondary text-secondary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Icone className="size-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 truncate text-left">{item.label}</span>
              <ChevronDownIcon
                className={cn("size-3.5 shrink-0 transition-transform", aberto && "rotate-180")}
                aria-hidden="true"
              />
            </button>
            {aberto && (
              <ul className="mt-1 space-y-1 border-l pl-3">
                {item.subitens.map((sub) => {
                  const SubIcone = sub.icon;
                  const ativo = subitemEstaAtivo(pathname, item.subitens!, sub.href);
                  return (
                    <li key={sub.href}>
                      <Link
                        href={sub.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                          ativo
                            ? "bg-secondary text-secondary-foreground"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <SubIcone className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{sub.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
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
