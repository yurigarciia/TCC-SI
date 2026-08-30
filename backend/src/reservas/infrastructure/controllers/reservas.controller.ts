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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  confirmarReservaPendente(@Param('id', ParseUUIDPipe) id: string) {
    return this.confirmar.execute(id);
  }

  @Post('reservas/:id/cancelar')
  cancelarReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.cancelar.execute(id);
  }

  @Post('reservas/:id/transferir-mesa')
  transferirParaOutraMesa(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferirMesaDto,
  ) {
    return this.transferirMesa.execute(id, dto.novaMesaId);
  }

  @Post('reservas/:id/transferir-titular')
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
  mapaDeMesasDoEvento(@Param('eventoId', ParseUUIDPipe) eventoId: string) {
    return this.consultarMapa.execute(eventoId);
  }

  // RF13 — "Minhas Reservas" no app do associado.
  @Get('reservas/minhas')
  @Roles(Perfil.ASSOCIADO)
  minhasReservas(@CurrentUser() usuario: JwtPayload) {
    return this.listarMinhas.execute(usuario.sub);
  }
}
