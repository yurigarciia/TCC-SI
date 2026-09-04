import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioRepositoryPort } from '../ports/usuario-repository.port';
import { PasswordHasherPort } from '../ports/password-hasher.port';

export interface TokenDeAcesso {
  accessToken: string;
}

@Injectable()
export class AutenticarUsuarioUseCase {
  constructor(
    @Inject(UsuarioRepositoryPort)
    private readonly usuarios: UsuarioRepositoryPort,
    @Inject(PasswordHasherPort) private readonly hasher: PasswordHasherPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, senha: string): Promise<TokenDeAcesso> {
    const usuario = await this.usuarios.buscarPorEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await this.hasher.comparar(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      nome: usuario.nome,
    });
    return { accessToken };
  }
}
