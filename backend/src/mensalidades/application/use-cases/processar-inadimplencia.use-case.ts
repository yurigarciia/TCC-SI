import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MensalidadeRepositoryPort } from '../ports/mensalidade-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { NotificationSenderPort } from '../../../shared/notifications/application/ports/notification-sender.port';
import {
  Mensalidade,
  StatusMensalidade,
} from '../../domain/mensalidade.entity';

// RF07 (relatorio-inadimplencia.json): quando uma mensalidade pendente passa N dias do vencimento
// sem pagamento, o sistema marca Status: Inadimplente e dispara um lembrete automático — evolução
// em relação à cobrança manual via WhatsApp descrita na entrevista com o CPF Pia do Sul. N vem de
// INADIMPLENCIA_LEMBRETE_DIAS (pendência #9 de TCC-FINAL/arquitetura/decisoes.md, ainda sem
// resposta da entidade sobre o valor exato — por isso é configurável, não hardcoded).
@Injectable()
export class ProcessarInadimplenciaUseCase {
  constructor(
    @Inject(MensalidadeRepositoryPort)
    private readonly mensalidades: MensalidadeRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(NotificationSenderPort)
    private readonly notificacoes: NotificationSenderPort,
    private readonly config: ConfigService,
  ) {}

  async execute(referencia: Date = new Date()): Promise<Mensalidade[]> {
    const diasDeGraca = Number(
      this.config.get<string>('INADIMPLENCIA_LEMBRETE_DIAS') ?? '5',
    );
    const dataLimite = new Date(referencia);
    dataLimite.setDate(dataLimite.getDate() - diasDeGraca);
    const dataLimiteIso = dataLimite.toISOString().slice(0, 10);

    const vencidas =
      await this.mensalidades.listarPendentesVencidasAte(dataLimiteIso);

    const processadas: Mensalidade[] = [];
    for (const mensalidade of vencidas) {
      const atualizada = await this.mensalidades.atualizar(mensalidade.id, {
        status: StatusMensalidade.INADIMPLENTE,
        lembreteEnviadoEm: new Date(),
      });

      const associado = await this.associados.buscarPorId(
        mensalidade.associadoId,
      );
      await this.notificacoes.enviar({
        destinatarioId: mensalidade.associadoId,
        titulo: 'Mensalidade em atraso',
        mensagem: `Olá${associado ? ' ' + associado.nome : ''}, sua mensalidade de ${mensalidade.competencia} está em atraso. Regularize para continuar aproveitando os benefícios da entidade.`,
      });

      processadas.push(atualizada);
    }

    return processadas;
  }
}
