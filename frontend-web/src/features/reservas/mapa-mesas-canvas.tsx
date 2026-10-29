"use client";

import { cn } from "@/lib/utils";
import type { AreaEstruturalNoMapa, ElementoEstruturalNoMapa, MesaNoMapa, StatusMesaNoMapa } from "./types";

const LARGURA = 640;
const ALTURA = 420;

const ESTILO_POR_STATUS: Record<StatusMesaNoMapa, string> = {
  livre: "border-border bg-card text-foreground hover:border-secondary",
  pendente: "border-warning bg-warning/10 text-warning-foreground",
  reservada: "border-destructive bg-destructive/10 text-destructive",
  bloqueada: "border-silver bg-silver/20 text-muted-foreground cursor-not-allowed",
};

interface MapaMesasCanvasProps {
  mesas: MesaNoMapa[];
  elementos?: ElementoEstruturalNoMapa[];
  areas?: AreaEstruturalNoMapa[];
  onMesaClick: (mesa: MesaNoMapa) => void;
}

// Mesmo plano cartesiano de croqui-salao.json/MesaCanvas (T-FE-005), agora colorido pelo status
// vindo de GET /eventos/:id/mapa-mesas (RF14 — sem cache, reflete o estado atual do banco). Clicar
// numa mesa abre o painel de ações (reservar/confirmar/cancelar/transferir) na página.
//
// Paredes, portas e áreas (tablado, bar, pista...) são desenhadas por cima do mesmo jeito que no
// editor de croqui (MesaCanvas) — achado numa conversa com o usuário: o mapa de reservas mostrava
// as mesas soltas num plano em branco, sem nenhuma referência visual do salão de verdade, embora
// o editor já desenhasse tudo isso há tempos.
//
// Tamanho sempre fixo (640×420, ver MesaCanvas) — rolagem horizontal no wrapper em vez de encolher
// o canvas, senão mesas com posicaoX maior cortariam fora da borda em telas estreitas.
export function MapaMesasCanvas({ mesas, elementos = [], areas = [], onMesaClick }: MapaMesasCanvasProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="relative overflow-hidden bg-[#fdfaf4]" style={{ width: LARGURA, height: ALTURA }}>
        {mesas.length === 0 && elementos.length === 0 && areas.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Este croqui ainda não tem mesas configuradas para o evento.
          </p>
        )}

        {/* Áreas (tablado, bar, pista de dança...) — chão por baixo de parede/mesa. */}
        {areas.map((area) => (
          <div
            key={area.id}
            className="absolute flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#c9a15a] bg-[#c9a15a]/10 text-xs font-medium text-[#8a6a2e]"
            style={{ left: area.x, top: area.y, width: area.largura, height: area.altura }}
            title={area.nome}
          >
            <span className="truncate px-2">{area.nome}</span>
          </div>
        ))}

        {/* Parede/porta — sempre parede antes de porta (mesmo motivo do MesaCanvas: a ordem dos
            elementos devolvida pela API não é garantida, então sem isso uma parede podia acabar
            pintada por cima da porta, escondendo o traço pontilhado dela). */}
        <svg className="pointer-events-none absolute inset-0" width={LARGURA} height={ALTURA} aria-hidden="true">
          {[...elementos]
            .sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === "porta" ? 1 : -1))
            .map((elemento) => (
              <line
                key={elemento.id}
                x1={elemento.x1}
                y1={elemento.y1}
                x2={elemento.x2}
                y2={elemento.y2}
                stroke={elemento.tipo === "parede" ? "#5b5147" : "#9c5a1f"}
                strokeWidth={elemento.tipo === "parede" ? 6 : 5}
                strokeDasharray={elemento.tipo === "porta" ? "6 3" : undefined}
                strokeLinecap="round"
              />
            ))}
        </svg>

        {mesas.map((mesa) => (
          <button
            key={mesa.mesaId}
            type="button"
            onClick={() => onMesaClick(mesa)}
            disabled={mesa.status === "bloqueada"}
            className={cn(
              "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 text-xs font-semibold shadow-sm transition-colors",
              mesa.formato === "retangular" ? "h-9 w-14 rounded-lg" : "size-10 rounded-full",
              ESTILO_POR_STATUS[mesa.status],
            )}
            style={{ left: mesa.posicaoX, top: mesa.posicaoY }}
            title={`Mesa ${mesa.numero} — ${mesa.status}${mesa.nomeTitular ? ` — ${mesa.nomeTitular}` : ""}`}
          >
            {mesa.numero}
          </button>
        ))}
      </div>
    </div>
  );
}

export const MAPA_MESAS_LEGENDA: Array<{ status: StatusMesaNoMapa; rotulo: string }> = [
  { status: "livre", rotulo: "Livre" },
  { status: "pendente", rotulo: "Pendente" },
  { status: "reservada", rotulo: "Reservada" },
  { status: "bloqueada", rotulo: "Bloqueada" },
];

export { ESTILO_POR_STATUS };
