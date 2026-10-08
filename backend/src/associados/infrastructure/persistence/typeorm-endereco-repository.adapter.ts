import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EnderecoRepositoryPort,
  NovoEndereco,
} from '../../application/ports/endereco-repository.port';
import { Endereco } from '../../domain/endereco.entity';
import { EnderecoOrmEntity } from './endereco.orm-entity';

@Injectable()
export class TypeOrmEnderecoRepositoryAdapter extends EnderecoRepositoryPort {
  constructor(
    @InjectRepository(EnderecoOrmEntity)
    private readonly repo: Repository<EnderecoOrmEntity>,
  ) {
    super();
  }

  async buscarPorAssociadoId(associadoId: string): Promise<Endereco | null> {
    const encontrado = await this.repo.findOneBy({ associadoId });
    return encontrado ? this.paraDominio(encontrado) : null;
  }

  async salvarOuAtualizar(dados: NovoEndereco): Promise<Endereco> {
    const existente = await this.repo.findOneBy({
      associadoId: dados.associadoId,
    });
    if (existente) {
      await this.repo.update({ associadoId: dados.associadoId }, dados);
      const atualizado = await this.repo.findOneByOrFail({
        associadoId: dados.associadoId,
      });
      return this.paraDominio(atualizado);
    }
    const criado = await this.repo.save(this.repo.create(dados));
    return this.paraDominio(criado);
  }

  private paraDominio(orm: EnderecoOrmEntity): Endereco {
    return new Endereco(
      orm.id,
      orm.associadoId,
      orm.cep,
      orm.logradouro,
      orm.numero,
      orm.complemento,
      orm.bairro,
      orm.cidade,
      orm.uf,
    );
  }
}
