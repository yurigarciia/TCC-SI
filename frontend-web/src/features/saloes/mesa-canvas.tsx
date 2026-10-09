"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type {
  AreaEstrutural,
  ElementoEstrutural,
  Mesa,
  TipoElementoEstrutural,
} from "./types";

const LARGURA = 640;
const ALTURA = 420;

// Tamanho da grade de fundo (px) — mesas e áreas "grudam" nela ao arrastar, pra ficar fácil
// alinhar em fileira sem precisar de pulso de cirurgião (achado numa conversa com o usuário:
// arrastar mesa livre deixava tudo um pouquinho torto).
const GRADE = 20;

// Distância mínima (em pixels) pra um arraste virar de fato uma ação — sem isso, um simples
// clique (sem mover quase nada) seria tratado como "mover 1px" ou criaria um traço/área de
// tamanho ~0, invisível e sem sentido nenhum no croqui.
const MOVIMENTO_MINIMO = 6;
const COMPRIMENTO_MINIMO_TRACO = 12;
const TAMANHO_MINIMO_AREA = 24;

// Largura/altura aproximadas do painel flutuante — só pra decidir de que lado do ponto clicado ele
// abre, sem estourar a borda do croqui (ver `estiloPainel`).
const PAINEL_LARGURA = 224;
const PAINEL_ALTURA = 190;

export type ModoCroqui = "mesa" | "parede" | "porta" | "area";

interface Ponto {
  x: number;
  y: number;
}

