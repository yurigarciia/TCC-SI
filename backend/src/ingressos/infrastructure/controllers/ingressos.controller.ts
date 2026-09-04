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
import { DefinirPrecoPadraoUseCase } from '../../application/use-cases/definir-preco-padrao.use-case';
import { DefinirPrecoPorEventoUseCase } from '../../application/use-cases/definir-preco-por-evento.use-case';
import { EmitirIngressoUseCase } from '../../application/use-cases/emitir-ingresso.use-case';
import { RegistrarCheckinUseCase } from '../../application/use-cases/registrar-checkin.use-case';
import { ListarIngressosEventoUseCase } from '../../application/use-cases/listar-ingressos-evento.use-case';
import { ComprarMeuIngressoUseCase } from '../../application/use-cases/comprar-meu-ingresso.use-case';
import { ConsultarPrecosIngressoUseCase } from '../../application/use-cases/consultar-precos-ingresso.use-case';
import { ConsultarMeuPrecoIngressoUseCase } from '../../application/use-cases/consultar-meu-preco-ingresso.use-case';
import { DefinirPrecoDto } from './dto/definir-preco.dto';
import { EmitirIngressoDto } from './dto/emitir-ingresso.dto';
import { PaginacaoQueryDto } from '../../../shared/pagination/paginacao-query.dto';

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
    private readonly consultarPrecos: ConsultarPrecosIngressoUseCase,
    private readonly consultarMeuPreco: ConsultarMeuPrecoIngressoUseCase,
  ) {}

  // RF12 (T-MOB-004) — associado compra o próprio ingresso pelo app; perfil/canal/forma de
  // pagamento/nome do comprador são sempre resolvidos a partir do usuário autenticado (ver
  // ComprarMeuIngressoUseCase) — emissao-ingresso.json: "associado compra pelo app (sempre paga
  // online)". Sem corpo — nada fica livre pro cliente escolher.
  @Post('eventos/:eventoId/meu-ingresso')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Perfil.ASSOCIADO)
  @ApiOperation({
    summary:
      'Associado compra o próprio ingresso para um evento publicado (sempre paga online pelo app)',
  })
  @ApiResponse({
    status: 201,
    description: 'Ingresso emitido e cobrança online iniciada',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é associado',
  })
  @ApiResponse({
    status: 400,
    description:
      'Ingresso avulso não configurado para este evento, ou preço não configurado',
  })
  @ApiResponse({
    status: 404,
    description:
      'Evento não encontrado, ou nenhum associado vinculado ao usuário',
  })
  @ApiResponse({
    status: 409,
    description: 'Ingressos esgotados para este evento',
  })
  comprarMeuIngresso(
    @CurrentUser() usuario: JwtPayload,
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
  ) {
    return this.comprarMeu.execute(usuario.sub, eventoId);
  }

  // RF11/RF12 (T-MOB-004) — preço que o próprio associado logado pagaria pelo ingresso avulso
  // (sempre sócio, pela categoria dele), pra mostrar na tela do evento no app em vez do antigo
  // "preço de vitrine" solto (ver adendo em T-BE-009: os dois podiam divergir).
  @Get('eventos/:eventoId/meu-preco-ingresso')
  @Roles(Perfil.ASSOCIADO)
  @ApiOperation({
    summary: 'Consulta o preço de ingresso avulso que o associado logado pagaria neste evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Preço efetivo (null se o associado não tem categoria, ou preço não configurado)',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é associado',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum associado vinculado ao usuário',
  })
  consultarMeuPrecoIngresso(
    @CurrentUser() usuario: JwtPayload,
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
  ) {
    return this.consultarMeuPreco.execute(usuario.sub, eventoId);
  }

  @Put('precos-ingresso')
  @ApiOperation({
    summary:
      'Define o preço padrão de ingresso da entidade para um perfil de comprador',
  })
  @ApiResponse({ status: 200, description: 'Preço padrão definido' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  definirPrecoPadraoDaEntidade(@Body() dto: DefinirPrecoDto) {
    return this.definirPrecoPadrao.execute(dto.perfil, dto.preco, dto.categoriaSocioId);
  }

  @Put('eventos/:eventoId/precos-ingresso')
  @ApiOperation({
    summary:
      'Define o preço de ingresso de um perfil, sobrescrevendo o padrão para este evento',
  })
  @ApiResponse({ status: 200, description: 'Preço definido para o evento' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  definirPrecoParaEvento(
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
    @Body() dto: DefinirPrecoDto,
  ) {
    return this.definirPrecoPorEvento.execute(
      eventoId,
      dto.perfil,
      dto.preco,
      dto.categoriaSocioId,
    );
  }

  @Get('eventos/:eventoId/precos-ingresso')
  @ApiOperation({
    summary:
      'Consulta o preço efetivo de ingresso por perfil de comprador pra este evento (override do evento, senão o padrão da entidade)',
  })
  @ApiResponse({
    status: 200,
    description: 'Preço por perfil (null quando nenhum preço foi configurado ainda)',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  consultarPrecosDoEvento(@Param('eventoId', ParseUUIDPipe) eventoId: string) {
    return this.consultarPrecos.execute(eventoId);
  }

  @Post('eventos/:eventoId/ingressos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Registra a venda presencial/mediada de um ingresso para qualquer perfil de comprador',
  })
  @ApiResponse({ status: 201, description: 'Ingresso emitido' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos, ou preço/ingresso não configurado',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ingressos esgotados para este evento',
  })
  emitirIngresso(
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
    @Body() dto: EmitirIngressoDto,
  ) {
    return this.emitir.execute(eventoId, dto);
  }

  @Get('eventos/:eventoId/ingressos')
  @ApiOperation({
    summary:
      'Lista os ingressos de um evento, paginado, opcionalmente filtrando por nome do comprador (busca manual)',
  })
  @ApiResponse({ status: 200, description: 'Página de ingressos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  listarOuBuscarIngressos(
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
    @Query() { pagina, limite }: PaginacaoQueryDto,
    @Query('nome') nome?: string,
  ) {
    return this.listar.execute(eventoId, pagina!, limite!, nome);
  }

  @Post('ingressos/:id/checkin')
  @ApiOperation({
    summary: 'Registra o check-in de um ingresso na entrada do evento',
  })
  @ApiResponse({ status: 201, description: 'Check-in registrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Ingresso não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ingresso já utilizado — entrada recusada',
  })
  registrarCheckin(@Param('id', ParseUUIDPipe) id: string) {
    return this.checkin.execute(id);
  }
}
