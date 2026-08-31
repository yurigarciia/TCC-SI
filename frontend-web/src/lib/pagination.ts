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

// Monta a query string comum a toda listagem paginada — `busca` é opcional (nem todo endpoint
// tinha campo de busca desde o início, ver PLANEJAMENTO-GERAL.md).
export function construirQueryPaginacao(pagina: number, limite: number, busca?: string): string {
  const params = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
  if (busca) params.set("busca", busca);
  return params.toString();
}
