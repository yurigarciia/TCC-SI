"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCriarEvento } from "@/features/eventos/use-eventos";
import { useSaloes } from "@/features/saloes/use-saloes";

const formSchema = z.object({
  nome: z.string().min(2, "Informe o nome do evento."),
  data: z.string().min(1, "Informe a data e horário."),
  local: z.string().min(2, "Informe o local."),
  descricao: z.string().optional(),
  salaoId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NovoEventoPage() {
  const router = useRouter();
  // Dropdown de seleção — busca uma página grande o bastante para cobrir todos os salões
  // cadastrados sem precisar de paginação aqui (número de croquis tende a ser pequeno).
  const { data: resultadoSaloes } = useSaloes(1, undefined, 100);
  const saloes = resultadoSaloes?.itens;
  const criar = useCriarEvento();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = handleSubmit((dados) => {
    criar.mutate(
      {
        ...dados,
        descricao: dados.descricao || undefined,
        salaoId: dados.salaoId || undefined,
      },
      {
        onSuccess: (evento) => {
          toast.success("Evento criado como rascunho.");
          router.push(`/eventos/${evento.id}`);
        },
        onError: () => toast.error("Não foi possível criar o evento."),
      },
    );
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Novo evento</h1>
        <p className="text-muted-foreground">
          O evento nasce como rascunho — configure mesas/ingresso e publique quando estiver pronto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do evento</CardTitle>
          <CardDescription>Vincular um croqui de salão é opcional.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
                {errors.local && (
                  <p className="text-sm text-destructive">{errors.local.message}</p>
                )}
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
              <Label htmlFor="salaoId">Croqui de salão (opcional)</Label>
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

            <div className="flex justify-end gap-3">
              <Button variant="outline" render={<Link href="/eventos" />}>
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
