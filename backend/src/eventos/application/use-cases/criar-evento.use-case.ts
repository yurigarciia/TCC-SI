import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventoRepositoryPort } from '../ports/evento-repository.port';
import { SalaoRepositoryPort } from '../ports/salao-repository.port';
import { Evento, StatusEvento } from '../../domain/evento.entity';

export interface DadosNovoEvento {
  nome: string;
  data: string;
  local: string;
  descricao: string | null;
  salaoId: string | null;
}

// evento.json: vincular um croqui de salão é opcional — evento pode existir só com ingresso
// avulso. Nasce sempre como rascunho (RF13 só mostra eventos publicados ao associado).
@Injectable()
export class CriarEventoUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(SalaoRepositoryPort) private readonly saloes: SalaoRepositoryPort,
  ) {}

  async execute(dados: DadosNovoEvento): Promise<Evento> {
    if (dados.salaoId) {
      const salao = await this.saloes.buscarPorId(dados.salaoId);
      if (!salao) {
        throw new NotFoundException('Salão não encontrado');
      }
    }

    return this.eventos.salvar({ ...dados, status: StatusEvento.RASCUNHO });
  }
}
