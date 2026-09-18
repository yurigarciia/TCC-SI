"use client";

import {
  Building2Icon,
  CalendarIcon,
  ChevronDownIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  ShieldUserIcon,
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
import type { Perfil } from "@/features/auth/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo-mark";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CHAVE_SIDEBAR_COLAPSADA = "querencia_erp_sidebar_colapsada";

const ROTULO_PERFIL: Record<Perfil, string> = {
  administrador: "Administrador",
  associado: "Associado",
};

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
  { href: "/usuarios", label: "Usuários", icon: ShieldUserIcon },
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

// Iniciais pro avatar — prefere o nome (ex.: "Maria da Silva" -> "MS"); cai pras 2 primeiras
// letras da parte local do e-mail quando não há nome (contas de associado ainda não têm nome no
// Usuario, ver domain/usuario.entity.ts).
function iniciaisDoUsuario(nome: string | null, email: string): string {
  if (nome) {
    const partes = nome.trim().split(/\s+/);
    const iniciais = partes.length > 1 ? partes[0][0] + partes[partes.length - 1][0] : partes[0].slice(0, 2);
    return iniciais.toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
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
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors",
                  colapsada && "justify-center px-0",
                  emSecao
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
                  "flex items-center justify-center rounded-md px-0 py-2 text-sm font-medium text-sidebar-foreground transition-colors",
                  emSecao
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors",
                // Fundo+texto de "ativo" só quando o grupo está fechado — expandido, é o
                // subitem que carrega o destaque (ver abaixo), o pai fica com o texto normal.
                emSecao && !aberto
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
              <ul className="mt-1 space-y-1 border-l border-sidebar-border pl-3">
                {item.subitens.map((sub) => {
                  const SubIcone = sub.icon;
                  const ativo = subitemEstaAtivo(pathname, item.subitens!, sub.href);
                  return (
                    <li key={sub.href}>
                      <Link
                        href={sub.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium text-sidebar-foreground transition-colors",
                          ativo
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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

// Bloco com a conta autenticada — fica fixo no rodapé da sidebar (desktop) ou do drawer (mobile),
// no lugar de header. Colapsada, mostra só o avatar (com o e-mail em `title`) + botão de sair.
function ContaDoUsuario({
  colapsada = false,
}: {
  colapsada?: boolean;
}) {
  const { data: usuario, isLoading } = useCurrentUser();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-3", colapsada && "justify-center")}>
        <Skeleton className="size-8 shrink-0 rounded-full bg-sidebar-accent" />
        {!colapsada && <Skeleton className="h-4 w-24 bg-sidebar-accent" />}
      </div>
    );
  }

  if (!usuario) return null;

  const nomeExibido = usuario.nome ?? usuario.email;
  const iniciais = iniciaisDoUsuario(usuario.nome, usuario.email);

  if (colapsada) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Avatar size="sm" title={nomeExibido}>
          <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
            {iniciais}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label="Sair"
          title="Sair"
          onClick={logout}
        >
          <LogOutIcon />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Avatar size="sm" className="shrink-0">
        <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
          {iniciais}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-sidebar-foreground">{nomeExibido}</p>
        <p className="truncate text-xs text-sidebar-foreground/70">
          {ROTULO_PERFIL[usuario.perfil]}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        aria-label="Sair"
        title="Sair"
        onClick={logout}
      >
        <LogOutIcon />
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    <div className="flex min-h-screen min-w-0">
      {/* Sidebar (desktop) — coluna escura de ponta a ponta, com marca e conta próprias (não usa
          mais o header claro compartilhado, ver adendo "Sidebar escura" no PLANEJAMENTO-GERAL.md). */}
      <nav
        aria-label="Navegação principal"
        className={cn(
          "hidden shrink-0 flex-col bg-sidebar transition-[width] duration-200 sm:flex",
          colapsada ? "w-16" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4",
            colapsada && "justify-center gap-1 px-0",
          )}
        >
          {colapsada ? (
            <span className="flex shrink-0 items-center justify-center rounded-md bg-white p-1">
              <LogoMark size={18} />
            </span>
          ) : (
            <span className="flex min-w-0 items-center gap-2 truncate font-heading text-lg font-semibold text-sidebar-foreground">
              <span className="flex shrink-0 items-center justify-center rounded-md bg-white p-1">
                <LogoMark size={22} />
              </span>
              Querência ERP
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              !colapsada && "ml-auto",
            )}
            aria-label={colapsada ? "Expandir menu" : "Encolher menu"}
            title={colapsada ? "Expandir menu" : "Encolher menu"}
            onClick={alternarColapso}
          >
            {colapsada ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <LinksDeNavegacao pathname={pathname} colapsada={colapsada} />
        </div>

        <div className="shrink-0 border-t border-sidebar-border p-3">
          <ContaDoUsuario colapsada={colapsada} />
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior — só existe no mobile (gatilho do drawer); no desktop a marca e a conta
            já vivem na sidebar. */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4 sm:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            className="-ml-1"
            aria-label="Abrir menu de navegação"
            onClick={() => setMenuAberto(true)}
          >
            <MenuIcon />
          </Button>
          <span className="flex min-w-0 items-center gap-2 truncate font-heading text-lg font-semibold text-foreground">
            <LogoMark size={26} className="shrink-0" />
            Querência ERP
          </span>
        </header>

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>

      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetContent side="left" className="flex flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="border-b border-sidebar-border">
            <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
              <span className="flex shrink-0 items-center justify-center rounded-md bg-white p-1">
                <LogoMark size={22} />
              </span>
              Querência ERP
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto p-4">
            <LinksDeNavegacao pathname={pathname} onNavigate={() => setMenuAberto(false)} />
          </nav>
          <SheetFooter className="border-t border-sidebar-border">
            <ContaDoUsuario />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
