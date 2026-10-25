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
  ativa?: boolean;
}

export abstract class CategoriaSocioRepositoryPort {
  abstract salvar(dados: NovaCategoriaSocio): Promise<CategoriaSocio>;
  abstract buscarPorId(id: string): Promise<CategoriaSocio | null>;
  // Versão em lote de buscarPorId — uma query pra buscar várias categorias de uma vez. Usado por
  // GerarCobrancasMensaisUseCase.execute() pra não fazer uma query de categoria por associado.
  abstract listarPorIds(ids: string[]): Promise<CategoriaSocio[]>;
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
