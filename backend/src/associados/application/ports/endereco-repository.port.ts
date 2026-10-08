import { Endereco } from '../../domain/endereco.entity';

export interface NovoEndereco {
  associadoId: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
}

export abstract class EnderecoRepositoryPort {
  abstract buscarPorAssociadoId(associadoId: string): Promise<Endereco | null>;
  // Upsert de propósito: usado tanto no cadastro (sempre cria) quanto na edição (associados
  // cadastrados antes desta funcionalidade ainda não têm endereço, então a primeira edição cria).
  abstract salvarOuAtualizar(dados: NovoEndereco): Promise<Endereco>;
}
