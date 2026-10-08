import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import { Associado, StatusAssociado } from '../../domain/associado.entity';
import { GerarCobrancasMensaisUseCase } from '../../../mensalidades/application/use-cases/gerar-cobrancas-mensais.use-case';

@Injectable()
export class AprovarCadastroPendenteUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(forwardRef(() => GerarCobrancasMensaisUseCase))
    private readonly gerarCobrancas: GerarCobrancasMensaisUseCase,
  ) {}

  async execute(id: string, categoriaSocioId?: string): Promise<Associado> {
    const associado = await this.associados.buscarPorId(id);
    if (!associado) {
      throw new NotFoundException('Associado não encontrado');
    }
    if (associado.status !== StatusAssociado.PENDENTE_VALIDACAO) {
      throw new BadRequestException('Associado não está pendente de validação');
    }
    const aprovado = await this.associados.atualizar(id, {
      status: StatusAssociado.ATIVO,
      ...(categoriaSocioId ? { categoriaSocioId } : {}),
    });

    // RF04 — com categoria definida (própria do cadastro pendente ou passada agora na
    // aprovação), o associado já sai com a mensalidade do mês em vigor pendente, em vez de
    // esperar o próximo disparo do cron (gerar-cobrancas-mensais). Sem categoria, não gera nada
    // (mesma regra do cron) — fica pra quando a categoria for definida na edição.
    await this.gerarCobrancas.gerarParaAssociado(id);

    return aprovado;
  }
}
