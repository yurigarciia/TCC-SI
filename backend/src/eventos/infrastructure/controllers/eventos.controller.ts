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
import { Perfil } from '../../../identidade/domain/usuario.entity';
import { CriarEventoUseCase } from '../../application/use-cases/criar-evento.use-case';
import { ConfigurarMesasEventoUseCase } from '../../application/use-cases/configurar-mesas-evento.use-case';
import { ConfigurarIngressoEventoUseCase } from '../../application/use-cases/configurar-ingresso-evento.use-case';
import { PublicarEventoUseCase } from '../../application/use-cases/publicar-evento.use-case';
import { PaginacaoQueryDto } from '../../../shared/pagination/paginacao-query.dto';
import {
  ListarEventosPublicadosUseCase,
  ListarEventosUseCase,
} from '../../application/use-cases/listar-eventos.use-case';
import { ConsultarEventoUseCase } from '../../application/use-cases/consultar-evento.use-case';
import { ConsultarEventoPublicadoUseCase } from '../../application/use-cases/consultar-evento-publicado.use-case';
import { CriarEventoDto } from './dto/criar-evento.dto';
import { ConfigurarMesasEventoDto } from './dto/configurar-mesas-evento.dto';
import { ConfigurarIngressoEventoDto } from './dto/configurar-ingresso-evento.dto';

@ApiTags('eventos')
@Controller('eventos')
export class EventosController {
  constructor(
    private readonly criar: CriarEventoUseCase,
    private readonly configurarMesas: ConfigurarMesasEventoUseCase,
    private readonly configurarIngresso: ConfigurarIngressoEventoUseCase,
    private readonly publicar: PublicarEventoUseCase,
    private readonly listar: ListarEventosUseCase,
    private readonly listarPublicados: ListarEventosPublicadosUseCase,
    private readonly consultar: ConsultarEventoUseCase,
    private readonly consultarPublicado: ConsultarEventoPublicadoUseCase,
  ) {}

  // RF13 — vitrine pública de eventos publicados, consumida pelo app do associado.
  @Get('publicados')
  @ApiOperation({
    summary: 'Lista os eventos já publicados (vitrine pública, usada pelo app)',
  })
  @ApiResponse({ status: 200, description: 'Lista de eventos publicados' })
  listarEventosPublicados() {
    return this.listarPublicados.execute();
  }

  // RF11/RF12/RF14 (T-MOB-004) — detalhe público (preço/mesas/ingresso) de um evento já
  // publicado, pra decidir reservar mesa ou comprar ingresso antes de precisar logar. Precisa vir
  // antes de ':id' (mesmo motivo de /associados/me) — 'publicados' como segmento literal já evita
  // colisão, mas mantém o padrão de declarar o mais específico primeiro.
  @Get('publicados/:id')
  @ApiOperation({
    summary:
      'Consulta o detalhe público de um evento publicado (mesas, ingresso, preços)',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento publicado com mesas e configuração de ingresso',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado ou ainda não publicado',
  })
  consultarEventoPublicado(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultarPublicado.execute(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Cria um evento como rascunho (não visível ao associado até publicar)',
  })
  @ApiResponse({
    status: 201,
    description: 'Evento criado com status rascunho',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Salão informado não encontrado' })
  criarEvento(@Body() dto: CriarEventoDto) {
    return this.criar.execute({
      nome: dto.nome,
      data: dto.data,
      local: dto.local,
      descricao: dto.descricao ?? null,
      salaoId: dto.salaoId ?? null,
    });
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Lista os eventos (rascunho e publicados), paginado',
  })
  @ApiResponse({ status: 200, description: 'Página de eventos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  listarTodos(@Query() { pagina, limite }: PaginacaoQueryDto) {
    return this.listar.execute(pagina!, limite!);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Consulta um evento por id, com mesas e configuração de ingresso',
  })
  @ApiResponse({ status: 200, description: 'Evento detalhado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  consultarDetalhado(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultar.execute(id);
  }

  @Put(':id/mesas')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary:
      'Define preço e bloqueio de mesas do evento a partir do croqui do salão vinculado',
  })
  @ApiResponse({ status: 200, description: 'Configuração de mesas do evento' })
  @ApiResponse({
    status: 400,
    description:
      'Evento sem salão vinculado, ou mesa não pertence ao salão do evento',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  configurarMesasDoEvento(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfigurarMesasEventoDto,
  ) {
    return this.configurarMesas.execute(id, dto.mesas);
  }

  @Put(':id/ingresso')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary:
      'Define quantidade disponível e preço do ingresso avulso do evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuração de ingresso do evento',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  configurarIngressoDoEvento(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfigurarIngressoEventoDto,
  ) {
    return this.configurarIngresso.execute(id, dto);
  }

  @Post(':id/publicar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Publica um evento, tornando-o visível na vitrine pública/app',
  })
  @ApiResponse({ status: 201, description: 'Evento publicado' })
  @ApiResponse({ status: 400, description: 'Evento já está publicado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  publicarEvento(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicar.execute(id);
  }
}
