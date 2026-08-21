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

export interface SalaoComMesas {
  salao: Salao;
  mesas: Mesa[];
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
