import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IngressoRepositoryPort } from '../ports/ingresso-repository.port';
import { Ingresso, StatusIngresso } from '../../domain/ingresso.entity';

// emissao-ingresso.json: "Ingresso já foi usado?" — check-in por QR (id do ingresso) ou busca
// manual por nome (ver ListarIngressosPorNomeUseCase), os dois formatos convergem para este
// mesmo use case a partir do id do ingresso encontrado.
@Injectable()
export class RegistrarCheckinUseCase {
  constructor(
    @Inject(IngressoRepositoryPort)
    private readonly ingressos: IngressoRepositoryPort,
  ) {}

  async execute(id: string): Promise<Ingresso> {
    const ingresso = await this.ingressos.buscarPorId(id);
    if (!ingresso) {
      throw new NotFoundException('Ingresso não encontrado');
    }
    if (ingresso.status === StatusIngresso.USADO) {
      throw new ConflictException('Ingresso já utilizado — entrada recusada');
    }
    return this.ingressos.atualizar(id, {
      status: StatusIngresso.USADO,
      usadoEm: new Date(),
    });
  }
}
