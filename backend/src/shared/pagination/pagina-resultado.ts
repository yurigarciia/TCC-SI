export interface PaginaResultado<T> {
  itens: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export function montarPaginaResultado<T>(
  itens: T[],
  total: number,
  pagina: number,
  limite: number,
): PaginaResultado<T> {
  return {
    itens,
    total,
    pagina,
    limite,
    totalPaginas: Math.max(1, Math.ceil(total / limite)),
  };
}
