import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushTokenRepositoryPort } from '../../application/ports/push-token-repository.port';
import { PushTokenOrmEntity } from './push-token.orm-entity';

@Injectable()
export class TypeOrmPushTokenRepositoryAdapter extends PushTokenRepositoryPort {
  constructor(
    @InjectRepository(PushTokenOrmEntity)
    private readonly repositorio: Repository<PushTokenOrmEntity>,
  ) {
    super();
  }

  async salvar(usuarioId: string, token: string): Promise<void> {
    const existente = await this.repositorio.findOne({
      where: { usuarioId, token },
    });
    if (existente) {
      return;
    }
    await this.repositorio.save(this.repositorio.create({ usuarioId, token }));
  }

  async listarTokensPorUsuarioId(usuarioId: string): Promise<string[]> {
    const registros = await this.repositorio.find({ where: { usuarioId } });
    return registros.map((registro) => registro.token);
  }

  async remover(usuarioId: string, token: string): Promise<void> {
    await this.repositorio.delete({ usuarioId, token });
  }
}
