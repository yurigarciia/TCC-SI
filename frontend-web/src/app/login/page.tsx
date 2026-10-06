"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/logo-mark";
import { useLogin, AcessoNegadoError } from "@/features/auth/use-login";
import { ApiError } from "@/lib/api-client";

const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  senha: z.string().min(1, "Informe a senha."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const login = useLogin();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit((dados) => {
    login.mutate(dados);
  });

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[1.35fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-secondary lg:block" aria-hidden="true">
        <svg
          viewBox="0 0 1200 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 size-full"
        >
          <defs>
            <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3e2bf" />
              <stop offset="55%" stopColor="#e9c98f" />
              <stop offset="100%" stopColor="#c99a55" />
            </linearGradient>
          </defs>
          <rect width="1200" height="900" fill="url(#ceu)" />
          <circle cx="880" cy="330" r="120" fill="#fbf1d9" opacity="0.7" />
          <path
            d="M0 520 C180 440 320 470 480 430 C640 390 760 300 960 340 C1080 364 1140 400 1200 380 L1200 900 L0 900 Z"
            fill="#6f8f5c"
          />
          <path
            d="M0 600 C200 540 380 580 560 540 C740 500 900 470 1200 520 L1200 900 L0 900 Z"
            fill="#4f7147"
          />
          <path
            d="M0 690 C220 640 440 680 640 650 C840 620 1000 640 1200 670 L1200 900 L0 900 Z"
            fill="#2e5e3e"
          />
          <g stroke="#1f4029" strokeWidth="3" opacity="0.35">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={i} x1={0} y1={720 + i * 22} x2={1200} y2={700 + i * 22} />
            ))}
          </g>
        </svg>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#1f4029]/85 to-transparent p-12 pt-40 text-secondary-foreground">
          <p className="font-heading text-3xl font-semibold">Querência ERP</p>
          <p className="mt-2 max-w-md text-base opacity-90">
            Gestão de associados, mensalidades e eventos para entidades tradicionalistas.
          </p>
        </div>
      </aside>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl ring-1 ring-foreground/5 sm:p-10">
          <div className="text-center">
            <LogoMark size={44} className="mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-semibold text-card-foreground">Acesso ao painel</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Área restrita à diretoria da entidade.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="seuemail@suaentidade.org.br"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-erro" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p id="email-erro" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={!!errors.senha}
                  aria-describedby={errors.senha ? "senha-erro" : undefined}
                  className="pr-10"
                  {...register("senha")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={mostrarSenha}
                  onClick={() => setMostrarSenha((atual) => !atual)}
                >
                  {mostrarSenha ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </Button>
              </div>
              {errors.senha && (
                <p id="senha-erro" className="text-sm text-destructive">
                  {errors.senha.message}
                </p>
              )}
            </div>

            {login.isError && (
              <p className="text-sm text-destructive" role="alert">
                {login.error instanceof AcessoNegadoError
                  ? login.error.message
                  : login.error instanceof ApiError
                    ? "E-mail ou senha inválidos."
                    : "Não foi possível conectar ao servidor. Tente novamente."}
              </p>
            )}

            <Button type="submit" size="lg" className="h-11 w-full" disabled={login.isPending}>
              {login.isPending ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
