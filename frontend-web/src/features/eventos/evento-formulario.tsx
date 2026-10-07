"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  Hash,
  LayoutGrid,
  MapPin,
  PartyPopper,
  Table2,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import { paraInputDatetimeLocal } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCategoriasSocio } from "@/features/associados/use-associados";
import { useSalao, useSaloes } from "@/features/saloes/use-saloes";
import type {
  ConfiguracaoIngressoEvento,
  ConfiguracaoMesaEvento,
  Evento,
  PerfilComprador,
  PrecosIngressoConfigurados,
} from "./types";

const mesaFormSchema = z.object({
  mesaId: z.string(),
  numero: z.number(),
  preco: z.coerce.number().min(0, "Informe um preço válido."),
  bloqueada: z.boolean(),
});

const precoCategoriaFormSchema = z.object({
  categoriaSocioId: z.string(),
  categoriaNome: z.string(),
  preco: z.string().optional(),
});

const formSchema = z.object({
  nome: z.string().min(2, "Informe o nome do evento."),
  data: z.string().min(1, "Informe a data e horário."),
  local: z.string().min(2, "Informe o local."),
  descricao: z.string().optional(),
  salaoId: z.string().optional(),
  quantidadeDisponivel: z.string().optional(),
  precosPorCategoria: z.array(precoCategoriaFormSchema),
  precoNaoSocio: z.string().optional(),
  precoCrianca: z.string().optional(),
  mesas: z.array(mesaFormSchema),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

function paraNumeroOpcional(valor?: string): number | undefined {
  if (!valor || !valor.trim()) return undefined;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

// Título de card com um ícone num badge — achado numa conversa com o usuário: cards da tela
// ficavam todos muito parecidos, sem nada pra diferenciar visualmente um do outro à primeira
// vista.
function TituloComIcone({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <CardTitle>{children}</CardTitle>
    </div>
  );
}

// Input com ícone (ou prefixo de texto, pra "R$") à esquerda — mesmo padrão já usado no campo de
// busca (components/search-input.tsx), generalizado aqui pra não repetir o wrapper relative/
// absolute em cada campo desta tela.
function InputComIcone({
  icon: Icon,
  prefixo,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { icon?: LucideIcon; prefixo?: string }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      )}
      {prefixo && (
        <span
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground"
          aria-hidden="true"
        >
          {prefixo}
        </span>
      )}
      <Input className={cn(Icon ? "pl-8" : prefixo ? "pl-8" : undefined, className)} {...props} />
    </div>
  );
}

export interface DadosIniciaisEvento {
  evento: Evento;
  mesas: ConfiguracaoMesaEvento[];
  ingresso: ConfiguracaoIngressoEvento | null;
  precos: PrecosIngressoConfigurados;
}

interface EventoFormularioProps {
  modo: "criar" | "editar";
  eventoId?: string;
  dadosIniciais?: DadosIniciaisEvento;
}

// Tela única de cadastro/edição — antes, criar um evento só pedia os dados básicos, e ingresso
// avulso/preço por perfil/mesas só apareciam depois, numa segunda tela (/eventos/[id]), com um
// botão "Salvar" por seção. Achado numa conversa com o usuário: fluxo ruim, telas diferentes pra
// criar e editar, muito espaço vazio na tela de criação. Agora as duas telas renderizam este
// mesmo componente — cadastro e edição ficam visualmente idênticos — com um único "Salvar" no
// fim que encadeia todas as chamadas necessárias (evento em si, mesas, ingresso avulso, preços
// por perfil), nessa ordem.
export function EventoFormulario({ modo, eventoId, dadosIniciais }: EventoFormularioProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Dropdown de seleção — busca uma página grande o bastante pra cobrir todos os salões
  // cadastrados sem precisar de paginação aqui (número de croquis tende a ser pequeno).
  const { data: resultadoSaloes } = useSaloes(1, undefined, 100);
  const saloes = resultadoSaloes?.itens;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: dadosIniciais?.evento.nome ?? "",
      data: dadosIniciais ? paraInputDatetimeLocal(dadosIniciais.evento.data) : "",
      local: dadosIniciais?.evento.local ?? "",
      descricao: dadosIniciais?.evento.descricao ?? "",
      salaoId: dadosIniciais?.evento.salaoId ?? undefined,
      quantidadeDisponivel: dadosIniciais?.ingresso
        ? String(dadosIniciais.ingresso.quantidadeDisponivel)
        : "",
      precosPorCategoria: [],
      precoNaoSocio:
        dadosIniciais?.precos.naoSocio != null ? String(dadosIniciais.precos.naoSocio) : "",
      precoCrianca:
        dadosIniciais?.precos.crianca != null ? String(dadosIniciais.precos.crianca) : "",
      mesas: [],
    },
  });

  const salaoIdSelecionado = useWatch({ control, name: "salaoId" });
  const { data: salaoData, isLoading: carregandoSalao } = useSalao(salaoIdSelecionado ?? "");
  const { fields, replace } = useFieldArray({ control, name: "mesas" });

  // Dropdown/lista de categorias — busca uma página grande o bastante pra cobrir todas as
  // categorias cadastradas sem precisar de paginação aqui (número de categorias tende a ser
  // pequeno). Preço de sócio varia por categoria (Contribuinte, Benemérito etc.), em vez de um
  // valor único pra qualquer sócio.
  const { data: resultadoCategorias } = useCategoriasSocio(1, undefined, 100);
  const categorias = resultadoCategorias?.itens;
  const { fields: fieldsCategoria, replace: replaceCategorias } = useFieldArray({
    control,
    name: "precosPorCategoria",
  });

  useEffect(() => {
    if (!categorias) return;
    const precoPorCategoria = new Map(
      (dadosIniciais?.precos.porCategoria ?? []).map((p) => [p.categoriaSocioId, p.preco]),
    );
    replaceCategorias(
      categorias.map((categoria) => {
        const preco = precoPorCategoria.get(categoria.id);
        return {
          categoriaSocioId: categoria.id,
          categoriaNome: categoria.nome,
          preco: preco != null ? String(preco) : "",
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorias]);

  useEffect(() => {
    if (!salaoData) {
      replace([]);
      return;
    }
    const configPorMesa = new Map((dadosIniciais?.mesas ?? []).map((c) => [c.mesaId, c]));
    replace(
      salaoData.mesas
        .sort((a, b) => a.numero - b.numero)
        .map((mesa) => {
          const config = configPorMesa.get(mesa.id);
          return {
            mesaId: mesa.id,
            numero: mesa.numero,
            preco: config?.preco ?? 0,
            bloqueada: config?.bloqueada ?? false,
          };
        }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaoData]);

  const onSubmit = handleSubmit(async (dados) => {
    const dadosBase = {
      nome: dados.nome,
      data: new Date(dados.data).toISOString(),
      local: dados.local,
      descricao: dados.descricao?.trim() || undefined,
      salaoId: dados.salaoId || undefined,
    };

    let idAlvo: string | undefined;
    try {
      if (modo === "criar") {
        const criado = await apiFetch<Evento>("/eventos", {
          method: "POST",
          body: JSON.stringify(dadosBase),
        });
        idAlvo = criado.id;
      } else {
        idAlvo = eventoId;
        await apiFetch<Evento>(`/eventos/${eventoId}`, {
          method: "PATCH",
          body: JSON.stringify(dadosBase),
        });
      }
    } catch {
      toast.error(
        modo === "criar" ? "Não foi possível criar o evento." : "Não foi possível salvar as alterações.",
      );
      return;
    }

    try {
      if (dados.salaoId && dados.mesas.length > 0) {
        await apiFetch(`/eventos/${idAlvo}/mesas`, {
          method: "PUT",
          body: JSON.stringify({
            mesas: dados.mesas.map(({ mesaId, preco, bloqueada }) => ({
              mesaId,
              preco,
              bloqueada,
            })),
          }),
        });
      }

      const quantidade = paraNumeroOpcional(dados.quantidadeDisponivel);
      if (quantidade !== undefined) {
        await apiFetch(`/eventos/${idAlvo}/ingresso`, {
          method: "PUT",
          body: JSON.stringify({ quantidadeDisponivel: quantidade }),
        });
      }

      for (const item of dados.precosPorCategoria) {
        const preco = paraNumeroOpcional(item.preco);
        if (preco === undefined) continue;
        await apiFetch(`/eventos/${idAlvo}/precos-ingresso`, {
          method: "PUT",
          body: JSON.stringify({
            perfil: "socio" satisfies PerfilComprador,
            preco,
            categoriaSocioId: item.categoriaSocioId,
          }),
        });
      }

      const precosFlat: Array<[PerfilComprador, number | undefined]> = [
        ["nao_socio", paraNumeroOpcional(dados.precoNaoSocio)],
        ["crianca", paraNumeroOpcional(dados.precoCrianca)],
      ];
      for (const [perfil, preco] of precosFlat) {
        if (preco === undefined) continue;
        await apiFetch(`/eventos/${idAlvo}/precos-ingresso`, {
          method: "PUT",
          body: JSON.stringify({ perfil, preco }),
        });
      }
    } catch {
      toast.error(
        "Evento salvo, mas houve um problema ao salvar parte da configuração. Revise abaixo.",
      );
      queryClient.invalidateQueries({ queryKey: ["eventos"] });
      router.push(`/eventos/${idAlvo}`);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["eventos"] });
    toast.success(modo === "criar" ? "Evento criado." : "Evento atualizado.");
    router.push(`/eventos/${idAlvo}`);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Dados do evento à esquerda, ingresso avulso + preço por perfil à direita — aproveita a
          largura em monitores maiores em vez de empilhar tudo numa coluna só (achado numa
          conversa com o usuário, em telas grandes as seções ficavam meio "vazias" na largura).
          Em telas menores (abaixo de lg) tudo volta a empilhar numa coluna. Colunas esticam pra
          mesma altura (`items-stretch`, o padrão do grid) — antes eram `items-start`, e o card de
          ingresso, bem mais curto que o de dados do evento, ficava visualmente desbalanceado ao
          lado dele. */}
      <div className="grid gap-6 lg:grid-cols-2">
      <Card className="bg-none! bg-card!">
        <CardHeader>
          <TituloComIcone icon={PartyPopper}>Dados do evento</TituloComIcone>
          <CardDescription>Nome, data, local e descrição aparecem para o associado no app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do evento</Label>
            <InputComIcone
              icon={PartyPopper}
              id="nome"
              placeholder="Ex.: Baile da Primavera"
              autoComplete="off"
              aria-invalid={!!errors.nome}
              {...register("nome")}
            />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="data">Data e horário</Label>
              <InputComIcone
                icon={CalendarClock}
                id="data"
                type="datetime-local"
                autoComplete="off"
                aria-invalid={!!errors.data}
                {...register("data")}
              />
              {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <InputComIcone
                icon={MapPin}
                id="local"
                placeholder="Ex.: Sede da entidade"
                autoComplete="off"
                aria-invalid={!!errors.local}
                {...register("local")}
              />
              {errors.local && <p className="text-sm text-destructive">{errors.local.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              placeholder="Ex.: Baile tradicionalista com jantar e sorteios."
              autoComplete="off"
              {...register("descricao")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="salaoId" className="flex items-center gap-1.5">
                <LayoutGrid className="size-4 text-muted-foreground" aria-hidden="true" />
                Croqui de salão (opcional)
              </Label>
              <Link
                href="/saloes/novo"
                target="_blank"
                className="text-sm leading-none text-primary underline-offset-4 hover:underline"
              >
                Novo salão ↗
              </Link>
            </div>
            <Controller
              control={control}
              name="salaoId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="salaoId" className="w-full">
                    <SelectValue placeholder="Sem croqui — só ingresso avulso">
                      {(valor: string | null) =>
                        saloes?.find((salao) => salao.id === valor)?.nome ??
                        "Sem croqui — só ingresso avulso"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {saloes?.map((salao) => (
                      <SelectItem key={salao.id} value={salao.id}>
                        {salao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Um card só pra ingresso avulso — antes quantidade e preço por perfil viviam em cards
          separados, mas são a mesma coisa (o preço configurado aqui é o que se cobra pela
          quantidade configurada aqui do lado), separar só distanciava informação relacionada. */}
      <Card className="bg-none! bg-card!">
        <CardHeader>
          <TituloComIcone icon={Ticket}>Ingresso avulso</TituloComIcone>
          <CardDescription>
            Entrada sem mesa vinculada. Deixe a quantidade em branco se este evento só vende por
            mesa (veja &quot;Mesas do croqui&quot;, abaixo).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="quantidadeDisponivel">Quantidade disponível</Label>
            <InputComIcone
              icon={Hash}
              id="quantidadeDisponivel"
              type="number"
              min={0}
              placeholder="Ex.: 100"
              {...register("quantidadeDisponivel")}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Users className="size-4 text-muted-foreground" aria-hidden="true" />
              Preço por perfil de comprador
            </div>

            {fieldsCategoria.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria de sócio cadastrada —{" "}
                <Link
                  href="/associados/categorias/novo"
                  target="_blank"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  crie uma
                </Link>{" "}
                pra poder definir o preço de sócio.
              </p>
            ) : (
              <div className="space-y-2">
                <Label>Sócio, por categoria</Label>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {fieldsCategoria.map((campo, indice) => (
                    <div key={campo.id} className="space-y-2">
                      <Label htmlFor={`precoCategoria-${indice}`} className="font-normal text-muted-foreground">
                        {campo.categoriaNome}
                      </Label>
                      <InputComIcone
                        prefixo="R$"
                        id={`precoCategoria-${indice}`}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0,00"
                        {...register(`precosPorCategoria.${indice}.preco` as const)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="precoNaoSocio">Não-sócio</Label>
                <InputComIcone
                  prefixo="R$"
                  id="precoNaoSocio"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  {...register("precoNaoSocio")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precoCrianca">Criança</Label>
                <InputComIcone
                  prefixo="R$"
                  id="precoCrianca"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0,00"
                  {...register("precoCrianca")}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {salaoIdSelecionado && (
        <Card className="bg-none! bg-card!">
          <CardHeader>
            <TituloComIcone icon={Table2}>Mesas do croqui vinculado</TituloComIcone>
            <CardDescription>Preço por mesa e bloqueio individual, se necessário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {carregandoSalao && <Skeleton className="h-24 w-full" />}

            {salaoData && salaoData.mesas.length === 0 && (
              <p className="text-sm text-muted-foreground">
                O croqui vinculado ainda não tem mesas cadastradas.
              </p>
            )}

            {fields.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-[80px_1fr_auto] items-center gap-3 text-sm font-medium text-muted-foreground">
                  <span>Mesa</span>
                  <span>Preço</span>
                  <span>Bloqueada</span>
                </div>
                {fields.map((campo, indice) => (
                  <div
                    key={campo.id}
                    className="grid grid-cols-[80px_1fr_auto] items-center gap-3 border-b pb-3 last:border-b-0"
                  >
                    <span className="font-medium">Mesa {campo.numero}</span>
                    <InputComIcone
                      prefixo="R$"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0,00"
                      {...register(`mesas.${indice}.preco` as const)}
                    />
                    <Controller
                      control={control}
                      name={`mesas.${indice}.bloqueada` as const}
                      render={({ field }) => (
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" render={<Link href="/eventos" />}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
