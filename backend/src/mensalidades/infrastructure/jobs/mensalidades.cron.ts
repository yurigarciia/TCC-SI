import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GerarCobrancasMensaisUseCase } from '../../application/use-cases/gerar-cobrancas-mensais.use-case';
import { ProcessarInadimplenciaUseCase } from '../../application/use-cases/processar-inadimplencia.use-case';

@Injectable()
export class MensalidadesCron {
  private readonly logger = new Logger(MensalidadesCron.name);

  constructor(
    private readonly gerarCobrancas: GerarCobrancasMensaisUseCase,
    private readonly processarInadimplencia: ProcessarInadimplenciaUseCase,
  ) {}

  // mensalidade.json: cobrança gerada automaticamente no início de cada ciclo mensal.
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async gerarCobrancasDoMes(): Promise<void> {
    const geradas = await this.gerarCobrancas.execute();
    this.logger.log(`Cobranças mensais geradas: ${geradas.length}`);
  }

  // relatorio-inadimplencia.json: verificação diária de mensalidades vencidas sem pagamento.
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async processarInadimplenciaDoDia(): Promise<void> {
    const processadas = await this.processarInadimplencia.execute();
    this.logger.log(
      `Mensalidades marcadas como inadimplentes: ${processadas.length}`,
    );
  }
}
