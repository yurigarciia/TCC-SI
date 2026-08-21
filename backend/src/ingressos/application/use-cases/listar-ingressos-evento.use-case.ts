import { Inject, Injectable } from '@nestjs/common';
import { IngressoRepositoryPort } from '../ports/ingresso-repository.port';
import { Ingresso } from '../../domain/ingresso.entity';

@Injectable()
export class ListarIngressosEventoUseCase {
  constructor(
    @Inject(IngressoRepositoryPort)
    private readonly ingressos: IngressoRepositoryPort,
  ) {}

  execute(eventoId: string, nome?: string): Promise<Ingresso[]> {
    if (nome) {
      return this.ingressos.buscarPorNomeNoEvento(eventoId, nome);
    }
    return this.ingressos.listarPorEvento(eventoId);
  }
}
