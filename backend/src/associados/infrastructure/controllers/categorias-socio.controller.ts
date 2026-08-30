import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
import { CriarCategoriaSocioUseCase } from '../../application/use-cases/criar-categoria-socio.use-case';
import { ListarCategoriasSocioUseCase } from '../../application/use-cases/listar-categorias-socio.use-case';
import { CriarCategoriaSocioDto } from './dto/criar-categoria-socio.dto';

@ApiTags('categorias-socio')
@ApiBearerAuth()
@Controller('categorias-socio')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Perfil.ADMINISTRADOR)
export class CategoriasSocioController {
  constructor(
    private readonly criar: CriarCategoriaSocioUseCase,
    private readonly listar: ListarCategoriasSocioUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Cria uma categoria de sócio com seu valor de mensalidade',
  })
  @ApiResponse({ status: 201, description: 'Categoria criada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  criarCategoria(@Body() dto: CriarCategoriaSocioDto) {
    return this.criar.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as categorias de sócio cadastradas' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  listarTodas() {
    return this.listar.execute();
  }
}
