import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { StatusMensalidade } from '../../domain/mensalidade.entity';

export interface Comprovante {
  associadoNome: string;
  competencia: string;
  valor: number;
  formaPagamento: string | null;
  pagoEm: Date | null;
}

// RF08 — emissão de comprovante. Representação estruturada (JSON), não um PDF — geração de PDF
// fica para quando o frontend definir o layout de impressão/compartilhamento.
@Injectable()
export class ObterComprovanteUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
  ) {}

  async execute(id: string): Promise<Comprovante> {
    const mensalidade = await this.mensalidades.buscarPorId(id);
    if (!mensalidade) {
      throw new NotFoundException('Mensalidade não encontrada');
    }
    if (mensalidade.status !== StatusMensalidade.PAGA) {
      throw new BadRequestException('Mensalidade ainda não foi paga');
    }
    const associado = await this.associados.buscarPorId(
      mensalidade.associadoId,
    );

    return {
      associadoNome: associado?.nome ?? 'Associado não encontrado',
      competencia: mensalidade.competencia,
      valor: mensalidade.valor,
      formaPagamento: mensalidade.formaPagamento,
      pagoEm: mensalidade.pagoEm,
    };
  }
}
