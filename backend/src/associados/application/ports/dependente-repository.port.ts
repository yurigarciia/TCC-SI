import { Dependente } from '../../domain/dependente.entity';

export interface NovoDependente {
  associadoId: string;
  nome: string;
  dataNascimento: string;
}

export abstract class DependenteRepositoryPort {
  abstract salvar(dados: NovoDependente): Promise<Dependente>;
  abstract listarPorAssociado(associadoId: string): Promise<Dependente[]>;
}
