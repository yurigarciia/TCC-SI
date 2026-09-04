"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCriarAdministrador } from "@/features/usuarios/use-usuarios";
import { ApiError } from "@/lib/api-client";

const formSchema = z.object({
  nome: z.string().min(2, "Informe o nome completo."),
  email: z.string().email("Informe um e-mail válido."),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

export default function NovoAdministradorPage() {
  const router = useRouter();
  const criar = useCriarAdministrador();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = handleSubmit((dados) => {
    criar.mutate(dados, {
      onSuccess: () => {
        toast.success("Administrador criado. Combine a senha provisória por fora com a pessoa.");
        router.push("/usuarios");
      },
      onError: (erro) => {
        toast.error(
          erro instanceof ApiError && erro.status === 409
            ? "Já existe uma conta com esse e-mail."
            : "Não foi possível criar o administrador.",
        );
      },
    });
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Breadcrumb items={[{ label: "Usuários", href: "/usuarios" }, { label: "Novo administrador" }]} />
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Novo administrador
        </h1>
        <p className="text-muted-foreground">
          Usuário com acesso exclusivo ao painel administrativo.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Dados de acesso</CardTitle>
          <CardDescription>A senha é provisória — comunique por um canal seguro.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                placeholder="Ex.: Maria da Silva"
                aria-invalid={!!errors.nome}
                autoComplete="off"
                {...register("nome")}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@piadosul.org.br"
                aria-invalid={!!errors.email}
                autoComplete="off"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha provisória</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                aria-invalid={!!errors.senha}
                autoComplete="new-password"
                {...register("senha")}
              />
              {errors.senha && (
                <p className="text-sm text-destructive">{errors.senha.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" render={<Link href="/usuarios" />}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criar.isPending}>
                {criar.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
