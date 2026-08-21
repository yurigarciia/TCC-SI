import { Mesa } from '../../domain/mesa.entity';

export interface NovaMesa {
  salaoId: string;
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
}

export abstract class MesaRepositoryPort {
  abstract salvar(dados: NovaMesa): Promise<Mesa>;
  abstract buscarPorId(id: string): Promise<Mesa | null>;
  abstract buscarPorSalaoENumero(
    salaoId: string,
    numero: number,
  ): Promise<Mesa | null>;
  abstract listarPorSalao(salaoId: string): Promise<Mesa[]>;
}
