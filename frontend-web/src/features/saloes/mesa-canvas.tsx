"use client";

import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import type {
  AreaEstrutural,
  ElementoEstrutural,
  Mesa,
  TipoElementoEstrutural,
} from "./types";

const LARGURA = 640;
const ALTURA = 420;

// Tamanho da grade de fundo (px) — mesas e áreas "grudam" nela ao soltar/arrastar, pra ficar
// fácil alinhar em fileira sem precisar de pulso de cirurgião (achado numa conversa com o
// usuário: posicionar livre deixava tudo um pouquinho torto).
const GRADE = 20;

// Distância mínima (em pixels) pra um arraste de item já existente virar de fato um "mover" — sem
// isso, um simples clique (sem mover quase nada) seria tratado como mover 1px em vez de abrir o
// painel de editar.
const MOVIMENTO_MINIMO = 6;

// Largura/altura aproximadas do painel flutuante — só pra decidir de que lado do ponto clicado ele
// abre, sem estourar a borda do croqui (ver `estiloPainel`).
const PAINEL_LARGURA = 224;
const PAINEL_ALTURA = 190;

// Itens arrastáveis da paleta lateral (ver PaletaCroqui) — soltar um deles no croqui cria o item
// na hora, já com valores padrão sensatos; quem usa ajusta depois clicando nele (numero/lugares,
// nome da área) ou arrastando pra reposicionar. Substitui o fluxo antigo de "clique no croqui →
// formulário → confirmar", achado pouco intuitivo numa conversa com o usuário.
export type ItemPaleta = "mesa-redonda" | "mesa-retangular" | "parede" | "porta" | "area";

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

type EstadoArraste =
  | { tipo: "mesa"; mesaId: string; x: number; y: number; moveu: boolean }
  | { tipo: "area"; areaId: string; x: number; y: number; moveu: boolean };

interface MesaCanvasProps {
  mesas: Mesa[];
  elementos: ElementoEstrutural[];
  areas: AreaEstrutural[];
  // Item da paleta lateral solto dentro do croqui — cria na posição onde foi solto (já alinhada
  // à grade). Mesa/área nascem com valores padrão; editar fica pro clique, depois de criado.
  onItemSolto?: (item: ItemPaleta, posicao: Ponto) => void;
  // Clique numa mesa já existente — abre ela pra editar (número/lugares/formato) ou excluir.
  onMesaClick?: (mesa: Mesa) => void;
  // Arraste concluído numa mesa já existente — move ela pra posição nova (já alinhada à grade).
  onMesaArrastada?: (mesa: Mesa, posicao: Ponto) => void;
  mesaSelecionadaId?: string;
  // Clique num traço já existente — abre ele pra excluir (parede/porta não são arrastáveis pra
  // reposicionar — a API ainda não tem PATCH pra elas; errou o lugar, exclui e solta de novo).
  onElementoClick?: (elemento: ElementoEstrutural) => void;
  elementoSelecionadoId?: string;
  // Clique numa área já existente — abre ela pra renomear ou excluir.
  onAreaClick?: (area: AreaEstrutural) => void;
  // Arraste concluído numa área já existente — move ela (mesma lógica de onMesaArrastada).
  onAreaArrastada?: (area: AreaEstrutural, posicao: Ponto) => void;
  areaSelecionadaId?: string;
  // Formulário compacto de editar mesa/área (ou excluir traço), aberto flutuando bem ao lado do
  // item clicado — achado numa conversa com o usuário: pra alguém leigo, ter que rolar a tela até
  // um formulário solto lá embaixo, sem nenhuma pista visual de a que ele se referia, não parecia
  // parte do mesmo fluxo.
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
// nomeado livremente (tablado, bar, pista de dança...). Todo item novo nasce arrastando da
// paleta lateral (ver PaletaCroqui) até aqui dentro — nada se cria mais clicando no croqui vazio.
//
// Tamanho sempre fixo (640×420) — as mesas usam posicaoX/posicaoY em pixels reais, não
// proporcionais, então encolher o canvas (ex.: via maxWidth: "100%") cortaria mesas fora da
// borda em telas estreitas. Em vez disso, a rolagem horizontal do wrapper externo permite
// "arrastar" o croqui em telas menores, do mesmo jeito que as tabelas do resto do painel.
export function MesaCanvas({
  mesas,
  elementos,
  areas,
  onItemSolto,
  onMesaClick,
  onMesaArrastada,
  mesaSelecionadaId,
  onElementoClick,
  elementoSelecionadoId,
  onAreaClick,
  onAreaArrastada,
  areaSelecionadaId,
  painel,
  painelPosicao,
}: MesaCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [arraste, setArraste] = useState<EstadoArraste | null>(null);
  const [sobrevoandoPaleta, setSobrevoandoPaleta] = useState(false);
  // O navegador ainda dispara um "click" nativo no elemento embaixo do cursor depois de um
  // arraste (mousedown → mousemove → mouseup conta como clique nesse elemento, mesmo tendo
  // movimento no meio) — essa ref marca "acabei de arrastar de verdade" pra engolir esse clique
  // fantasma uma única vez, sem reabrir o painel de editar logo depois de mover.
  const acabouDeArrastarRef = useRef(false);

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
      const gx = arredondarGrade(x);
      const gy = arredondarGrade(y);
      setArraste((atual) => {
        if (!atual) return atual;
        const moveu = atual.moveu || Math.hypot(gx - atual.x, gy - atual.y) >= MOVIMENTO_MINIMO;
        return { ...atual, x: gx, y: gy, moveu };
      });
    }

