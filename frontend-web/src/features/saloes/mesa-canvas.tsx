"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ElementoEstrutural, Mesa, TipoElementoEstrutural } from "./types";

const LARGURA = 640;
const ALTURA = 420;

// Distância mínima (em pixels) pra um arraste virar de fato uma parede/porta nova — sem isso, um
// simples clique (sem arrastar quase nada) criaria um traço de comprimento ~0, invisível e sem
// sentido nenhum no croqui.
const COMPRIMENTO_MINIMO_TRACO = 12;

// Largura/altura aproximadas do painel flutuante — só pra decidir de que lado do ponto clicado ele
// abre, sem estourar a borda do croqui (ver `estiloPainel`).
const PAINEL_LARGURA = 224;
const PAINEL_ALTURA = 190;

export type ModoCroqui = "mesa" | "parede" | "porta";

interface Segmento {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface MesaCanvasProps {
  mesas: Mesa[];
  elementos: ElementoEstrutural[];
  // Qual ferramenta está ativa — decide o que um clique/arraste no croqui faz. "mesa" mantém o
  // comportamento de sempre (clique posiciona mesa); "parede"/"porta" trocam pra arrastar um
  // traço em vez de posicionar mesa.
  modo: ModoCroqui;
  // Clique em área vazia do croqui (só faz sentido em modo "mesa") — posiciona uma mesa nova.
  onCanvasClick?: (posicao: { x: number; y: number }) => void;
  // Clique numa mesa já existente — abre ela pra editar, em vez de tratar como uma posição vazia
  // (achado numa conversa com o usuário: antes clicar em cima de uma mesa existente preenchia o
  // formulário de "adicionar mesa" com aquela mesma posição, sem avisar nada, deixando fácil
  // empilhar mesas exatamente uma em cima da outra).
  onMesaClick?: (mesa: Mesa) => void;
  mesaSelecionadaId?: string;
  // Arraste concluído em modo "parede"/"porta" — vira um traço novo.
  onSegmentoDesenhado?: (segmento: Segmento) => void;
  // Clique num traço já existente — abre ele pra excluir.
  onElementoClick?: (elemento: ElementoEstrutural) => void;
  elementoSelecionadoId?: string;
  // Marcador tracejado no ponto clicado, antes da mesa nova ser de fato salva — sem isso, clicar
  // no croqui não mudava nada visualmente ali (só nos campos do formulário abaixo), parecendo que
  // o clique não tinha feito nada.
  posicaoPendente?: { x: number; y: number } | null;
  // Formulário compacto de adicionar/editar mesa (ou excluir traço), aberto flutuando bem ao lado
  // do ponto clicado — achado numa conversa com o usuário: pra alguém leigo, ter que rolar a tela
  // até um formulário solto lá embaixo, sem nenhuma pista visual de que ele se referia ao clique
  // que acabou de dar, não parecia parte do mesmo fluxo.
  painel?: ReactNode;
  painelPosicao?: { x: number; y: number } | null;
}

function estiloPainel(posicao: { x: number; y: number }): React.CSSProperties {
  // Abre pro lado com mais espaço sobrando, em vez de sempre pro mesmo lado — evita que o painel
  // estoure a borda do croqui quando o clique é perto de uma quina.
  const abrirParaEsquerda = posicao.x > LARGURA / 2;
  const abrirParaCima = posicao.y > ALTURA - PAINEL_ALTURA - 24;
  return {
    [abrirParaEsquerda ? "right" : "left"]: abrirParaEsquerda
      ? LARGURA - posicao.x + 16
      : posicao.x + 16,
    [abrirParaCima ? "bottom" : "top"]: abrirParaCima
      ? ALTURA - posicao.y + 16
      : posicao.y - PAINEL_ALTURA / 3,
    width: PAINEL_LARGURA,
  };
}

function pontoMedio(el: Segmento): { x: number; y: number } {
  return { x: Math.round((el.x1 + el.x2) / 2), y: Math.round((el.y1 + el.y2) / 2) };
}

function comprimento(el: Segmento): number {
  return Math.hypot(el.x2 - el.x1, el.y2 - el.y1);
}

// Linha da parede/porta — duas <line>: uma visível (estilo por tipo) e uma invisível bem mais
// grossa por cima só pra facilitar o clique (o traço visível de uma parede tem 6px, praticamente
// impossível de acertar exatamente com o mouse sem essa área de clique maior).
function LinhaElemento({
  elemento,
  selecionado,
  clicavel,
  onClick,
}: {
  elemento: Segmento & { tipo: TipoElementoEstrutural };
  selecionado: boolean;
  clicavel: boolean;
  onClick?: () => void;
}) {
  const corParede = selecionado ? "var(--color-primary)" : "#5b5147";
  const corPorta = selecionado ? "var(--color-primary)" : "#b08968";
  return (
    <g
      onClick={clicavel ? onClick : undefined}
      style={{ cursor: clicavel ? "pointer" : undefined }}
    >
      <line
        x1={elemento.x1}
        y1={elemento.y1}
        x2={elemento.x2}
        y2={elemento.y2}
        stroke="transparent"
        strokeWidth={16}
        pointerEvents={clicavel ? "stroke" : "none"}
      />
      <line
        x1={elemento.x1}
        y1={elemento.y1}
        x2={elemento.x2}
        y2={elemento.y2}
        stroke={elemento.tipo === "parede" ? corParede : corPorta}
        strokeWidth={elemento.tipo === "parede" ? 6 : 4}
        strokeDasharray={elemento.tipo === "porta" ? "2 6" : undefined}
        strokeLinecap="round"
        pointerEvents="none"
      />
    </g>
  );
}

// Mapa clicável simples (RF10/croqui-salao.json), com parede/porta desenhadas por cima (achado
// numa conversa com o usuário: mesas soltas num plano em branco não davam pra reconhecer o salão
// de verdade). Cada mesa é um círculo posicionado por x/y (mesmas coordenadas usadas depois pelo
// mapa de reservas, T-FE-007); parede/porta são segmentos de reta livres, sem exigir formar um
// polígono fechado.
//
// Tamanho sempre fixo (640×420) — as mesas usam posicaoX/posicaoY em pixels reais, não
// proporcionais, então encolher o canvas (ex.: via maxWidth: "100%") cortaria mesas fora da
// borda em telas estreitas. Em vez disso, a rolagem horizontal do wrapper externo permite
// "arrastar" o croqui em telas menores, do mesmo jeito que as tabelas do resto do painel.
export function MesaCanvas({
  mesas,
  elementos,
  modo,
  onCanvasClick,
  onMesaClick,
  mesaSelecionadaId,
  onSegmentoDesenhado,
  onElementoClick,
  elementoSelecionadoId,
  posicaoPendente,
  painel,
  painelPosicao,
}: MesaCanvasProps) {
  const modoDesenho = modo !== "mesa";
  const interativoMesa = modo === "mesa" && !!onCanvasClick;
  const interativoDesenho = modoDesenho && !!onSegmentoDesenhado;

  const containerRef = useRef<HTMLDivElement>(null);
  const [arrastando, setArrastando] = useState<Segmento | null>(null);
  // O navegador ainda dispara um "click" nativo no elemento embaixo do cursor depois de um
  // arraste (mousedown → mousemove → mouseup conta como clique nesse elemento, mesmo tendo
  // movimento no meio) — achado testando na prática: desenhar uma porta cruzando por cima de uma
  // parede já existente também selecionava a parede pra excluir, como efeito colateral do mesmo
  // gesto. Essa ref marca "acabei de desenhar um traço de verdade" pra engolir esse clique
  // fantasma uma única vez.
  const acabouDeDesenharRef = useRef(false);

  function posicaoRelativa(clientX: number, clientY: number) {
    const retangulo = containerRef.current?.getBoundingClientRect();
    if (!retangulo) return { x: 0, y: 0 };
    return {
      x: Math.round(clientX - retangulo.left),
      y: Math.round(clientY - retangulo.top),
    };
  }

  useEffect(() => {
    if (!arrastando) return;

    function aoMover(evento: MouseEvent) {
      const { x, y } = posicaoRelativa(evento.clientX, evento.clientY);
      setArrastando((atual) => (atual ? { ...atual, x2: x, y2: y } : atual));
    }

    function aoSoltar(evento: MouseEvent) {
      const { x, y } = posicaoRelativa(evento.clientX, evento.clientY);
      setArrastando((atual) => {
        if (atual && onSegmentoDesenhado) {
          const finalizado = { ...atual, x2: x, y2: y };
          if (comprimento(finalizado) >= COMPRIMENTO_MINIMO_TRACO) {
            acabouDeDesenharRef.current = true;
            onSegmentoDesenhado(finalizado);
          }
        }
        return null;
      });
    }

    window.addEventListener("mousemove", aoMover);
    window.addEventListener("mouseup", aoSoltar);
    return () => {
      window.removeEventListener("mousemove", aoMover);
      window.removeEventListener("mouseup", aoSoltar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!arrastando, onSegmentoDesenhado]);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div
        ref={containerRef}
        role={interativoMesa ? "button" : undefined}
        tabIndex={interativoMesa ? 0 : undefined}
        aria-label={interativoMesa ? "Clique pra posicionar uma mesa nova" : undefined}
        onClick={(evento) => {
          if (!interativoMesa || !onCanvasClick) return;
          const { x, y } = posicaoRelativa(evento.clientX, evento.clientY);
          onCanvasClick({ x, y });
        }}
        onMouseDown={(evento) => {
          if (!interativoDesenho) return;
          const { x, y } = posicaoRelativa(evento.clientX, evento.clientY);
          setArrastando({ x1: x, y1: y, x2: x, y2: y });
        }}
        onKeyDown={(evento) => {
          if (!interativoMesa || !onCanvasClick) return;
          if (evento.key !== "Enter" && evento.key !== " ") return;
          evento.preventDefault();
          // Sem posição de mouse pra usar (interação por teclado) — cai no centro do croqui.
          onCanvasClick({ x: Math.round(LARGURA / 2), y: Math.round(ALTURA / 2) });
        }}
        className="relative bg-card"
        style={{
          width: LARGURA,
          height: ALTURA,
          cursor: interativoMesa ? "crosshair" : interativoDesenho ? "crosshair" : "default",
        }}
      >
        {mesas.length === 0 && elementos.length === 0 && !posicaoPendente && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm text-muted-foreground">
            {interativoMesa
              ? "Clique no croqui para posicionar a primeira mesa."
              : "Nenhuma mesa cadastrada ainda."}
          </p>
        )}

        <svg
          className="pointer-events-none absolute inset-0"
          width={LARGURA}
          height={ALTURA}
          aria-hidden="true"
        >
          {/* Parede sempre desenhada antes de porta — porta costuma marcar uma abertura bem em
              cima de uma parede, e a ordem que a API devolve os elementos não é garantida; sem
              isso, uma parede podia acabar pintada por cima da porta, escondendo o traço
              pontilhado dela. */}
          {[...elementos]
            .sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === "porta" ? 1 : -1))
            .map((elemento) => (
              <LinhaElemento
                key={elemento.id}
                elemento={elemento}
                selecionado={elemento.id === elementoSelecionadoId}
                clicavel={!!onElementoClick}
                onClick={() => {
                  if (acabouDeDesenharRef.current) {
                    acabouDeDesenharRef.current = false;
                    return;
                  }
                  onElementoClick?.(elemento);
                }}
              />
            ))}
          {arrastando && (
            <line
              x1={arrastando.x1}
              y1={arrastando.y1}
              x2={arrastando.x2}
              y2={arrastando.y2}
              stroke="var(--color-primary)"
              strokeWidth={modo === "porta" ? 4 : 6}
              strokeDasharray={modo === "porta" ? "2 6" : "8 4"}
              strokeLinecap="round"
              pointerEvents="none"
            />
          )}
        </svg>

