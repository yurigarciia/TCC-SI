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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identidade/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '../../../identidade/infrastructure/security/roles.guard';
import { Roles } from '../../../identidade/infrastructure/security/roles.decorator';
import { Perfil } from '../../../identidade/domain/usuario.entity';
import { CriarEventoUseCase } from '../../application/use-cases/criar-evento.use-case';
import { ConfigurarMesasEventoUseCase } from '../../application/use-cases/configurar-mesas-evento.use-case';
import { ConfigurarIngressoEventoUseCase } from '../../application/use-cases/configurar-ingresso-evento.use-case';
import { PublicarEventoUseCase } from '../../application/use-cases/publicar-evento.use-case';
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
  listarEventosPublicados() {
    return this.listarPublicados.execute();
  }

  // RF11/RF12/RF14 (T-MOB-004) — detalhe público (preço/mesas/ingresso) de um evento já
  // publicado, pra decidir reservar mesa ou comprar ingresso antes de precisar logar. Precisa vir
  // antes de ':id' (mesmo motivo de /associados/me) — 'publicados' como segmento literal já evita
  // colisão, mas mantém o padrão de declarar o mais específico primeiro.
  @Get('publicados/:id')
  consultarEventoPublicado(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultarPublicado.execute(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
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
  listarTodos() {
    return this.listar.execute();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  consultarDetalhado(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultar.execute(id);
  }

  @Put(':id/mesas')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
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
  publicarEvento(@Param('id', ParseUUIDPipe) id: string) {
    return this.publicar.execute(id);
  }
}
