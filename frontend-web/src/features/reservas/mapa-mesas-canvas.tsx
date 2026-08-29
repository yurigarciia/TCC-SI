"use client";

import { cn } from "@/lib/utils";
import type { MesaNoMapa, StatusMesaNoMapa } from "./types";

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
  onMesaClick: (mesa: MesaNoMapa) => void;
}

// Mesmo plano cartesiano de croqui-salao.json/MesaCanvas (T-FE-005), agora colorido pelo status
// vindo de GET /eventos/:id/mapa-mesas (RF14 — sem cache, reflete o estado atual do banco). Clicar
// numa mesa abre o painel de ações (reservar/confirmar/cancelar/transferir) na página.
export function MapaMesasCanvas({ mesas, onMesaClick }: MapaMesasCanvasProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border bg-muted/20"
      style={{ width: LARGURA, maxWidth: "100%", height: ALTURA }}
    >
      {mesas.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Este croqui ainda não tem mesas configuradas para o evento.
        </p>
      )}
      {mesas.map((mesa) => (
        <button
          key={mesa.mesaId}
          type="button"
          onClick={() => onMesaClick(mesa)}
          disabled={mesa.status === "bloqueada"}
          className={cn(
            "absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
            ESTILO_POR_STATUS[mesa.status],
          )}
          style={{ left: mesa.posicaoX, top: mesa.posicaoY }}
          title={`Mesa ${mesa.numero} — ${mesa.status}${mesa.nomeTitular ? ` — ${mesa.nomeTitular}` : ""}`}
        >
          {mesa.numero}
        </button>
      ))}
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
