"use client";

import { Mail, Pencil, ShieldUser, Trash2 } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { Usuario } from "@/features/usuarios/types";
import {
  useAtualizarUsuario,
  useExcluirUsuario,
  useUsuarios,
} from "@/features/usuarios/use-usuarios";
import { useCurrentUser } from "@/features/auth/use-current-user";
import { ApiError } from "@/lib/api-client";
import { Pagination } from "@/components/pagination";
import { SearchInput } from "@/components/search-input";

const COLUNAS = "md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)_auto] md:items-center md:gap-4";

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
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarioExcluindo, setUsuarioExcluindo] = useState<Usuario | null>(null);
  const { data: resultado, isLoading, isError } = useUsuarios(pagina, busca || undefined);
  const { data: usuarioAtual } = useCurrentUser();
  const usuarios = resultado?.itens;
  const excluir = useExcluirUsuario();

  const mudarBusca = (valor: string) => {
    setBusca(valor);
    setPagina(1);
  };

  function confirmarExclusao() {
    if (!usuarioExcluindo) return;
    excluir.mutate(usuarioExcluindo.id, {
      onSuccess: () => {
        toast.success("Usuário excluído.");
        setUsuarioExcluindo(null);
      },
      onError: (erro) => {
        toast.error(
          erro instanceof ApiError ? erro.message : "Não foi possível excluir o usuário.",
        );
      },
    });
  }

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
            <span className="text-right">Ações</span>
          </div>
          <ul className="space-y-3">
            {usuarios.map((usuario) => {
              const souEu = usuario.id === usuarioAtual?.sub;
              return (
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
                        {souEu && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
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

                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${usuario.email}`}
                      onClick={() => setUsuarioEditando(usuario)}
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${usuario.email}`}
                      disabled={souEu}
                      title={souEu ? "Você não pode excluir a própria conta" : undefined}
                      onClick={() => setUsuarioExcluindo(usuario)}
                    >
                      <Trash2 aria-hidden="true" className="size-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          {resultado && (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm [&>div]:border-t-0">
              <Pagination pagina={resultado} onMudarPagina={setPagina} />
            </div>
          )}
        </div>
      )}

      <Dialog
        open={!!usuarioEditando}
        onOpenChange={(aberto) => !aberto && setUsuarioEditando(null)}
      >
        <DialogContent className="sm:max-w-md">
          {usuarioEditando && (
            <FormularioEditarUsuario
              usuario={usuarioEditando}
              onFechar={() => setUsuarioEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!usuarioExcluindo}
        onOpenChange={(aberto) => !aberto && setUsuarioExcluindo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir “{usuarioExcluindo?.nome ?? usuarioExcluindo?.email}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A conta perde acesso ao painel imediatamente. Não dá pra desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={excluir.isPending} onClick={confirmarExclusao}>
              {excluir.isPending ? "Excluindo…" : "Confirmar exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const editarUsuarioSchema = z.object({
  nome: z.string().min(2, "Informe o nome.").max(150, "Máximo de 150 caracteres."),
  email: z.string().email("Informe um e-mail válido.").max(255, "Máximo de 255 caracteres."),
});

type EditarUsuarioValues = z.infer<typeof editarUsuarioSchema>;

function FormularioEditarUsuario({
  usuario,
  onFechar,
}: {
  usuario: Usuario;
  onFechar: () => void;
}) {
  const atualizar = useAtualizarUsuario(usuario.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditarUsuarioValues>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: { nome: usuario.nome ?? "", email: usuario.email },
  });

  const onSubmit = handleSubmit((dados) => {
    atualizar.mutate(dados, {
      onSuccess: () => {
        toast.success("Usuário atualizado.");
        onFechar();
      },
      onError: (erro) => {
        toast.error(
          erro instanceof ApiError ? erro.message : "Não foi possível atualizar o usuário.",
        );
      },
    });
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar usuário</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="nome-usuario">Nome</Label>
          <Input
            id="nome-usuario"
            maxLength={150}
            aria-invalid={!!errors.nome}
            {...register("nome")}
          />
          {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-usuario">E-mail</Label>
          <Input
            id="email-usuario"
            type="email"
            maxLength={255}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={atualizar.isPending}>
            {atualizar.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </form>
    </>
  );
}
