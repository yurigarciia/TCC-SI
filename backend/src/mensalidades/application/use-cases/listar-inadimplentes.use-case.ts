import { Inject, Injectable } from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import {
  Mensalidade,
  StatusMensalidade,
} from '../../domain/mensalidade.entity';
import {
  montarPaginaResultado,
  PaginaResultado,
} from '../../../shared/pagination/pagina-resultado';

export interface ItemInadimplencia {
  mensalidade: Mensalidade;
  associadoNome: string;
  diasEmAtraso: number;
}

// RF07 — relatório sempre disponível sob consulta (não é gerado por agendamento), conforme
// decisão registrada em relatorio-inadimplencia.json.
// Paginação aplicada em memória: o relatório junta mensalidade + nome do associado, sem uma
// consulta paginável direta no repositório de mensalidades.
@Injectable()
export class ListarInadimplentesUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  async execute(
    pagina: number,
    limite: number,
    busca?: string,
  ): Promise<PaginaResultado<ItemInadimplencia>> {
    const inadimplentes = await this.mensalidades.listarPorStatus(
      StatusMensalidade.INADIMPLENTE,
    );
    const hoje = new Date();

    let todosOsItens: ItemInadimplencia[] = [];
    for (const mensalidade of inadimplentes) {
      const associado = await this.associados.buscarPorId(
        mensalidade.associadoId,
      );
      const diasEmAtraso = Math.floor(
        (hoje.getTime() - new Date(mensalidade.vencimento).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      todosOsItens.push({
        mensalidade,
        associadoNome: associado?.nome ?? 'Associado não encontrado',
        diasEmAtraso,
      });
    }

    if (busca) {
      const termo = busca.toLocaleLowerCase('pt-BR');
      todosOsItens = todosOsItens.filter((item) =>
        item.associadoNome.toLocaleLowerCase('pt-BR').includes(termo),
      );
    }

    todosOsItens.sort((a, b) => b.diasEmAtraso - a.diasEmAtraso);
    const inicio = (pagina - 1) * limite;
    const itens = todosOsItens.slice(inicio, inicio + limite);
    return montarPaginaResultado(itens, todosOsItens.length, pagina, limite);
  }
}
