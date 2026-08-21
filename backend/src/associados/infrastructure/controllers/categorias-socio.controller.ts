import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  criarCategoria(@Body() dto: CriarCategoriaSocioDto) {
    return this.criar.execute(dto);
  }

  @Get()
  listarTodas() {
    return this.listar.execute();
  }
}
