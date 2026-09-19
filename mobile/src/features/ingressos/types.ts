export type StatusIngresso = "emitido" | "usado";

export interface IngressoDoAssociado {
  id: string;
  status: StatusIngresso;
  preco: number;
  usadoEm: string | null;
  evento: { id: string; nome: string; data: string; local: string } | null;
}
