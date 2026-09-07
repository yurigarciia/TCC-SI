import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MesaRepositoryPort } from '../ports/mesa-repository.port';

// Corrige um achado de QA (conversa com o usuário): não existia jeito de desfazer um clique
// errado no croqui — mesa cadastrada era permanente. Bloqueia exclusão de mesa já usada em
// reserva ou configuração de evento (as duas FKs são ON DELETE CASCADE — deletar direto
// apagaria histórico de verdade, ver decisoes.md "Em aberto: mover/remover mesa de um croqui já
// usado"); mesa nunca usada em nenhum evento pode ser excluída livremente.
@Injectable()
export class RemoverMesaUseCase {
  constructor(
    @Inject(MesaRepositoryPort) private readonly mesas: MesaRepositoryPort,
  ) {}

  async execute(salaoId: string, mesaId: string): Promise<void> {
    const mesa = await this.mesas.buscarPorId(mesaId);
    if (!mesa || mesa.salaoId !== salaoId) {
      throw new NotFoundException('Mesa não encontrada');
    }

    const emUso = await this.mesas.estaEmUso(mesaId);
    if (emUso) {
      throw new ConflictException(
        'Esta mesa já foi usada em um evento (reserva ou configuração de preço/bloqueio) e não pode ser excluída',
      );
    }

    await this.mesas.remover(mesaId);
  }
}
