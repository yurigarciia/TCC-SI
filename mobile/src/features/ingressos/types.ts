export type StatusIngresso = "emitido" | "usado";
export type PerfilAcompanhante = "nao_socio" | "crianca";

export interface PrecosAcompanhante {
  naoSocio: number | null;
  crianca: number | null;
}

export interface IngressoDoAssociado {
  id: string;
  // Contador sequencial por evento (1, 2, 3...) — identificador curto e legível, diferente do
  // `id` (UUID) usado no QR. Importante quando o mesmo associado compra vários ingressos
  // (acompanhantes) pro mesmo evento.
  codigo: number;
  nomeComprador: string;
  status: StatusIngresso;
  preco: number;
  usadoEm: string | null;
  evento: { id: string; nome: string; data: string; local: string } | null;
}
