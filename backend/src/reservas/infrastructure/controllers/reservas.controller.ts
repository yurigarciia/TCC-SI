import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identidade/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '../../../identidade/infrastructure/security/roles.guard';
import { Roles } from '../../../identidade/infrastructure/security/roles.decorator';
import { CurrentUser } from '../../../identidade/infrastructure/security/current-user.decorator';
import { Perfil } from '../../../identidade/domain/usuario.entity';
import type { JwtPayload } from '../../../identidade/infrastructure/security/jwt.strategy';
import { SolicitarReservaUseCase } from '../../application/use-cases/solicitar-reserva.use-case';
import { ConfirmarReservaPendenteUseCase } from '../../application/use-cases/confirmar-reserva-pendente.use-case';
import { CancelarReservaUseCase } from '../../application/use-cases/cancelar-reserva.use-case';
import { ConsultarMapaMesasUseCase } from '../../application/use-cases/consultar-mapa-mesas.use-case';
import { TransferirMesaReservaUseCase } from '../../application/use-cases/transferir-mesa-reserva.use-case';
import { TransferirTitularReservaUseCase } from '../../application/use-cases/transferir-titular-reserva.use-case';
import { ListarMinhasReservasUseCase } from '../../application/use-cases/listar-minhas-reservas.use-case';
import { SolicitarMinhaReservaUseCase } from '../../application/use-cases/solicitar-minha-reserva.use-case';
import { SolicitarReservaDto } from './dto/solicitar-reserva.dto';
import { SolicitarMinhaReservaDto } from './dto/solicitar-minha-reserva.dto';
import { TransferirMesaDto } from './dto/transferir-mesa.dto';
import { TransferirTitularDto } from './dto/transferir-titular.dto';

@ApiTags('reservas')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Perfil.ADMINISTRADOR)
export class ReservasController {
  constructor(
    private readonly solicitar: SolicitarReservaUseCase,
    private readonly confirmar: ConfirmarReservaPendenteUseCase,
    private readonly cancelar: CancelarReservaUseCase,
    private readonly consultarMapa: ConsultarMapaMesasUseCase,
    private readonly transferirMesa: TransferirMesaReservaUseCase,
    private readonly transferirTitular: TransferirTitularReservaUseCase,
    private readonly listarMinhas: ListarMinhasReservasUseCase,
    private readonly solicitarMinha: SolicitarMinhaReservaUseCase,
  ) {}

