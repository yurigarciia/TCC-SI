export type StatusIngresso = "emitido" | "usado";
export type PerfilAcompanhante = "nao_socio" | "crianca";

export interface PrecosAcompanhante {
  naoSocio: number | null;
  crianca: number | null;
}

export interface IngressoDoAssociado {
  id: string;
  status: StatusIngresso;
  preco: number;
  usadoEm: string | null;
  evento: { id: string; nome: string; data: string; local: string } | null;
}
