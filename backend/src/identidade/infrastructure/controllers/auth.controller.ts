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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AutenticarUsuarioUseCase } from '../../application/use-cases/autenticar-usuario.use-case';
import type { TokenDeAcesso } from '../../application/use-cases/autenticar-usuario.use-case';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios.use-case';
import { CriarAdministradorUseCase } from '../../application/use-cases/criar-administrador.use-case';
import { AtualizarUsuarioUseCase } from '../../application/use-cases/atualizar-usuario.use-case';
import { ExcluirUsuarioUseCase } from '../../application/use-cases/excluir-usuario.use-case';
import { AlterarSenhaUseCase } from '../../application/use-cases/alterar-senha.use-case';
import { Perfil } from '../../domain/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { CriarAdministradorDto } from './dto/criar-administrador.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';
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
    private readonly atualizarUsuario: AtualizarUsuarioUseCase,
    private readonly excluirUsuario: ExcluirUsuarioUseCase,
    private readonly alterarSenha: AlterarSenhaUseCase,
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

  // Self-service, qualquer perfil (administrador ou associado) — por isso só JwtAuthGuard, sem
  // RolesGuard/@Roles. O id de quem troca a senha vem sempre do token (sub), nunca do body.
  @Post('alterar-senha')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Troca a própria senha (usuário autenticado)' })
  @ApiResponse({ status: 204, description: 'Senha alterada' })
  @ApiResponse({ status: 400, description: 'Nova senha igual à atual' })
  @ApiResponse({ status: 401, description: 'Senha atual incorreta' })
  alterarMinhaSenha(
    @CurrentUser() usuario: JwtPayload,
    @Body() dto: AlterarSenhaDto,
  ) {
    return this.alterarSenha.execute(
      usuario.sub,
      dto.senhaAtual,
      dto.senhaNova,
    );
  }

  @Get('usuarios')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary:
      'Lista os usuários (contas de login) cadastrados, paginado, opcionalmente filtrando por e-mail/nome e por perfil',
  })
  @ApiQuery({
    name: 'perfil',
    enum: Perfil,
    required: false,
    description:
      'Filtra por perfil (ex.: administrador) — a tela de usuários do painel só mostra contas administrativas, não associados',
  })
  @ApiResponse({ status: 200, description: 'Página de usuários' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  async listar(
    @Query() { pagina, limite, busca }: PaginacaoQueryDto,
    @Query('perfil') perfil?: Perfil,
  ): Promise<
    PaginaResultado<{
      id: string;
      nome: string | null;
      email: string;
      perfil: Perfil;
    }>
  > {
    const resultado = await this.listarUsuarios.execute(
      pagina!,
      limite!,
      busca,
      perfil,
    );
    return {
      ...resultado,
      itens: resultado.itens.map(({ id, nome, email, perfil }) => ({
        id,
        nome,
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
  async criar(@Body() dto: CriarAdministradorDto): Promise<{
    id: string;
    nome: string | null;
    email: string;
    perfil: Perfil;
  }> {
    const usuario = await this.criarAdministrador.execute(dto);
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    };
  }

  @Patch('usuarios/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualiza nome/e-mail de uma conta administrador' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarUsuarioDto,
  ): Promise<{
    id: string;
    nome: string | null;
    email: string;
    perfil: Perfil;
  }> {
    const usuario = await this.atualizarUsuario.execute(id, dto);
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    };
  }

  @Delete('usuarios/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({ summary: 'Exclui uma conta administrador' })
  @ApiResponse({ status: 204, description: 'Usuário excluído' })
  @ApiResponse({
    status: 400,
    description: 'Tentativa de excluir a própria conta',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  excluir(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() usuario: JwtPayload,
  ) {
    return this.excluirUsuario.execute(id, usuario.sub);
  }
}
