import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MesaRepositoryPort } from '../ports/mesa-repository.port';
import { FormatoMesa, Mesa } from '../../domain/mesa.entity';

export interface DadosAtualizarMesa {
  numero?: number;
  capacidade?: number;
  posicaoX?: number;
  posicaoY?: number;
  formato?: FormatoMesa;
}

// Corrige um achado de QA (conversa com o usuário): dava pra cadastrar mesa, mas não pra corrigir
// um número/capacidade/posição errado depois — só existia POST, nunca PATCH/DELETE. Editar nunca
// invalida reserva nenhuma (capacidade é só informativa no mapa de mesas, não entra em nenhuma
// validação de reserva) — por isso não tem a mesma restrição de RemoverMesaUseCase.
@Injectable()
export class AtualizarMesaUseCase {
  constructor(
    @Inject(MesaRepositoryPort) private readonly mesas: MesaRepositoryPort,
  ) {}

  async execute(
    salaoId: string,
    mesaId: string,
    dados: DadosAtualizarMesa,
  ): Promise<Mesa> {
    const mesa = await this.mesas.buscarPorId(mesaId);
    if (!mesa || mesa.salaoId !== salaoId) {
      throw new NotFoundException('Mesa não encontrada');
    }

    if (dados.numero !== undefined && dados.numero !== mesa.numero) {
      const existente = await this.mesas.buscarPorSalaoENumero(
        salaoId,
        dados.numero,
      );
      if (existente && existente.id !== mesaId) {
        throw new ConflictException(
          'Já existe uma mesa com esse número neste salão',
        );
      }
    }

    return this.mesas.atualizar(mesaId, dados);
  }
}
