import { Perfil, Usuario } from '../../domain/usuario.entity';

export interface NovoUsuario {
  email: string;
  senhaHash: string;
  perfil: Perfil;
}

export abstract class UsuarioRepositoryPort {
  abstract salvar(dados: NovoUsuario): Promise<Usuario>;
  abstract buscarPorId(id: string): Promise<Usuario | null>;
  abstract buscarPorEmail(email: string): Promise<Usuario | null>;
  abstract listarPaginado(
    pagina: number,
    limite: number,
  ): Promise<{ itens: Usuario[]; total: number }>;
}
