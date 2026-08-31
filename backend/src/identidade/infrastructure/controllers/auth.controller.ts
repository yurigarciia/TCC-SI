import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { AutenticarUsuarioUseCase } from '../../application/use-cases/autenticar-usuario.use-case';
import type { TokenDeAcesso } from '../../application/use-cases/autenticar-usuario.use-case';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios.use-case';
import { CriarAdministradorUseCase } from '../../application/use-cases/criar-administrador.use-case';
import { Perfil } from '../../domain/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { CriarAdministradorDto } from './dto/criar-administrador.dto';
import { PaginacaoQueryDto } from '../../../shared/pagination/paginacao-query.dto';
import { PaginaResultado } from '../../../shared/pagination/pagina-resultado';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { Roles } from '../security/roles.decorator';
import { CurrentUser } from '../security/current-user.decorator';
import type { JwtPayload } from '../security/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly autenticarUsuario: AutenticarUsuarioUseCase,
    private readonly listarUsuarios: ListarUsuariosUseCase,
    private readonly criarAdministrador: CriarAdministradorUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Autentica um usuário (administrador ou associado) e retorna um JWT',
  })
  @ApiResponse({ status: 200, description: 'Token de acesso emitido' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() dto: LoginDto): Promise<TokenDeAcesso> {
    return this.autenticarUsuario.execute(dto.email, dto.senha);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Retorna os dados do usuário autenticado a partir do token',
  })
  @ApiResponse({ status: 200, description: 'Payload do usuário autenticado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  me(@CurrentUser() usuario: JwtPayload): JwtPayload {
    return usuario;
  }

  @Get('usuarios')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary:
      'Lista os usuários (contas de login) cadastrados, paginado, opcionalmente filtrando por e-mail',
  })
  @ApiResponse({ status: 200, description: 'Página de usuários' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  async listar(
    @Query() { pagina, limite, busca }: PaginacaoQueryDto,
  ): Promise<PaginaResultado<{ id: string; email: string; perfil: Perfil }>> {
    const resultado = await this.listarUsuarios.execute(
      pagina!,
      limite!,
      busca,
    );
    return {
      ...resultado,
      itens: resultado.itens.map(({ id, email, perfil }) => ({
        id,
        email,
        perfil,
      })),
    };
  }

  @Post('usuarios')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary:
      'Cria uma nova conta de administrador (acesso ao painel da diretoria)',
  })
  @ApiResponse({ status: 201, description: 'Administrador criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  async criar(
    @Body() dto: CriarAdministradorDto,
  ): Promise<{ id: string; email: string; perfil: Perfil }> {
    const usuario = await this.criarAdministrador.execute(dto);
    return { id: usuario.id, email: usuario.email, perfil: usuario.perfil };
  }
}
