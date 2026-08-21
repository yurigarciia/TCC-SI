import { Inject, Injectable } from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { Mensalidade } from '../../domain/mensalidade.entity';

@Injectable()
export class ListarHistoricoAssociadoUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
  ) {}

  execute(associadoId: string): Promise<Mensalidade[]> {
    return this.mensalidades.listarPorAssociado(associadoId);
  }
}
