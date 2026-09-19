import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { NotificationSenderPort } from '../../../shared/notifications/application/ports/notification-sender.port';
import { EmitirIngressoUseCase } from './emitir-ingresso.use-case';
import {
  CanalIngresso,
  FormaPagamentoIngresso,
  Ingresso,
  PerfilComprador,
} from '../../domain/ingresso.entity';

// emissao-ingresso.json: "associado compra pelo app (sempre paga online)". Diferente de
// EmitirIngressoUseCase (usado pela diretoria, que registra venda presencial pra qualquer
// perfil), aqui perfil/canal/forma de pagamento/nome do comprador são sempre resolvidos a partir
// do próprio usuário autenticado — o associado só decide comprar, sem parâmetros livres.
@Injectable()
export class ComprarMeuIngressoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(NotificationSenderPort)
    private readonly notificacoes: NotificationSenderPort,
    private readonly emitirIngresso: EmitirIngressoUseCase,
  ) {}

  async execute(usuarioId: string, eventoId: string): Promise<Ingresso> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }
    if (!associado.categoriaSocioId) {
      throw new BadRequestException(
        'Associado sem categoria de sócio definida — procure a diretoria antes de comprar',
      );
    }
    const ingresso = await this.emitirIngresso.execute(eventoId, {
      nomeComprador: associado.nome,
      associadoId: associado.id,
      perfilComprador: PerfilComprador.SOCIO,
      canal: CanalIngresso.APP,
      formaPagamento: FormaPagamentoIngresso.ONLINE,
      categoriaSocioId: associado.categoriaSocioId,
    });

    const evento = await this.eventos.buscarPorId(eventoId);
    await this.notificacoes.enviar({
      destinatarioId: associado.id,
      titulo: 'Ingresso comprado',
      mensagem: `Seu ingresso para "${evento?.nome ?? 'o evento'}" foi emitido. Apresente seu cadastro na entrada.`,
    });

    return ingresso;
  }
}
