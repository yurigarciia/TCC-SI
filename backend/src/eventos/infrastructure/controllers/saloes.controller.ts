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
import { Perfil } from '../../../identidade/domain/usuario.entity';
import { CriarSalaoUseCase } from '../../application/use-cases/criar-salao.use-case';
import { AdicionarMesaUseCase } from '../../application/use-cases/adicionar-mesa.use-case';
import { ListarSaloesUseCase } from '../../application/use-cases/listar-saloes.use-case';
import { ConsultarSalaoUseCase } from '../../application/use-cases/consultar-salao.use-case';
import { CriarSalaoDto } from './dto/criar-salao.dto';
import { AdicionarMesaDto } from './dto/adicionar-mesa.dto';

@ApiTags('saloes')
@ApiBearerAuth()
@Controller('saloes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Perfil.ADMINISTRADOR)
export class SaloesController {
  constructor(
    private readonly criar: CriarSalaoUseCase,
    private readonly adicionarMesa: AdicionarMesaUseCase,
    private readonly listar: ListarSaloesUseCase,
    private readonly consultar: ConsultarSalaoUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um salão (croqui) com sua capacidade total' })
  @ApiResponse({ status: 201, description: 'Salão criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  criarSalao(@Body() dto: CriarSalaoDto) {
    return this.criar.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os salões cadastrados' })
  @ApiResponse({ status: 200, description: 'Lista de salões' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  listarTodos() {
    return this.listar.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta um salão por id, com suas mesas' })
  @ApiResponse({ status: 200, description: 'Salão e suas mesas' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Salão não encontrado' })
  consultarComMesas(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultar.execute(id);
  }

  @Post(':id/mesas')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Adiciona uma mesa ao croqui do salão (número único dentro do salão)',
  })
  @ApiResponse({ status: 201, description: 'Mesa criada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Salão não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Já existe uma mesa com esse número neste salão',
  })
  adicionarMesaAoSalao(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdicionarMesaDto,
  ) {
    return this.adicionarMesa.execute(id, dto);
  }
}
