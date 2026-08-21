import { Inject, Injectable } from '@nestjs/common';
import { UsuarioRepositoryPort } from '../ports/usuario-repository.port';
import { Usuario } from '../../domain/usuario.entity';

@Injectable()
export class ListarUsuariosUseCase {
  constructor(
    @Inject(UsuarioRepositoryPort)
    private readonly usuarios: UsuarioRepositoryPort,
  ) {}

  execute(): Promise<Usuario[]> {
    return this.usuarios.listarTodos();
  }
}
