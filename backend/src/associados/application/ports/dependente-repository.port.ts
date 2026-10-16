import { Dependente } from '../../domain/dependente.entity';

export interface NovoDependente {
  associadoId: string;
  nome: string;
  dataNascimento: string;
}

export interface AtualizacaoDependente {
  nome?: string;
  dataNascimento?: string;
}

export abstract class DependenteRepositoryPort {
  abstract salvar(dados: NovoDependente): Promise<Dependente>;
  abstract listarPorAssociado(associadoId: string): Promise<Dependente[]>;
  abstract buscarPorId(id: string): Promise<Dependente | null>;
  abstract atualizar(
    id: string,
    dados: AtualizacaoDependente,
  ): Promise<Dependente>;
  abstract excluir(id: string): Promise<void>;
}
