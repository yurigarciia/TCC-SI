import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { Mensalidade } from '../../domain/mensalidade.entity';

// RF05/RF06/RF08 (lado associado) — "ver mensalidade atual e histórico" pelo app (T-MOB-002).
// Resolve o Associado a partir do Usuario autenticado, mesmo caminho de /associados/me e
// /reservas/minhas.
@Injectable()
export class ListarMinhasMensalidadesUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  async execute(usuarioId: string): Promise<Mensalidade[]> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }
    return this.mensalidades.listarPorAssociado(associado.id);
  }
}