        {mesas.map((mesa) => {
          const selecionada = mesa.id === mesaSelecionadaId;
          return (
            <div
              key={mesa.id}
              role={onMesaClick && modo === "mesa" ? "button" : undefined}
              tabIndex={onMesaClick && modo === "mesa" ? 0 : undefined}
              onClick={(evento) => {
                if (!onMesaClick || modo !== "mesa") return;
                evento.stopPropagation();
                onMesaClick(mesa);
              }}
              onKeyDown={(evento) => {
                if (!onMesaClick || modo !== "mesa") return;
                if (evento.key !== "Enter" && evento.key !== " ") return;
                evento.preventDefault();
                evento.stopPropagation();
                onMesaClick(mesa);
              }}
              className={`absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-semibold outline-none transition-colors ${
                selecionada
                  ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/40"
                  : "border-secondary bg-secondary/10 text-secondary"
              } ${onMesaClick && modo === "mesa" ? "cursor-pointer hover:bg-secondary/20" : ""} ${
                modo !== "mesa" ? "opacity-40" : ""
              }`}
              style={{ left: mesa.posicaoX, top: mesa.posicaoY }}
              title={
                onMesaClick && modo === "mesa"
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
        {painel && painelPosicao && (
          <div
            className="absolute z-10 rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg"
            style={estiloPainel(painelPosicao)}
            onClick={(evento) => evento.stopPropagation()}
            onKeyDown={(evento) => evento.stopPropagation()}
          >
            {painel}
          </div>
        )}
      </div>
    </div>
  );
}

export { pontoMedio as pontoMedioElemento };
export const MESA_CANVAS_LARGURA = LARGURA;
export const MESA_CANVAS_ALTURA = ALTURA;
