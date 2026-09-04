"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
      {/* Dados do evento à esquerda, ingresso avulso + preço por perfil empilhados à direita —
          aproveita a largura em monitores maiores em vez de empilhar tudo numa coluna só (achado
          numa conversa com o usuário, em telas grandes as seções ficavam meio "vazias" na
          largura). Em telas menores (abaixo de lg) tudo volta a empilhar numa coluna. */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle>Dados do evento</CardTitle>
          <CardDescription>Vincular um croqui de salão é opcional.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do evento</Label>
            <Input
              id="nome"
              placeholder="Ex.: Baile da Primavera"
              aria-invalid={!!errors.nome}
              {...register("nome")}
            />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="data">Data e horário</Label>
              <Input
                id="data"
                type="datetime-local"
                aria-invalid={!!errors.data}
                {...register("data")}
              />
              {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                placeholder="Ex.: Sede do CTG Pia do Sul"
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
              {...register("descricao")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="salaoId">Croqui de salão (opcional)</Label>
              <Link
                href="/saloes/novo"
                target="_blank"
                className="text-sm text-primary underline-offset-4 hover:underline"
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

      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ingresso avulso</CardTitle>
          <CardDescription>
            Quantidade disponível pra venda — opcional, deixe em branco pra não vender ingresso
            avulso neste evento. O preço cobrado é o configurado por perfil de comprador, ao lado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="quantidadeDisponivel">Quantidade disponível</Label>
            <Input
              id="quantidadeDisponivel"
              type="number"
              min={0}
              placeholder="Ex.: 100"
              {...register("quantidadeDisponivel")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preço por perfil de comprador</CardTitle>
          <CardDescription>
            Preço realmente cobrado na emissão do ingresso (venda presencial ou pelo app). Sócio
            varia por categoria; cada campo em branco cai no padrão já configurado pra entidade,
            se houver.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    <Input
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
              <Input
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
              <Input
                id="precoCrianca"
                type="number"
                min={0}
                step="0.01"
                placeholder="0,00"
                {...register("precoCrianca")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      </div>

      {salaoIdSelecionado && (
        <Card>
          <CardHeader>
            <CardTitle>Mesas do croqui vinculado</CardTitle>
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
                    <Input
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
