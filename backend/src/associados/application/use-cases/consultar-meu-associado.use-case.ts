import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import { Associado } from '../../domain/associado.entity';

// Usado pelo endpoint "/associados/me" — resolve o Associado a partir do id do Usuario
// autenticado (JwtPayload.sub). Só funciona para quem se auto-cadastrou (usuarioId preenchido);
// cadastros mediados pela diretoria ainda não têm esse vínculo — ver nota em
// AutoCadastrarAssociadoUseCase.
@Injectable()
export class ConsultarMeuAssociadoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  async execute(usuarioId: string): Promise<Associado> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException(
        'Nenhum associado vinculado a este usuário (cadastro pode ter sido feito pela diretoria, sem vínculo ainda)',
      );
    }
    return associado;
  }
}
