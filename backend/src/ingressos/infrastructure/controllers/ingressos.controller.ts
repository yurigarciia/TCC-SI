import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identidade/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '../../../identidade/infrastructure/security/roles.guard';
import { Roles } from '../../../identidade/infrastructure/security/roles.decorator';
import { CurrentUser } from '../../../identidade/infrastructure/security/current-user.decorator';
import { Perfil } from '../../../identidade/domain/usuario.entity';
import type { JwtPayload } from '../../../identidade/infrastructure/security/jwt.strategy';
import { DefinirPrecoPadraoUseCase } from '../../application/use-cases/definir-preco-padrao.use-case';
import { DefinirPrecoPorEventoUseCase } from '../../application/use-cases/definir-preco-por-evento.use-case';
import { EmitirIngressoUseCase } from '../../application/use-cases/emitir-ingresso.use-case';
import { RegistrarCheckinUseCase } from '../../application/use-cases/registrar-checkin.use-case';
import { ListarIngressosEventoUseCase } from '../../application/use-cases/listar-ingressos-evento.use-case';
import { ComprarMeuIngressoUseCase } from '../../application/use-cases/comprar-meu-ingresso.use-case';
import { DefinirPrecoDto } from './dto/definir-preco.dto';
import { EmitirIngressoDto } from './dto/emitir-ingresso.dto';

@ApiTags('ingressos')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Perfil.ADMINISTRADOR)
export class IngressosController {
  constructor(
    private readonly definirPrecoPadrao: DefinirPrecoPadraoUseCase,
    private readonly definirPrecoPorEvento: DefinirPrecoPorEventoUseCase,
    private readonly emitir: EmitirIngressoUseCase,
    private readonly checkin: RegistrarCheckinUseCase,
    private readonly listar: ListarIngressosEventoUseCase,
    private readonly comprarMeu: ComprarMeuIngressoUseCase,
  ) {}

  // RF12 (T-MOB-004) — associado compra o próprio ingresso pelo app; perfil/canal/forma de
  // pagamento/nome do comprador são sempre resolvidos a partir do usuário autenticado (ver
  // ComprarMeuIngressoUseCase) — emissao-ingresso.json: "associado compra pelo app (sempre paga
  // online)". Sem corpo — nada fica livre pro cliente escolher.
  @Post('eventos/:eventoId/meu-ingresso')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Perfil.ASSOCIADO)
  comprarMeuIngresso(
    @CurrentUser() usuario: JwtPayload,
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
  ) {
    return this.comprarMeu.execute(usuario.sub, eventoId);
  }

  @Put('precos-ingresso')
  definirPrecoPadraoDaEntidade(@Body() dto: DefinirPrecoDto) {
    return this.definirPrecoPadrao.execute(dto.perfil, dto.preco);
  }

  @Put('eventos/:eventoId/precos-ingresso')
  definirPrecoParaEvento(
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
    @Body() dto: DefinirPrecoDto,
  ) {
    return this.definirPrecoPorEvento.execute(eventoId, dto.perfil, dto.preco);
  }

  @Post('eventos/:eventoId/ingressos')
  @HttpCode(HttpStatus.CREATED)
  emitirIngresso(
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
    @Body() dto: EmitirIngressoDto,
  ) {
    return this.emitir.execute(eventoId, dto);
  }

  @Get('eventos/:eventoId/ingressos')
  listarOuBuscarIngressos(
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
    @Query('nome') nome?: string,
  ) {
    return this.listar.execute(eventoId, nome);
  }

  @Post('ingressos/:id/checkin')
  registrarCheckin(@Param('id', ParseUUIDPipe) id: string) {
    return this.checkin.execute(id);
  }
}
