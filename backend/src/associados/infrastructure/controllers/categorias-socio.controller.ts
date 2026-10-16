import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { CriarCategoriaSocioUseCase } from '../../application/use-cases/criar-categoria-socio.use-case';
import { ListarCategoriasSocioUseCase } from '../../application/use-cases/listar-categorias-socio.use-case';
import { AtualizarCategoriaSocioUseCase } from '../../application/use-cases/atualizar-categoria-socio.use-case';
import { ExcluirCategoriaSocioUseCase } from '../../application/use-cases/excluir-categoria-socio.use-case';
import { PaginacaoQueryDto } from '../../../shared/pagination/paginacao-query.dto';
import { CriarCategoriaSocioDto } from './dto/criar-categoria-socio.dto';
import { AtualizarCategoriaSocioDto } from './dto/atualizar-categoria-socio.dto';

@ApiTags('categorias-socio')
@ApiBearerAuth()
@Controller('categorias-socio')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Perfil.ADMINISTRADOR)
export class CategoriasSocioController {
  constructor(
    private readonly criar: CriarCategoriaSocioUseCase,
    private readonly listar: ListarCategoriasSocioUseCase,
    private readonly atualizar: AtualizarCategoriaSocioUseCase,
    private readonly excluir: ExcluirCategoriaSocioUseCase,
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
  @ApiOperation({
    summary:
      'Lista as categorias de sócio cadastradas, paginado, opcionalmente filtrando por nome',
  })
  @ApiResponse({ status: 200, description: 'Página de categorias' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  listarTodas(@Query() { pagina, limite, busca }: PaginacaoQueryDto) {
    return this.listar.execute(pagina!, limite!, busca);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza nome, isenção ou valor de mensalidade de uma categoria',
  })
  @ApiResponse({ status: 200, description: 'Categoria atualizada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  atualizarCategoria(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarCategoriaSocioDto,
  ) {
    return this.atualizar.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui uma categoria de sócio, se não houver associado vinculado',
  })
  @ApiResponse({ status: 204, description: 'Categoria excluída' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Categoria está vinculada a um ou mais associados',
  })
  excluirCategoria(@Param('id', ParseUUIDPipe) id: string) {
    return this.excluir.execute(id);
  }
}
