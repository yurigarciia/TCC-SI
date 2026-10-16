import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuarioRepositoryPort } from '../ports/usuario-repository.port';
import { PasswordHasherPort } from '../ports/password-hasher.port';

// Self-service — achado numa conversa com o usuário: não existia nenhum jeito de trocar a
// própria senha pelo painel, só via seed/banco direto. usuarioId vem sempre do JWT (sub), nunca
// de parâmetro livre, então ninguém troca a senha de outra conta por aqui.
@Injectable()
export class AlterarSenhaUseCase {
  constructor(
    @Inject(UsuarioRepositoryPort)
    private readonly usuarios: UsuarioRepositoryPort,
    @Inject(PasswordHasherPort)
    private readonly hasher: PasswordHasherPort,
  ) {}

  async execute(
    usuarioId: string,
    senhaAtual: string,
    senhaNova: string,
  ): Promise<void> {
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const senhaConfere = await this.hasher.comparar(
      senhaAtual,
      usuario.senhaHash,
    );
    if (!senhaConfere) {
      throw new UnauthorizedException('Senha atual incorreta');
    }
    if (senhaAtual === senhaNova) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da senha atual',
      );
    }

    const novoHash = await this.hasher.hash(senhaNova);
    await this.usuarios.atualizarSenha(usuarioId, novoHash);
  }
}
