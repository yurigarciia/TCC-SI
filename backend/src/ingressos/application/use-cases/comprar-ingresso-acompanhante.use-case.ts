import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

// Achado numa conversa com o usuário: o app só deixava o associado comprar 1 ingresso (o dele
// próprio, sempre sócio). Mas é comum levar acompanhantes (família/amigos sem cadastro) pro
// mesmo evento — o fluxo não cobria isso, obrigando a pessoa a procurar a diretoria pra comprar
// na mão só por isso. Mesmo caminho de ComprarMeuIngressoUseCase (canal app, paga online), mas
// pra um acompanhante não-sócio ou criança, sem cadastro próprio. O ingresso ainda guarda
// associadoId = quem comprou (pra aparecer em "Meus Ingressos" de quem pagou), mas o nome
// impresso/QR é o do acompanhante.
@Injectable()
export class ComprarIngressoAcompanhanteUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(NotificationSenderPort)
    private readonly notificacoes: NotificationSenderPort,
    private readonly emitirIngresso: EmitirIngressoUseCase,
  ) {}

  async execute(
    usuarioId: string,
    eventoId: string,
    perfilComprador: PerfilComprador,
    nomeComprador: string,
  ): Promise<Ingresso> {
    if (perfilComprador === PerfilComprador.SOCIO) {
      throw new BadRequestException(
        'Para comprar seu próprio ingresso de sócio, use o endpoint de compra do associado',
      );
    }

    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }

    const ingresso = await this.emitirIngresso.execute(eventoId, {
      nomeComprador,
      associadoId: associado.id,
      perfilComprador,
      canal: CanalIngresso.APP,
      formaPagamento: FormaPagamentoIngresso.ONLINE,
    });

    const evento = await this.eventos.buscarPorId(eventoId);
    await this.notificacoes.enviar({
      destinatarioId: associado.id,
      titulo: 'Ingresso de acompanhante comprado',
      mensagem: `Ingresso para "${nomeComprador}" no evento "${evento?.nome ?? 'o evento'}" foi emitido.`,
    });

    return ingresso;
  }
}
