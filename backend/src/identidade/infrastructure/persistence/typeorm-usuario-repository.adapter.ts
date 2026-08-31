import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NovoUsuario,
  UsuarioRepositoryPort,
} from '../../application/ports/usuario-repository.port';
import { Usuario } from '../../domain/usuario.entity';
import { UsuarioOrmEntity } from './usuario.orm-entity';

@Injectable()
export class TypeOrmUsuarioRepositoryAdapter extends UsuarioRepositoryPort {
  constructor(
    @InjectRepository(UsuarioOrmEntity)
    private readonly repo: Repository<UsuarioOrmEntity>,
  ) {
    super();
  }

  async salvar(dados: NovoUsuario): Promise<Usuario> {
    const criado = await this.repo.save(this.repo.create(dados));
    return this.paraDominio(criado);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const encontrado = await this.repo.findOneBy({ id });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const encontrado = await this.repo.findOneBy({ email });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async listarPaginado(
    pagina: number,
    limite: number,
  ): Promise<{ itens: Usuario[]; total: number }> {
    const [encontrados, total] = await this.repo.findAndCount({
      order: { criadoEm: 'DESC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return {
      itens: encontrados.map((usuario) => this.paraDominio(usuario)),
      total,
    };
  }

  private paraDominio(orm: UsuarioOrmEntity): Usuario {
    return new Usuario(orm.id, orm.email, orm.senhaHash, orm.perfil);
  }
}
