"use client";

import type { Mesa } from "./types";

const LARGURA = 640;
const ALTURA = 420;

interface MesaCanvasProps {
  mesas: Mesa[];
  // Clique em área vazia do croqui — posiciona uma mesa nova.
  onCanvasClick?: (posicao: { x: number; y: number }) => void;
  // Clique numa mesa já existente — abre ela pra editar, em vez de tratar como uma posição vazia
  // (achado numa conversa com o usuário: antes clicar em cima de uma mesa existente preenchia o
  // formulário de "adicionar mesa" com aquela mesma posição, sem avisar nada, deixando fácil
  // empilhar mesas exatamente uma em cima da outra).
  onMesaClick?: (mesa: Mesa) => void;
  mesaSelecionadaId?: string;
  // Marcador tracejado no ponto clicado, antes da mesa nova ser de fato salva — sem isso, clicar
  // no croqui não mudava nada visualmente ali (só nos campos do formulário abaixo), parecendo que
  // o clique não tinha feito nada.
  posicaoPendente?: { x: number; y: number } | null;
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
export function MesaCanvas({
  mesas,
  onCanvasClick,
  onMesaClick,
  mesaSelecionadaId,
  posicaoPendente,
}: MesaCanvasProps) {
  const interativo = !!onCanvasClick;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div
        role={interativo ? "button" : undefined}
        tabIndex={interativo ? 0 : undefined}
        aria-label={
          interativo ? "Clique para posicionar uma mesa nova; use os campos abaixo pra digitar a posição exata" : undefined
        }
        onClick={(evento) => {
          if (!onCanvasClick) return;
          const retangulo = evento.currentTarget.getBoundingClientRect();
          const x = Math.round(evento.clientX - retangulo.left);
          const y = Math.round(evento.clientY - retangulo.top);
          onCanvasClick({ x, y });
        }}
        onKeyDown={(evento) => {
          if (!onCanvasClick) return;
          if (evento.key !== "Enter" && evento.key !== " ") return;
          evento.preventDefault();
          // Sem posição de mouse pra usar (interação por teclado) — cai no centro do croqui; os
          // campos Posição X/Y abaixo continuam o jeito de digitar uma posição exata.
          onCanvasClick({ x: Math.round(LARGURA / 2), y: Math.round(ALTURA / 2) });
        }}
        className="relative bg-card"
        style={{ width: LARGURA, height: ALTURA, cursor: interativo ? "crosshair" : "default" }}
      >
        {mesas.length === 0 && !posicaoPendente && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm text-muted-foreground">
            {interativo
              ? "Clique no croqui para posicionar a primeira mesa."
              : "Nenhuma mesa cadastrada ainda."}
          </p>
        )}
        {mesas.map((mesa) => {
          const selecionada = mesa.id === mesaSelecionadaId;
          return (
            <div
              key={mesa.id}
              role={onMesaClick ? "button" : undefined}
              tabIndex={onMesaClick ? 0 : undefined}
              onClick={(evento) => {
                if (!onMesaClick) return;
                evento.stopPropagation();
                onMesaClick(mesa);
              }}
              onKeyDown={(evento) => {
                if (!onMesaClick) return;
                if (evento.key !== "Enter" && evento.key !== " ") return;
                evento.preventDefault();
                evento.stopPropagation();
                onMesaClick(mesa);
              }}
              className={`absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-semibold outline-none transition-colors ${
                selecionada
                  ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/40"
                  : "border-secondary bg-secondary/10 text-secondary"
              } ${onMesaClick ? "cursor-pointer hover:bg-secondary/20" : ""}`}
              style={{ left: mesa.posicaoX, top: mesa.posicaoY }}
              title={
                onMesaClick
                  ? `Mesa ${mesa.numero} — ${mesa.capacidade} lugares (clique pra editar)`
                  : `Mesa ${mesa.numero} — ${mesa.capacidade} lugares`
              }
            >
              {mesa.numero}
            </div>
          );
        })}
        {posicaoPendente && (
          <div
            className="pointer-events-none absolute flex size-10 -translate-x-1/2 -translate-y-1/2 animate-pulse items-center justify-center rounded-full border-2 border-dashed border-primary bg-primary/10"
            style={{ left: posicaoPendente.x, top: posicaoPendente.y }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export const MESA_CANVAS_LARGURA = LARGURA;
export const MESA_CANVAS_ALTURA = ALTURA;
