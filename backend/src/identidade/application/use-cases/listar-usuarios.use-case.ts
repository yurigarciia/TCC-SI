import { Inject, Injectable } from '@nestjs/common';
import { UsuarioRepositoryPort } from '../ports/usuario-repository.port';
import { Usuario } from '../../domain/usuario.entity';
import {
  montarPaginaResultado,
  PaginaResultado,
} from '../../../shared/pagination/pagina-resultado';

@Injectable()
export class ListarUsuariosUseCase {
  constructor(
    @Inject(UsuarioRepositoryPort)
    private readonly usuarios: UsuarioRepositoryPort,
  ) {}

  async execute(
    pagina: number,
    limite: number,
    busca?: string,
  ): Promise<PaginaResultado<Usuario>> {
    const { itens, total } = await this.usuarios.listarPaginado(
      pagina,
      limite,
      busca,
    );
    return montarPaginaResultado(itens, total, pagina, limite);
  }
}