  // Reserva lançada direto pela diretoria (pedido recebido por fora) — canal/titular/associadoId
  // livres no corpo da requisição. O outro canal de entrada (associado solicitando pelo próprio
  // app) é a rota "minha" abaixo (T-MOB-004) — reserva-mesa.json: "dois canais de entrada
  // convivem".
  @Post('eventos/:eventoId/mesas/:mesaId/reservar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Registra uma reserva de mesa lançada diretamente pela diretoria (pedido recebido por fora)',
  })
  @ApiResponse({ status: 201, description: 'Reserva criada' })
  @ApiResponse({
    status: 400,
    description:
      'Mesa não pertence ao salão do evento, não configurada, ou bloqueada',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Mesa já reservada — solicitação recusada',
  })
  solicitarReserva(
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
    @Param('mesaId', ParseUUIDPipe) mesaId: string,
    @Body() dto: SolicitarReservaDto,
  ) {
    return this.solicitar.execute(eventoId, mesaId, dto);
  }

  // RF11 (T-MOB-004) — associado solicita a própria mesa pelo app; canal/titular/associadoId são
  // sempre resolvidos a partir do usuário autenticado (ver SolicitarMinhaReservaUseCase), só a
  // forma de pagamento vem do corpo.
  @Post('eventos/:eventoId/mesas/:mesaId/reservar-minha')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Perfil.ASSOCIADO)
  @ApiOperation({
    summary:
      'Associado solicita a própria reserva de mesa pelo app (titular resolvido pelo usuário autenticado)',
  })
  @ApiResponse({ status: 201, description: 'Reserva criada' })
  @ApiResponse({
    status: 400,
    description:
      'Mesa não pertence ao salão do evento, não configurada, ou bloqueada',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é associado',
  })
  @ApiResponse({
    status: 404,
    description:
      'Evento não encontrado, ou nenhum associado vinculado ao usuário',
  })
  @ApiResponse({
    status: 409,
    description: 'Mesa já reservada — solicitação recusada',
  })
  solicitarMinhaReserva(
    @CurrentUser() usuario: JwtPayload,
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
    @Param('mesaId', ParseUUIDPipe) mesaId: string,
    @Body() dto: SolicitarMinhaReservaDto,
  ) {
    return this.solicitarMinha.execute(
      usuario.sub,
      eventoId,
      mesaId,
      dto.formaPagamento,
    );
  }

  @Post('reservas/:id/confirmar')
  @ApiOperation({
    summary:
      'Confirma o recebimento do pagamento presencial de uma reserva pendente',
  })
  @ApiResponse({ status: 201, description: 'Reserva confirmada' })
  @ApiResponse({
    status: 400,
    description: 'Reserva não está pendente de confirmação',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
  confirmarReservaPendente(@Param('id', ParseUUIDPipe) id: string) {
    return this.confirmar.execute(id);
  }

  @Post('reservas/:id/cancelar')
  @ApiOperation({
    summary: 'Cancela uma reserva, liberando a mesa para nova reserva',
  })
  @ApiResponse({ status: 201, description: 'Reserva cancelada' })
  @ApiResponse({ status: 400, description: 'Reserva já está cancelada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
  cancelarReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.cancelar.execute(id);
  }

  @Post('reservas/:id/transferir-mesa')
  @ApiOperation({
    summary: 'Transfere a reserva para outra mesa, se estiver disponível',
  })
  @ApiResponse({
    status: 201,
    description: 'Reserva transferida para a nova mesa',
  })
  @ApiResponse({
    status: 400,
    description:
      'Reserva cancelada, nova mesa igual à atual, ou nova mesa não configurada/bloqueada',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva ou nova mesa não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Nova mesa indisponível — recusada',
  })
  transferirParaOutraMesa(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferirMesaDto,
  ) {
    return this.transferirMesa.execute(id, dto.novaMesaId);
  }

  @Post('reservas/:id/transferir-titular')
  @ApiOperation({
    summary: 'Transfere a reserva para outro titular, mantendo a mesma mesa',
  })
  @ApiResponse({ status: 201, description: 'Titular da reserva atualizado' })
  @ApiResponse({
    status: 400,
    description: 'Reserva cancelada não pode ser transferida',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
  transferirParaOutroTitular(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferirTitularDto,
  ) {
    return this.transferirTitular.execute(id, dto.novoTitular);
  }

  // RF14 (também usado por T-MOB-004) — disponibilidade em tempo real, tanto pra diretoria
  // (mapa de reservas) quanto pro associado (escolher mesa livre antes de reservar).
  @Get('eventos/:eventoId/mapa-mesas')
  @Roles(Perfil.ADMINISTRADOR, Perfil.ASSOCIADO)
  @ApiOperation({
    summary:
      'Consulta o mapa de mesas do evento em tempo real (livre/pendente/reservada/bloqueada)',
  })
  @ApiResponse({ status: 200, description: 'Mapa de mesas do evento' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Perfil não autorizado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  mapaDeMesasDoEvento(@Param('eventoId', ParseUUIDPipe) eventoId: string) {
    return this.consultarMapa.execute(eventoId);
  }

  // RF13 — "Minhas Reservas" no app do associado.
  @Get('reservas/minhas')
  @Roles(Perfil.ASSOCIADO)
  @ApiOperation({
    summary: 'Lista as reservas do associado autenticado ("Minhas Reservas")',
  })
  @ApiResponse({ status: 200, description: 'Lista de reservas do associado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é associado',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum associado vinculado a este usuário',
  })
  minhasReservas(@CurrentUser() usuario: JwtPayload) {
    return this.listarMinhas.execute(usuario.sub);
  }
}
