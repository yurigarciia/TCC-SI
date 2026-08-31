// Contrato compartilhado com o backend (ver backend/src/shared/pagination/pagina-resultado.ts)
// — toda listagem paginada da API responde nesse formato.
export interface PaginaResultado<T> {
  itens: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export const LIMITE_PADRAO = 20;
