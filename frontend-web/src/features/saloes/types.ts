export interface Salao {
  id: string;
  nome: string;
  capacidadeTotal: number;
}

export interface Mesa {
  id: string;
  salaoId: string;
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
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

export interface SalaoComMesas {
  salao: Salao;
  mesas: Mesa[];
  elementos: ElementoEstrutural[];
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
}

export interface AtualizarMesaInput {
  numero?: number;
  capacidade?: number;
  posicaoX?: number;
  posicaoY?: number;
}

export interface NovoElementoEstruturalInput {
  tipo: TipoElementoEstrutural;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
