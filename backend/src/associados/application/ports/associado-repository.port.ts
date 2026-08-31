import { Associado } from '../../domain/associado.entity';

export interface NovoAssociado {
  nome: string;
  cpf: string;
  contato: string;
  vinculoInstitucional: string | null;
  categoriaSocioId: string | null;
  origem: Associado['origem'];
  status: Associado['status'];
  usuarioId: string | null;
}

export interface AtualizacaoAssociado {
  nome?: string;
  contato?: string;
  vinculoInstitucional?: string | null;
  categoriaSocioId?: string | null;
  status?: Associado['status'];
  usuarioId?: string | null;
}

export abstract class AssociadoRepositoryPort {
  abstract salvar(dados: NovoAssociado): Promise<Associado>;
  abstract buscarPorId(id: string): Promise<Associado | null>;
  abstract buscarPorCpf(cpf: string): Promise<Associado | null>;
  abstract buscarPorUsuarioId(usuarioId: string): Promise<Associado | null>;
  // Sem paginação — usado só por quem precisa varrer todo mundo de propósito (ex.:
  // GerarCobrancasMensaisUseCase gerando a cobrança do mês pra cada associado ativo). A listagem
  // do painel usa listarPaginado.
  abstract listarTodos(): Promise<Associado[]>;
  // `busca`, quando informado, filtra por nome ou CPF (contendo o termo, sem diferenciar caixa).
  abstract listarPaginado(
    pagina: number,
    limite: number,
    busca?: string,
  ): Promise<{ itens: Associado[]; total: number }>;
  abstract atualizar(
    id: string,
    dados: AtualizacaoAssociado,
  ): Promise<Associado>;
}
