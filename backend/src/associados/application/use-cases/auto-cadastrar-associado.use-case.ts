import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import {
  EnderecoRepositoryPort,
  NovoEndereco,
} from '../ports/endereco-repository.port';
import { UsuarioRepositoryPort } from '../../../identidade/application/ports/usuario-repository.port';
import { PasswordHasherPort } from '../../../identidade/application/ports/password-hasher.port';
import { Perfil } from '../../../identidade/domain/usuario.entity';
import {
  Associado,
  OrigemCadastro,
  StatusAssociado,
} from '../../domain/associado.entity';

export interface DadosAutoCadastro {
  nome: string;
  cpf: string;
  contato: string;
  vinculoInstitucional: string | null;
  endereco: Omit<NovoEndereco, 'associadoId'>;
  email: string;
  senha: string;
}

// Único caminho hoje que cria Usuario (login) + Associado juntos e já vinculados — é o que
// permite ao associado depois se autenticar e consultar seus próprios dados (RF13, "Minhas
// Reservas"). O cadastro mediado pela diretoria (CadastrarAssociadoMediadoUseCase) continua sem
// usuarioId: não há hoje um fluxo mapeado para o associado "reivindicar" a própria conta depois
// de um cadastro feito pela diretoria — ver Open Questions em PLANEJAMENTO-GERAL.md.
@Injectable()
export class AutoCadastrarAssociadoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(EnderecoRepositoryPort)
    private readonly enderecos: EnderecoRepositoryPort,
    @Inject(UsuarioRepositoryPort)
    private readonly usuarios: UsuarioRepositoryPort,
    @Inject(PasswordHasherPort) private readonly hasher: PasswordHasherPort,
  ) {}

  async execute(dados: DadosAutoCadastro): Promise<Associado> {
    const cpfExistente = await this.associados.buscarPorCpf(dados.cpf);
    if (cpfExistente) {
      throw new ConflictException('CPF já cadastrado');
    }
    const emailExistente = await this.usuarios.buscarPorEmail(dados.email);
    if (emailExistente) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await this.hasher.hash(dados.senha);
    const usuario = await this.usuarios.salvar({
      email: dados.email,
      senhaHash,
      perfil: Perfil.ASSOCIADO,
    });

    const associado = await this.associados.salvar({
      nome: dados.nome,
      cpf: dados.cpf,
      contato: dados.contato,
      vinculoInstitucional: dados.vinculoInstitucional,
      categoriaSocioId: null,
      origem: OrigemCadastro.AUTO_CADASTRO,
      status: StatusAssociado.PENDENTE_VALIDACAO,
      usuarioId: usuario.id,
    });

    await this.enderecos.salvarOuAtualizar({
      associadoId: associado.id,
      ...dados.endereco,
    });

    return associado;
  }
}
