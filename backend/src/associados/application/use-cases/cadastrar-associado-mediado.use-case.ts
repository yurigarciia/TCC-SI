import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import { DependenteRepositoryPort } from '../ports/dependente-repository.port';
import {
  EnderecoRepositoryPort,
  NovoEndereco,
} from '../ports/endereco-repository.port';
import {
  Associado,
  OrigemCadastro,
  StatusAssociado,
} from '../../domain/associado.entity';
import { Dependente } from '../../domain/dependente.entity';

export interface DadosCadastroMediado {
  nome: string;
  cpf: string;
  contato: string;
  vinculoInstitucional: string | null;
  categoriaSocioId: string | null;
  endereco: Omit<NovoEndereco, 'associadoId'>;
  dependentes: Array<{ nome: string; dataNascimento: string }>;
}

export interface CadastroMediadoResultado {
  associado: Associado;
  dependentes: Dependente[];
}

@Injectable()
export class CadastrarAssociadoMediadoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(DependenteRepositoryPort)
    private readonly dependentes: DependenteRepositoryPort,
    @Inject(EnderecoRepositoryPort)
    private readonly enderecos: EnderecoRepositoryPort,
  ) {}

  async execute(
    dados: DadosCadastroMediado,
  ): Promise<CadastroMediadoResultado> {
    const existente = await this.associados.buscarPorCpf(dados.cpf);
    if (existente) {
      throw new ConflictException('CPF já cadastrado');
    }

    // Assunção documentada (pendência #1 de TCC-FINAL/arquitetura/decisoes.md, ainda sem resposta
    // da entidade): cadastro mediado pela diretoria entra como Ativo imediatamente, diferente do
    // auto-cadastro (que sempre passa por aprovação). Revisitar quando a validação de campo
    // confirmar o comportamento esperado.
    const associado = await this.associados.salvar({
      nome: dados.nome,
      cpf: dados.cpf,
      contato: dados.contato,
      vinculoInstitucional: dados.vinculoInstitucional,
      categoriaSocioId: dados.categoriaSocioId,
      origem: OrigemCadastro.MEDIADO,
      status: StatusAssociado.ATIVO,
      usuarioId: null,
    });

    await this.enderecos.salvarOuAtualizar({
      associadoId: associado.id,
      ...dados.endereco,
    });

    const dependentesCriados: Dependente[] = [];
    for (const dependente of dados.dependentes) {
      dependentesCriados.push(
        await this.dependentes.salvar({
          associadoId: associado.id,
          nome: dependente.nome,
          dataNascimento: dependente.dataNascimento,
        }),
      );
    }

    return { associado, dependentes: dependentesCriados };
  }
}
