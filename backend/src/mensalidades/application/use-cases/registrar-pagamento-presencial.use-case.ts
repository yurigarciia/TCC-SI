import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import {
  FormaPagamento,
  Mensalidade,
  StatusMensalidade,
} from '../../domain/mensalidade.entity';

@Injectable()
export class RegistrarPagamentoPresencialUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
  ) {}

  async execute(id: string): Promise<Mensalidade> {
    const mensalidade = await this.mensalidades.buscarPorId(id);
    if (!mensalidade) {
      throw new NotFoundException('Mensalidade não encontrada');
    }
    if (mensalidade.status === StatusMensalidade.PAGA) {
      throw new BadRequestException('Mensalidade já está paga');
    }

    return this.mensalidades.atualizar(id, {
      status: StatusMensalidade.PAGA,
      formaPagamento: FormaPagamento.PRESENCIAL,
      pagoEm: new Date(),
    });
  }
}
