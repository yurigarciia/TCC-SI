import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReservaRepositoryPort } from '../ports/reserva-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { Reserva } from '../../domain/reserva.entity';

// RF13 — "Associado consultar suas reservas pelo aplicativo mobile". Resolve o Associado a partir
// do Usuario autenticado (mesmo caminho de /associados/me) e lista as reservas vinculadas a ele.
// Só funciona para reservas que tinham um associadoId informado no momento da criação (a
// diretoria pode continuar registrando reservas sem vínculo, para visitantes ou quando o
// associado ainda não tem conta — ver AutoCadastrarAssociadoUseCase).
@Injectable()
export class ListarMinhasReservasUseCase {
  constructor(
    @Inject(ReservaRepositoryPort)
    private readonly reservas: ReservaRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  async execute(usuarioId: string): Promise<Reserva[]> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }
    return this.reservas.listarPorAssociado(associado.id);
  }
}
