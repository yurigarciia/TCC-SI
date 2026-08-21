import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SalaoRepositoryPort } from '../ports/salao-repository.port';
import { MesaRepositoryPort } from '../ports/mesa-repository.port';
import { Mesa } from '../../domain/mesa.entity';

export interface DadosNovaMesa {
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
}

// croqui-salao.json: "Valida numeração de mesas" — garante que não há números de mesa duplicados
// dentro do mesmo croqui/salão.
@Injectable()
export class AdicionarMesaUseCase {
  constructor(
    @Inject(SalaoRepositoryPort) private readonly saloes: SalaoRepositoryPort,
    @Inject(MesaRepositoryPort) private readonly mesas: MesaRepositoryPort,
  ) {}

  async execute(salaoId: string, dados: DadosNovaMesa): Promise<Mesa> {
    const salao = await this.saloes.buscarPorId(salaoId);
    if (!salao) {
      throw new NotFoundException('Salão não encontrado');
    }

    const mesaExistente = await this.mesas.buscarPorSalaoENumero(
      salaoId,
      dados.numero,
    );
    if (mesaExistente) {
      throw new ConflictException(
        'Já existe uma mesa com esse número neste salão',
      );
    }

    return this.mesas.salvar({ salaoId, ...dados });
  }
}
