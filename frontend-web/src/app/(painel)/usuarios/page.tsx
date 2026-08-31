"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsuarios } from "@/features/usuarios/use-usuarios";
import { TableEmptyRow } from "@/components/table-empty-row";
import { Pagination } from "@/components/pagination";

// Até esta ticket, a única forma de existir uma conta administrador era o script
// seed-admin.ts (rodado manualmente, direto no banco) — não havia nenhum jeito de conceder
// acesso administrativo pela própria aplicação. RNF02 previa RBAC/perfis (administrador/
// associado), mas nunca a gestão de contas em si — passou batido do escopo original.
export default function UsuariosPage() {
  const [pagina, setPagina] = useState(1);
  const { data: resultado, isLoading, isError } = useUsuarios(pagina);
  const usuarios = resultado?.itens;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Usuários da plataforma
          </h1>
          <p className="text-muted-foreground">
            Contas de login com acesso ao painel — associados autenticam pelo app, não aparecem
            aqui pra criação, só administradores.
          </p>
        </div>
        <Button render={<Link href="/usuarios/novo" />}>Novo administrador</Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os usuários. Tente novamente em instantes.
        </p>
      )}

      {usuarios && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableEmptyRow colSpan={2}>Nenhum usuário cadastrado ainda.</TableEmptyRow>
              ) : (
                usuarios.map((usuario, indice) => (
                  <TableRow
                    key={usuario.id}
                    className={indice % 2 === 1 ? "bg-muted/50" : undefined}
                  >
                    <TableCell className="font-medium">{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.perfil === "administrador" ? "success" : "outline"}>
                        {usuario.perfil === "administrador" ? "Administrador" : "Associado"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {resultado && <Pagination pagina={resultado} onMudarPagina={setPagina} />}
        </div>
      )}
    </div>
  );
}
