import { Inject, Injectable } from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { StatusMensalidade } from '../../domain/mensalidade.entity';

export type SituacaoPagamento = 'em_dia' | 'inadimplente';

@Injectable()
export class ListarSituacaoPagamentoUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
  ) {}

  async execute(
    associadoIds: string[],
  ): Promise<Record<string, SituacaoPagamento>> {
    const inadimplentes = await this.mensalidades.listarPorStatus(
      StatusMensalidade.INADIMPLENTE,
    );
    const idsInadimplentes = new Set(inadimplentes.map((m) => m.associadoId));

    return Object.fromEntries(
      associadoIds.map((id) => [
        id,
        idsInadimplentes.has(id) ? 'inadimplente' : 'em_dia',
      ]),
    );
  }
}
