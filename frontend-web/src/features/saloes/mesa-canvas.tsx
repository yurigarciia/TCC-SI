"use client";

import type { Mesa } from "./types";

const LARGURA = 640;
const ALTURA = 420;

interface MesaCanvasProps {
  mesas: Mesa[];
  onCanvasClick?: (posicao: { x: number; y: number }) => void;
}

// Mapa clicável simples (RF10/croqui-salao.json): cada mesa é um círculo posicionado por x/y
// (mesmas coordenadas usadas depois pelo mapa de reservas, T-FE-007). Sem suporte a imagem de
// planta baixa de fundo — pendência em aberto (ver Open Questions do PLANEJAMENTO-GERAL.md); por
// enquanto é só um plano cartesiano em branco.
//
// Tamanho sempre fixo (640×420) — as mesas usam posicaoX/posicaoY em pixels reais, não
// proporcionais, então encolher o canvas (ex.: via maxWidth: "100%") cortaria mesas fora da
// borda em telas estreitas. Em vez disso, a rolagem horizontal do wrapper externo permite
// "arrastar" o croqui em telas menores, do mesmo jeito que as tabelas do resto do painel.
export function MesaCanvas({ mesas, onCanvasClick }: MesaCanvasProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <div
        role={onCanvasClick ? "button" : undefined}
        tabIndex={onCanvasClick ? 0 : undefined}
        onClick={(evento) => {
          if (!onCanvasClick) return;
          const retangulo = evento.currentTarget.getBoundingClientRect();
          const x = Math.round(evento.clientX - retangulo.left);
          const y = Math.round(evento.clientY - retangulo.top);
          onCanvasClick({ x, y });
        }}
        className="relative bg-card"
        style={{ width: LARGURA, height: ALTURA, cursor: onCanvasClick ? "crosshair" : "default" }}
      >
        {mesas.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {onCanvasClick
              ? "Clique no croqui para posicionar a primeira mesa."
              : "Nenhuma mesa cadastrada ainda."}
          </p>
        )}
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            className="absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-secondary bg-secondary/10 text-xs font-semibold text-secondary"
            style={{ left: mesa.posicaoX, top: mesa.posicaoY }}
            title={`Mesa ${mesa.numero} — ${mesa.capacidade} lugares`}
          >
            {mesa.numero}
          </div>
        ))}
      </div>
    </div>
  );
}

export const MESA_CANVAS_LARGURA = LARGURA;
export const MESA_CANVAS_ALTURA = ALTURA;
