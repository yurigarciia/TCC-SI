"use client";

import { Mail, ShieldUser } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsuarios } from "@/features/usuarios/use-usuarios";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";

const COLUNAS = "md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)] md:items-center md:gap-4";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

// Até esta ticket, a única forma de existir uma conta administrador era o script
// seed-admin.ts (rodado manualmente, direto no banco) — não havia nenhum jeito de conceder
// acesso administrativo pela própria aplicação. RNF02 previa RBAC/perfis (administrador/
// associado), mas nunca a gestão de contas em si — passou batido do escopo original.
export default function UsuariosPage() {
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const { data: resultado, isLoading, isError } = useUsuarios(pagina, busca || undefined);
  const usuarios = resultado?.itens;

  const mudarBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          <ShieldUser aria-hidden="true" className="mr-2 inline size-6 align-[-0.2em]" />
          Usuários da plataforma
        </h1>
        <p className="text-sm text-muted-foreground">Contas com acesso ao painel administrativo.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={busca} onChange={mudarBusca} placeholder="Buscar por nome ou e-mail" />
        <Button render={<Link href="/usuarios/novo" />}>Novo administrador</Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os usuários. Tente novamente em instantes.
        </p>
      )}

      {usuarios && usuarios.length === 0 && (
        <p className="rounded-xl border bg-card py-10 text-center text-sm text-muted-foreground shadow-sm">
          {busca ? "Nenhum usuário encontrado para esse termo." : "Nenhum usuário cadastrado ainda."}
        </p>
      )}

      {usuarios && usuarios.length > 0 && (
        <div className="space-y-3">
          <div
            className={`hidden h-12 rounded-xl border bg-card px-4 text-sm font-semibold text-foreground shadow-sm md:grid ${COLUNAS}`}
          >
            <span>Usuário</span>
            <span>Perfil</span>
          </div>
          <ul className="space-y-3">
            {usuarios.map((usuario) => (
              <li
                key={usuario.id}
                className={`flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm md:grid ${COLUNAS}`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                    {iniciais(usuario.nome ?? usuario.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {usuario.nome ?? <span className="text-muted-foreground">Sem nome</span>}
                    </p>
                    <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                      <Mail aria-hidden="true" className="size-3.5 shrink-0" />
                      {usuario.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center md:justify-center">
                  <Badge variant={usuario.perfil === "administrador" ? "success" : "outline"}>
                    {usuario.perfil === "administrador" ? "Administrador" : "Associado"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
          {resultado && (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm [&>div]:border-t-0">
              <Pagination pagina={resultado} onMudarPagina={setPagina} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
