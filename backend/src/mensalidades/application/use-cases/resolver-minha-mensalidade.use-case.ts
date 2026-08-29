import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { Mensalidade } from '../../domain/mensalidade.entity';

// Checagem de propriedade compartilhada pelos 3 endpoints "minha mensalidade" (iniciar/confirmar
// pagamento online, comprovante) — sem isso, qualquer associado autenticado poderia agir sobre a
// mensalidade de outro associado só sabendo o id (IDOR). Resolve o Associado a partir do Usuario
// autenticado e recusa (403) se a mensalidade não for dele.
@Injectable()
export class ResolverMinhaMensalidadeUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  async execute(
    usuarioId: string,
    mensalidadeId: string,
  ): Promise<Mensalidade> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }
    const mensalidade = await this.mensalidades.buscarPorId(mensalidadeId);
    if (!mensalidade) {
      throw new NotFoundException('Mensalidade não encontrada');
    }
    if (mensalidade.associadoId !== associado.id) {
      throw new ForbiddenException('Esta mensalidade não pertence a você');
    }
    return mensalidade;
  }
}
