"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatarMoeda } from "@/lib/format";
import { useCategoriasSocio, useCriarCategoriaSocio } from "./use-associados";

const formSchema = z.object({
  nome: z.string().min(2, "Informe o nome da categoria."),
  valorMensalidade: z.coerce.number().positive("Informe um valor maior que zero."),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

// Sem isso, o Select de "categoria de sócio" em /associados/novo fica sempre vazio — nunca houve
// tela pra cadastrar categorias, só testadas via API direta (ver nota de T-FE-003 no
// PLANEJAMENTO-GERAL.md). Componente único reaproveitado como trigger tanto na lista de
// associados quanto no formulário de cadastro, pra nunca deixar o admin num beco sem saída.
export function GerenciarCategoriasDialog({ trigger }: { trigger: ReactElement }) {
  const [aberto, setAberto] = useState(false);
  const { data: categorias, isLoading } = useCategoriasSocio();
  const criar = useCriarCategoriaSocio();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = handleSubmit((dados) => {
    criar.mutate(dados, {
      onSuccess: () => {
        toast.success("Categoria criada.");
        reset();
      },
      onError: () => toast.error("Não foi possível criar a categoria."),
    });
  });

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categorias de sócio</DialogTitle>
          <DialogDescription>
            Cada categoria define o valor de mensalidade cobrado do associado.
          </DialogDescription>
        </DialogHeader>

        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

        {categorias && categorias.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
        )}

        {categorias && categorias.length > 0 && (
          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
            {categorias.map((categoria) => (
              <li
                key={categoria.id}
                className="flex items-center justify-between rounded px-2 py-1 text-sm"
              >
                <span className="text-foreground">{categoria.nome}</span>
                <span className="text-muted-foreground">
                  {formatarMoeda(categoria.valorMensalidade)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <Separator />

        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="categoria-nome">Nome</Label>
              <Input
                id="categoria-nome"
                placeholder="Ex.: Contribuinte"
                aria-invalid={!!errors.nome}
                {...register("nome")}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categoria-valor">Mensalidade (R$)</Label>
              <Input
                id="categoria-valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                aria-invalid={!!errors.valorMensalidade}
                {...register("valorMensalidade")}
              />
              {errors.valorMensalidade && (
                <p className="text-sm text-destructive">{errors.valorMensalidade.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={criar.isPending}>
              {criar.isPending ? "Adicionando…" : "Adicionar categoria"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