interface Segmento {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Retangulo {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

type EstadoArraste =
  | { tipo: "traco"; seg: Segmento }
  | { tipo: "area-nova"; seg: Segmento }
  | { tipo: "mesa"; mesaId: string; x: number; y: number; moveu: boolean }
  | { tipo: "area-mover"; areaId: string; x: number; y: number; moveu: boolean };

interface MesaCanvasProps {
  mesas: Mesa[];
  elementos: ElementoEstrutural[];
  areas: AreaEstrutural[];
  // Qual ferramenta está ativa — decide o que um clique/arraste no croqui faz. "mesa" mantém o
  // comportamento de sempre (clique posiciona mesa, arraste move mesa existente); "parede"/"porta"
  // arrastam um traço; "area" arrasta um retângulo nomeado (tablado, bar, pista de dança...).
  modo: ModoCroqui;
  // Clique em área vazia do croqui (só faz sentido em modo "mesa") — posiciona uma mesa nova.
  onCanvasClick?: (posicao: Ponto) => void;
  // Clique numa mesa já existente — abre ela pra editar.
  onMesaClick?: (mesa: Mesa) => void;
  // Arraste concluído numa mesa já existente — move ela pra posição nova (já alinhada à grade),
  // sem precisar abrir o painel e confirmar num formulário à parte.
  onMesaArrastada?: (mesa: Mesa, posicao: Ponto) => void;
  mesaSelecionadaId?: string;
  // Arraste concluído em modo "parede"/"porta" — vira um traço novo.
  onSegmentoDesenhado?: (segmento: Segmento) => void;
  // Clique num traço já existente — abre ele pra excluir.
  onElementoClick?: (elemento: ElementoEstrutural) => void;
  elementoSelecionadoId?: string;
  // Arraste concluído em modo "area", começando em espaço vazio — vira uma área nova.
  onAreaDesenhada?: (retangulo: Retangulo) => void;
  // Clique numa área já existente — abre ela pra renomear/excluir.
  onAreaClick?: (area: AreaEstrutural) => void;
  // Arraste concluído numa área já existente — move ela (mesma lógica de onMesaArrastada).
  onAreaArrastada?: (area: AreaEstrutural, posicao: Ponto) => void;
  areaSelecionadaId?: string;
  // Marcador tracejado no ponto clicado, antes da mesa nova ser de fato salva — sem isso, clicar
  // no croqui não mudava nada visualmente ali (só nos campos do formulário abaixo), parecendo que
  // o clique não tinha feito nada.
  posicaoPendente?: Ponto | null;
  // Formulário compacto de adicionar/editar mesa (ou excluir traço), aberto flutuando bem ao lado
  // do ponto clicado — achado numa conversa com o usuário: pra alguém leigo, ter que rolar a tela
  // até um formulário solto lá embaixo, sem nenhuma pista visual de que ele se referia ao clique
  // que acabou de dar, não parecia parte do mesmo fluxo.
  painel?: ReactNode;
  painelPosicao?: Ponto | null;
}

function arredondarGrade(valor: number): number {
  return Math.round(valor / GRADE) * GRADE;
}

function estiloPainel(posicao: Ponto): React.CSSProperties {
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

function pontoMedio(el: Segmento): Ponto {
  return { x: Math.round((el.x1 + el.x2) / 2), y: Math.round((el.y1 + el.y2) / 2) };
}

function comprimento(el: Segmento): number {
  return Math.hypot(el.x2 - el.x1, el.y2 - el.y1);
}

function normalizarRetangulo(seg: Segmento): Retangulo {
  return {
    x: Math.min(seg.x1, seg.x2),
    y: Math.min(seg.y1, seg.y2),
    largura: Math.abs(seg.x2 - seg.x1),
    altura: Math.abs(seg.y2 - seg.y1),
  };
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

// Mapa clicável simples (RF10/croqui-salao.json), com parede/porta/área desenhadas por cima
// (achado numa conversa com o usuário: mesas soltas num plano em branco não davam pra reconhecer
// o salão de verdade). Cada mesa é posicionada por x/y (mesmas coordenadas usadas depois pelo
// mapa de reservas, T-FE-007); parede/porta são segmentos de reta livres; área é um retângulo
// nomeado livremente (tablado, bar, pista de dança...).
//
// Tamanho sempre fixo (640×420) — as mesas usam posicaoX/posicaoY em pixels reais, não
// proporcionais, então encolher o canvas (ex.: via maxWidth: "100%") cortaria mesas fora da
// borda em telas estreitas. Em vez disso, a rolagem horizontal do wrapper externo permite
// "arrastar" o croqui em telas menores, do mesmo jeito que as tabelas do resto do painel.
export function MesaCanvas({
  mesas,
  elementos,
  areas,
  modo,
  onCanvasClick,
  onMesaClick,
  onMesaArrastada,
  mesaSelecionadaId,
  onSegmentoDesenhado,
  onElementoClick,
  elementoSelecionadoId,
  onAreaDesenhada,
  onAreaClick,
  onAreaArrastada,
  areaSelecionadaId,
  posicaoPendente,
  painel,
  painelPosicao,
}: MesaCanvasProps) {
  const modoDesenho = modo === "parede" || modo === "porta";
  const interativoMesa = modo === "mesa" && !!onCanvasClick;
  const interativoDesenho = modoDesenho && !!onSegmentoDesenhado;
  const interativoArea = modo === "area" && !!onAreaDesenhada;

  const containerRef = useRef<HTMLDivElement>(null);
  const [arraste, setArraste] = useState<EstadoArraste | null>(null);
  // O navegador ainda dispara um "click" nativo no elemento embaixo do cursor depois de um
  // arraste (mousedown → mousemove → mouseup conta como clique nesse elemento, mesmo tendo
  // movimento no meio) — achado testando na prática: desenhar uma porta cruzando por cima de uma
  // parede já existente também selecionava a parede pra excluir, como efeito colateral do mesmo
  // gesto. Essa ref marca "acabei de desenhar/arrastar de verdade" pra engolir esse clique
  // fantasma uma única vez.
  const acabouDeAgirRef = useRef(false);

  function posicaoRelativa(clientX: number, clientY: number): Ponto {
    const retangulo = containerRef.current?.getBoundingClientRect();
    if (!retangulo) return { x: 0, y: 0 };
    return {
      x: Math.round(clientX - retangulo.left),
      y: Math.round(clientY - retangulo.top),
    };
  }

  useEffect(() => {
    if (!arraste) return;

    function aoMover(evento: MouseEvent) {
      const { x, y } = posicaoRelativa(evento.clientX, evento.clientY);
      setArraste((atual) => {
        if (!atual) return atual;
        if (atual.tipo === "traco" || atual.tipo === "area-nova") {
          return { ...atual, seg: { ...atual.seg, x2: x, y2: y } };
        }
        const gx = arredondarGrade(x);
        const gy = arredondarGrade(y);
        const moveu =
          atual.moveu || Math.hypot(gx - atual.x, gy - atual.y) >= MOVIMENTO_MINIMO;
        return { ...atual, x: gx, y: gy, moveu };
      });
    }

    function aoSoltar(evento: MouseEvent) {
      const { x, y } = posicaoRelativa(evento.clientX, evento.clientY);
      setArraste((atual) => {
        if (!atual) return atual;

        if (atual.tipo === "traco" && onSegmentoDesenhado) {
          const finalizado = { ...atual.seg, x2: x, y2: y };
          if (comprimento(finalizado) >= COMPRIMENTO_MINIMO_TRACO) {
            acabouDeAgirRef.current = true;
            onSegmentoDesenhado(finalizado);
          }
        }

        if (atual.tipo === "area-nova" && onAreaDesenhada) {
          const retangulo = normalizarRetangulo({ ...atual.seg, x2: x, y2: y });
          if (retangulo.largura >= TAMANHO_MINIMO_AREA && retangulo.altura >= TAMANHO_MINIMO_AREA) {
            acabouDeAgirRef.current = true;
            onAreaDesenhada({
              x: arredondarGrade(retangulo.x),
              y: arredondarGrade(retangulo.y),
              largura: retangulo.largura,
              altura: retangulo.altura,
            });
          }
        }

        if (atual.tipo === "mesa") {
          const mesa = mesas.find((m) => m.id === atual.mesaId);
          if (mesa && atual.moveu && onMesaArrastada) {
            acabouDeAgirRef.current = true;
            onMesaArrastada(mesa, { x: atual.x, y: atual.y });
          } else if (mesa && !atual.moveu && onMesaClick) {
            onMesaClick(mesa);
          }
        }

        if (atual.tipo === "area-mover") {
          const area = areas.find((a) => a.id === atual.areaId);
          if (area && atual.moveu && onAreaArrastada) {
            acabouDeAgirRef.current = true;
            onAreaArrastada(area, { x: atual.x, y: atual.y });
          } else if (area && !atual.moveu && onAreaClick) {
            onAreaClick(area);
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
  }, [!!arraste, onSegmentoDesenhado, onAreaDesenhada, onMesaArrastada, onMesaClick, onAreaArrastada, onAreaClick]);

  const semNadaAinda =
    mesas.length === 0 && elementos.length === 0 && areas.length === 0 && !posicaoPendente;

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
          if (!interativoDesenho && !interativoArea) return;
          const { x, y } = posicaoRelativa(evento.clientX, evento.clientY);
          setArraste({
            tipo: interativoArea ? "area-nova" : "traco",
            seg: { x1: x, y1: y, x2: x, y2: y },
          });
        }}
        onKeyDown={(evento) => {
          if (!interativoMesa || !onCanvasClick) return;
          if (evento.key !== "Enter" && evento.key !== " ") return;
          evento.preventDefault();
          // Sem posição de mouse pra usar (interação por teclado) — cai no centro do croqui.
          onCanvasClick({ x: Math.round(LARGURA / 2), y: Math.round(ALTURA / 2) });
        }}
        className="relative overflow-hidden bg-[#fdfaf4]"
        style={{
          width: LARGURA,
          height: ALTURA,
          cursor: interativoMesa || interativoDesenho || interativoArea ? "crosshair" : "default",
        }}
      >
        {/* Grade de fundo — puramente visual/de alinhamento, nunca captura clique. */}
        <svg className="pointer-events-none absolute inset-0" width={LARGURA} height={ALTURA} aria-hidden="true">
          <defs>
            <pattern id="grade-croqui" width={GRADE} height={GRADE} patternUnits="userSpaceOnUse">
              <path
                d={`M ${GRADE} 0 L 0 0 0 ${GRADE}`}
                fill="none"
                stroke="#e4d8c3"
                strokeWidth={1}
              />
            </pattern>
            <radialGradient id="piso-croqui" cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#fffdf9" />
              <stop offset="100%" stopColor="#f3ead9" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#piso-croqui)" />
          <rect width="100%" height="100%" fill="url(#grade-croqui)" />
        </svg>

        {semNadaAinda && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm text-muted-foreground">
            {interativoMesa
              ? "Clique no croqui para posicionar a primeira mesa."
              : "Nenhuma mesa cadastrada ainda."}
          </p>
        )}

        {/* Áreas (tablado, bar, pista de dança...) — chão por baixo de parede/mesa. */}
        {areas.map((area) => {
          const emArraste =
            arraste?.tipo === "area-mover" && arraste.areaId === area.id ? arraste : null;
          const x = emArraste ? emArraste.x : area.x;
          const y = emArraste ? emArraste.y : area.y;
          const selecionada = area.id === areaSelecionadaId;
          const clicavel = modo === "area" && (!!onAreaClick || !!onAreaArrastada);
          return (
            <div
              key={area.id}
              role={clicavel ? "button" : undefined}
              tabIndex={clicavel ? 0 : undefined}
              onMouseDown={(evento) => {
                if (!clicavel) return;
                evento.stopPropagation();
                setArraste({ tipo: "area-mover", areaId: area.id, x: area.x, y: area.y, moveu: false });
              }}
              onClick={(evento) => {
                if (!clicavel) return;
                evento.stopPropagation();
                if (acabouDeAgirRef.current) {
                  acabouDeAgirRef.current = false;
                  return;
                }
              }}
              onKeyDown={(evento) => {
                if (!clicavel || !onAreaClick) return;
                if (evento.key !== "Enter" && evento.key !== " ") return;
                evento.preventDefault();
                onAreaClick(area);
              }}
              className={`absolute flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-xs font-medium transition-colors ${
                selecionada
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[#c9a15a] bg-[#c9a15a]/10 text-[#8a6a2e]"
              } ${clicavel ? "cursor-move hover:bg-[#c9a15a]/20" : ""} ${modo !== "area" ? "opacity-70" : ""}`}
              style={{ left: x, top: y, width: area.largura, height: area.altura }}
              title={area.nome}
            >
              <span className="truncate px-2">{area.nome}</span>
            </div>
          );
        })}
        {arraste?.tipo === "area-nova" && (
          <div
            className="pointer-events-none absolute rounded-xl border-2 border-dashed border-primary bg-primary/10"
            style={{
              left: Math.min(arraste.seg.x1, arraste.seg.x2),
              top: Math.min(arraste.seg.y1, arraste.seg.y2),
              width: Math.abs(arraste.seg.x2 - arraste.seg.x1),
              height: Math.abs(arraste.seg.y2 - arraste.seg.y1),
            }}
          />
        )}

        {/* Parede/porta — sempre parede antes de porta, porta costuma marcar uma abertura bem em
            cima de uma parede, e a ordem que a API devolve os elementos não é garantida; sem
            isso, uma parede podia acabar pintada por cima da porta, escondendo o traço
            pontilhado dela. */}
        <svg className="pointer-events-none absolute inset-0" width={LARGURA} height={ALTURA} aria-hidden="true">
          {[...elementos]
            .sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === "porta" ? 1 : -1))
            .map((elemento) => (
              <LinhaElemento
                key={elemento.id}
                elemento={elemento}
                selecionado={elemento.id === elementoSelecionadoId}
                clicavel={!!onElementoClick}
                onClick={() => {
                  if (acabouDeAgirRef.current) {
                    acabouDeAgirRef.current = false;
                    return;
                  }
                  onElementoClick?.(elemento);
                }}
              />
            ))}
          {arraste?.tipo === "traco" && (
            <line
              x1={arraste.seg.x1}
              y1={arraste.seg.y1}
              x2={arraste.seg.x2}
              y2={arraste.seg.y2}
              stroke="var(--color-primary)"
              strokeWidth={modo === "porta" ? 4 : 6}
              strokeDasharray={modo === "porta" ? "2 6" : "8 4"}
              strokeLinecap="round"
              pointerEvents="none"
            />
          )}
        </svg>

        {mesas.map((mesa) => {
          const emArraste =
            arraste?.tipo === "mesa" && arraste.mesaId === mesa.id ? arraste : null;
          const x = emArraste ? emArraste.x : mesa.posicaoX;
          const y = emArraste ? emArraste.y : mesa.posicaoY;
          const selecionada = mesa.id === mesaSelecionadaId;
          const arrastando = !!emArraste?.moveu;
          const interativa = (!!onMesaClick || !!onMesaArrastada) && modo === "mesa";
          return (
            <div
              key={mesa.id}
              role={interativa ? "button" : undefined}
              tabIndex={interativa ? 0 : undefined}
              onMouseDown={(evento) => {
                if (!interativa) return;
                evento.stopPropagation();
                setArraste({ tipo: "mesa", mesaId: mesa.id, x: mesa.posicaoX, y: mesa.posicaoY, moveu: false });
              }}
              onClick={(evento) => evento.stopPropagation()}
              onKeyDown={(evento) => {
                if (!interativa || !onMesaClick) return;
                if (evento.key !== "Enter" && evento.key !== " ") return;
                evento.preventDefault();
                evento.stopPropagation();
                onMesaClick(mesa);
              }}
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 text-xs font-semibold outline-none shadow-sm transition-colors ${
                mesa.formato === "retangular" ? "h-9 w-14 rounded-lg" : "size-10 rounded-full"
              } ${
                selecionada
                  ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/40"
                  : "border-secondary bg-secondary/10 text-secondary"
              } ${interativa ? "cursor-move hover:bg-secondary/20" : ""} ${
                modo !== "mesa" ? "opacity-40" : ""
              } ${arrastando ? "scale-110 shadow-lg" : ""}`}
              style={{ left: x, top: y }}
              title={
                interativa
                  ? `Mesa ${mesa.numero} — ${mesa.capacidade} lugares (arraste pra mover, clique pra editar)`
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

export function pontoMedioArea(area: AreaEstrutural): Ponto {
  return {
    x: Math.round(area.x + area.largura / 2),
    y: Math.round(area.y + area.altura / 2),
  };
}

export { pontoMedio as pontoMedioElemento };
export const MESA_CANVAS_LARGURA = LARGURA;
export const MESA_CANVAS_ALTURA = ALTURA;