    function aoSoltar() {
      setArraste((atual) => {
        if (!atual) return atual;

        if (atual.tipo === "mesa") {
          const mesa = mesas.find((m) => m.id === atual.mesaId);
          if (mesa && atual.moveu && onMesaArrastada) {
            acabouDeArrastarRef.current = true;
            onMesaArrastada(mesa, { x: atual.x, y: atual.y });
          } else if (mesa && !atual.moveu && onMesaClick) {
            onMesaClick(mesa);
          }
        }

        if (atual.tipo === "area") {
          const area = areas.find((a) => a.id === atual.areaId);
          if (area && atual.moveu && onAreaArrastada) {
            acabouDeArrastarRef.current = true;
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
  }, [!!arraste, onMesaArrastada, onMesaClick, onAreaArrastada, onAreaClick]);

  function aoArrastarSobre(evento: DragEvent<HTMLDivElement>) {
    if (!onItemSolto) return;
    evento.preventDefault();
    evento.dataTransfer.dropEffect = "copy";
    setSobrevoandoPaleta(true);
  }

  function aoSoltarDaPaleta(evento: DragEvent<HTMLDivElement>) {
    if (!onItemSolto) return;
    evento.preventDefault();
    setSobrevoandoPaleta(false);
    const item = evento.dataTransfer.getData("text/plain") as ItemPaleta;
    if (!item) return;
    const { x, y } = posicaoRelativa(evento.clientX, evento.clientY);
    onItemSolto(item, { x: arredondarGrade(x), y: arredondarGrade(y) });
  }

  const semNadaAinda = mesas.length === 0 && elementos.length === 0 && areas.length === 0;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div
        ref={containerRef}
        onDragOver={aoArrastarSobre}
        onDragLeave={() => setSobrevoandoPaleta(false)}
        onDrop={aoSoltarDaPaleta}
        className={`relative overflow-hidden bg-[#fdfaf4] transition-shadow ${
          sobrevoandoPaleta ? "ring-4 ring-primary/30 ring-inset" : ""
        }`}
        style={{ width: LARGURA, height: ALTURA }}
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
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-12 text-center text-sm text-muted-foreground">
            Arraste um item do menu ao lado e solte aqui pra começar o croqui.
          </p>
        )}

        {/* Áreas (tablado, bar, pista de dança...) — chão por baixo de parede/mesa. */}
        {areas.map((area) => {
          const emArraste = arraste?.tipo === "area" && arraste.areaId === area.id ? arraste : null;
          const x = emArraste ? emArraste.x : area.x;
          const y = emArraste ? emArraste.y : area.y;
          const selecionada = area.id === areaSelecionadaId;
          const clicavel = !!onAreaClick || !!onAreaArrastada;
          return (
            <div
              key={area.id}
              role={clicavel ? "button" : undefined}
              tabIndex={clicavel ? 0 : undefined}
              onMouseDown={(evento) => {
                if (!clicavel) return;
                evento.stopPropagation();
                setArraste({ tipo: "area", areaId: area.id, x: area.x, y: area.y, moveu: false });
              }}
              onClick={(evento) => {
                if (!clicavel) return;
                evento.stopPropagation();
                if (acabouDeArrastarRef.current) {
                  acabouDeArrastarRef.current = false;
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
              } ${clicavel ? "cursor-move hover:bg-[#c9a15a]/20" : ""}`}
              style={{ left: x, top: y, width: area.largura, height: area.altura }}
              title={area.nome}
            >
              <span className="truncate px-2">{area.nome}</span>
            </div>
          );
        })}

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
                onClick={() => onElementoClick?.(elemento)}
              />
            ))}
        </svg>

        {mesas.map((mesa) => {
          const emArraste = arraste?.tipo === "mesa" && arraste.mesaId === mesa.id ? arraste : null;
          const x = emArraste ? emArraste.x : mesa.posicaoX;
          const y = emArraste ? emArraste.y : mesa.posicaoY;
          const selecionada = mesa.id === mesaSelecionadaId;
          const arrastando = !!emArraste?.moveu;
          const interativa = !!onMesaClick || !!onMesaArrastada;
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
                arrastando ? "scale-110 shadow-lg" : ""
              }`}
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
