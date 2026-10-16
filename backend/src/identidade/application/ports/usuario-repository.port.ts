import { Perfil, Usuario } from '../../domain/usuario.entity';

export interface NovoUsuario {
  email: string;
  senhaHash: string;
  perfil: Perfil;
  nome?: string | null;
}

export interface AtualizacaoUsuario {
  nome?: string;
  email?: string;
}

export abstract class UsuarioRepositoryPort {
  abstract salvar(dados: NovoUsuario): Promise<Usuario>;
  abstract buscarPorId(id: string): Promise<Usuario | null>;
  abstract buscarPorEmail(email: string): Promise<Usuario | null>;
  abstract listarPaginado(
    pagina: number,
    limite: number,
    busca?: string,
    perfil?: Perfil,
  ): Promise<{ itens: Usuario[]; total: number }>;
  abstract atualizar(id: string, dados: AtualizacaoUsuario): Promise<Usuario>;
  abstract atualizarSenha(id: string, senhaHash: string): Promise<void>;
  abstract excluir(id: string): Promise<void>;
}
