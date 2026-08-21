import { Inject, Injectable } from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import {
  Mensalidade,
  StatusMensalidade,
} from '../../domain/mensalidade.entity';

export interface ItemInadimplencia {
  mensalidade: Mensalidade;
  associadoNome: string;
  diasEmAtraso: number;
}

// RF07 — relatório sempre disponível sob consulta (não é gerado por agendamento), conforme
// decisão registrada em relatorio-inadimplencia.json.
@Injectable()
export class ListarInadimplentesUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  async execute(): Promise<ItemInadimplencia[]> {
    const inadimplentes = await this.mensalidades.listarPorStatus(
      StatusMensalidade.INADIMPLENTE,
    );
    const hoje = new Date();

    const itens: ItemInadimplencia[] = [];
    for (const mensalidade of inadimplentes) {
      const associado = await this.associados.buscarPorId(
        mensalidade.associadoId,
      );
      const diasEmAtraso = Math.floor(
        (hoje.getTime() - new Date(mensalidade.vencimento).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      itens.push({
        mensalidade,
        associadoNome: associado?.nome ?? 'Associado não encontrado',
        diasEmAtraso,
      });
    }

    return itens;
  }
}
