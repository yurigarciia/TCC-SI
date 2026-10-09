export interface Salao {
  id: string;
  nome: string;
  capacidadeTotal: number;
}

export type FormatoMesa = "redonda" | "retangular";

export interface Mesa {
  id: string;
  salaoId: string;
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
  formato: FormatoMesa;
}

export type TipoElementoEstrutural = "parede" | "porta";

// Traço de parede ou porta desenhado no croqui — segmento de reta simples (dois pontos), mesmo
// plano cartesiano das mesas. Achado numa conversa com o usuário: mesas soltas num plano em
// branco não davam pra reconhecer o salão de verdade.
export interface ElementoEstrutural {
  id: string;
  salaoId: string;
  tipo: TipoElementoEstrutural;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Área retangular nomeada livremente (ex.: "Tablado", "Bar", "Pista de dança") — sem enum de
// tipos fixos de propósito, ver nota em AreaEstrutural no backend.
export interface AreaEstrutural {
  id: string;
  salaoId: string;
  nome: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface SalaoComMesas {
  salao: Salao;
  mesas: Mesa[];
  elementos: ElementoEstrutural[];
  areas: AreaEstrutural[];
}

export interface NovoSalaoInput {
  nome: string;
  capacidadeTotal: number;
}

export interface NovaMesaInput {
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
  formato?: FormatoMesa;
}

export interface AtualizarMesaInput {
  numero?: number;
  capacidade?: number;
  posicaoX?: number;
  posicaoY?: number;
  formato?: FormatoMesa;
}

export interface NovoElementoEstruturalInput {
  tipo: TipoElementoEstrutural;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface NovaAreaEstruturalInput {
  nome: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface AtualizarAreaEstruturalInput {
  nome?: string;
  x?: number;
  y?: number;
  largura?: number;
  altura?: number;
}
