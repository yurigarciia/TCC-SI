import { Salao } from '../../domain/salao.entity';

export interface NovoSalao {
  nome: string;
  capacidadeTotal: number;
}

export abstract class SalaoRepositoryPort {
  abstract salvar(dados: NovoSalao): Promise<Salao>;
  abstract buscarPorId(id: string): Promise<Salao | null>;
  abstract listarTodos(): Promise<Salao[]>;
}
