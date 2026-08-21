import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AutenticarUsuarioUseCase } from '../../application/use-cases/autenticar-usuario.use-case';
import type { TokenDeAcesso } from '../../application/use-cases/autenticar-usuario.use-case';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios.use-case';
import { Perfil } from '../../domain/usuario.entity';
import { LoginDto } from './dto/login.dto';
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
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<TokenDeAcesso> {
    return this.autenticarUsuario.execute(dto.email, dto.senha);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() usuario: JwtPayload): JwtPayload {
    return usuario;
  }

  @Get('usuarios')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  async listar(): Promise<
    Array<{ id: string; email: string; perfil: Perfil }>
  > {
    const usuarios = await this.listarUsuarios.execute();
    return usuarios.map(({ id, email, perfil }) => ({ id, email, perfil }));
  }
}
