"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const VERDE = "#2e5e3e";
const VINHO = "#7a2331";

interface GraficosDashboardProps {
  associados: { status: string; criadoEm: string; categoriaSocioId: string | null }[] | undefined;
  categorias: { id: string; nome: string }[] | undefined;
  inadimplentes: number | undefined;
  agora: number;
}

function ultimosSeisMeses(agora: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const data = new Date(agora);
    data.setDate(1);
    data.setMonth(data.getMonth() - (5 - i));
    return {
      chave: `${data.getFullYear()}-${data.getMonth()}`,
      rotulo: data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      novos: 0,
    };
  });
}

const ESTILO_EIXO = { tickLine: false, axisLine: false, fontSize: 12 };

export function GraficosDashboard({ associados, categorias, inadimplentes, agora }: GraficosDashboardProps) {
  const ativos = associados?.filter((a) => a.status === "ativo").length ?? 0;

  const dadosCategoria = categorias?.map((categoria) => ({
    nome: categoria.nome,
    total: associados?.filter((a) => a.categoriaSocioId === categoria.id).length ?? 0,
  }));
  const semCategoria = associados?.filter((a) => a.categoriaSocioId === null).length ?? 0;
  if (dadosCategoria && semCategoria > 0) {
    dadosCategoria.push({ nome: "Sem categoria", total: semCategoria });
  }

  const meses = ultimosSeisMeses(agora);
  associados?.forEach((associado) => {
    const data = new Date(associado.criadoEm);
    const mes = meses.find((m) => m.chave === `${data.getFullYear()}-${data.getMonth()}`);
    if (mes) mes.novos += 1;
  });

  const emDia = inadimplentes === undefined ? 0 : Math.max(0, ativos - inadimplentes);
  const dadosAdimplencia = [
    { nome: "Em dia", total: emDia, cor: VERDE },
    { nome: "Inadimplentes", total: inadimplentes ?? 0, cor: VINHO },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Associados por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {!dadosCategoria ? (
            <Skeleton className="h-56 w-full" />
          ) : dadosCategoria.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%" debounce={200}>
                <BarChart data={dadosCategoria}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd0bc" />
                  <XAxis dataKey="nome" {...ESTILO_EIXO} />
                  <YAxis allowDecimals={false} width={28} {...ESTILO_EIXO} />
                  <Tooltip />
                  <Bar dataKey="total" name="Associados" fill={VERDE} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Novos associados nos últimos 6 meses</CardTitle>
        </CardHeader>
        <CardContent>
          {!associados ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%" debounce={200}>
                <BarChart data={meses}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd0bc" />
                  <XAxis dataKey="rotulo" {...ESTILO_EIXO} />
                  <YAxis allowDecimals={false} width={28} {...ESTILO_EIXO} />
                  <Tooltip />
                  <Bar dataKey="novos" name="Novos associados" fill={VERDE} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Associados adimplentes</CardTitle>
        </CardHeader>
        <CardContent>
          {inadimplentes === undefined || !associados ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%" debounce={200}>
                <BarChart data={dadosAdimplencia}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd0bc" />
                  <XAxis dataKey="nome" {...ESTILO_EIXO} />
                  <YAxis allowDecimals={false} width={28} {...ESTILO_EIXO} />
                  <Tooltip />
                  <Bar dataKey="total" name="Associados" radius={[6, 6, 0, 0]}>
                    {dadosAdimplencia.map((item) => (
                      <Cell key={item.nome} fill={item.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
