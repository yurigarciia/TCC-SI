import { CategoriaSocio } from '../../domain/categoria-socio.entity';

export interface NovaCategoriaSocio {
  nome: string;
  valorMensalidade: number;
  isenta: boolean;
}

export interface AtualizacaoCategoriaSocio {
  nome?: string;
  valorMensalidade?: number;
  isenta?: boolean;
}

export abstract class CategoriaSocioRepositoryPort {
  abstract salvar(dados: NovaCategoriaSocio): Promise<CategoriaSocio>;
  abstract buscarPorId(id: string): Promise<CategoriaSocio | null>;
  abstract listarPaginado(
    pagina: number,
    limite: number,
    busca?: string,
  ): Promise<{ itens: CategoriaSocio[]; total: number }>;
  abstract atualizar(
    id: string,
    dados: AtualizacaoCategoriaSocio,
  ): Promise<CategoriaSocio>;
  abstract excluir(id: string): Promise<void>;
  // Usado pela exclusão pra recusar categorias ainda vinculadas a algum associado (ver
  // ExcluirCategoriaSocioUseCase) — mesmo padrão de MesaRepositoryPort.estaEmUso.
  abstract contarAssociadosVinculados(categoriaId: string): Promise<number>;
}
