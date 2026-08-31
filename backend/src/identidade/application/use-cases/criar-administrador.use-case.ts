import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { UsuarioRepositoryPort } from '../ports/usuario-repository.port';
import { PasswordHasherPort } from '../ports/password-hasher.port';
import { Perfil, Usuario } from '../../domain/usuario.entity';

export interface DadosNovoAdministrador {
  email: string;
  senha: string;
}

// Até esta ticket, a única forma de existir uma conta administrador era o script
// seed-admin.ts (rodado manualmente, direto no banco) — não havia nenhum jeito de conceder
// acesso administrativo pela própria aplicação (RNF02 previa RBAC/perfis, mas nunca a gestão de
// contas em si). Só cria administrador aqui de propósito: contas de associado sempre nascem
// junto de um Associado (auto-cadastro ou vincular-conta), nunca soltas.
@Injectable()
export class CriarAdministradorUseCase {
  constructor(
    @Inject(UsuarioRepositoryPort)
    private readonly usuarios: UsuarioRepositoryPort,
    @Inject(PasswordHasherPort) private readonly hasher: PasswordHasherPort,
  ) {}

  async execute(dados: DadosNovoAdministrador): Promise<Usuario> {
    const existente = await this.usuarios.buscarPorEmail(dados.email);
    if (existente) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await this.hasher.hash(dados.senha);
    return this.usuarios.salvar({
      email: dados.email,
      senhaHash,
      perfil: Perfil.ADMINISTRADOR,
    });
  }
}
