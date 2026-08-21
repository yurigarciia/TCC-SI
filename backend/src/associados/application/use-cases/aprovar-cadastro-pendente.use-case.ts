import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import { Associado, StatusAssociado } from '../../domain/associado.entity';

@Injectable()
export class AprovarCadastroPendenteUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  async execute(id: string): Promise<Associado> {
    const associado = await this.associados.buscarPorId(id);
    if (!associado) {
      throw new NotFoundException('Associado não encontrado');
    }
    if (associado.status !== StatusAssociado.PENDENTE_VALIDACAO) {
      throw new BadRequestException('Associado não está pendente de validação');
    }
    return this.associados.atualizar(id, { status: StatusAssociado.ATIVO });
  }
}
