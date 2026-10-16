import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioRepositoryPort } from '../ports/usuario-repository.port';
import { Usuario } from '../../domain/usuario.entity';

export interface DadosAtualizacaoUsuario {
  nome?: string;
  email?: string;
}

@Injectable()
export class AtualizarUsuarioUseCase {
  constructor(
    @Inject(UsuarioRepositoryPort)
    private readonly usuarios: UsuarioRepositoryPort,
  ) {}

  async execute(id: string, dados: DadosAtualizacaoUsuario): Promise<Usuario> {
    const existente = await this.usuarios.buscarPorId(id);
    if (!existente) {
      throw new NotFoundException('Usuário não encontrado');
    }
    if (dados.email && dados.email !== existente.email) {
      const comMesmoEmail = await this.usuarios.buscarPorEmail(dados.email);
      if (comMesmoEmail) {
        throw new ConflictException('E-mail já cadastrado');
      }
    }
    return this.usuarios.atualizar(id, dados);
  }
}
