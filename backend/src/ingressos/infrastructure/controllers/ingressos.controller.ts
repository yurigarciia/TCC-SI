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
import { Perfil } from '../../../identidade/domain/usuario.entity';
import { DefinirPrecoPadraoUseCase } from '../../application/use-cases/definir-preco-padrao.use-case';
import { DefinirPrecoPorEventoUseCase } from '../../application/use-cases/definir-preco-por-evento.use-case';
import { EmitirIngressoUseCase } from '../../application/use-cases/emitir-ingresso.use-case';
import { RegistrarCheckinUseCase } from '../../application/use-cases/registrar-checkin.use-case';
import { ListarIngressosEventoUseCase } from '../../application/use-cases/listar-ingressos-evento.use-case';
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
  ) {}

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
