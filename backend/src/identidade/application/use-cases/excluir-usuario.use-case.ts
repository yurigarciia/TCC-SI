import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioRepositoryPort } from '../ports/usuario-repository.port';

// Achado numa conversa com o usuário: a tela de "Usuários da Plataforma" só criava e listava
// administradores, sem jeito de editar ou excluir uma conta pelo próprio painel. Bloqueia
// autoexclusão — o requestingUsuarioId vem sempre do JWT (JwtPayload.sub), nunca de parâmetro
// livre, pra ninguém conseguir excluir a própria conta e ficar trancado para fora do painel
// (e, pior, se for a única conta administrador, trancar a entidade inteira para fora).
@Injectable()
export class ExcluirUsuarioUseCase {
  constructor(
    @Inject(UsuarioRepositoryPort)
    private readonly usuarios: UsuarioRepositoryPort,
  ) {}

  async execute(id: string, requestingUsuarioId: string): Promise<void> {
    if (id === requestingUsuarioId) {
      throw new BadRequestException('Você não pode excluir a própria conta');
    }
    const existente = await this.usuarios.buscarPorId(id);
    if (!existente) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.usuarios.excluir(id);
  }
}
