import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssociadoRepositoryPort } from '../ports/associado-repository.port';
import { UsuarioRepositoryPort } from '../../../identidade/application/ports/usuario-repository.port';
import { PasswordHasherPort } from '../../../identidade/application/ports/password-hasher.port';
import { Perfil } from '../../../identidade/domain/usuario.entity';
import { Associado } from '../../domain/associado.entity';

export interface DadosVincularConta {
  cpf: string;
  email: string;
  senha: string;
}

// Fecha a lacuna documentada desde T-BE-012 ("não existe hoje um fluxo mapeado de associado
// reivindicar a própria conta depois de cadastro feito pela diretoria") — necessária para
// T-MOB-001: um associado com cadastro mediado (sem usuarioId) precisa conseguir criar login e se
// vincular ao próprio cadastro, sem duplicar o registro nem passar de novo pela fila de aprovação
// do auto-cadastro (o cadastro mediado já nasce Ativo, ver CadastrarAssociadoMediadoUseCase).
@Injectable()
export class VincularContaAssociadoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(UsuarioRepositoryPort)
    private readonly usuarios: UsuarioRepositoryPort,
    @Inject(PasswordHasherPort) private readonly hasher: PasswordHasherPort,
  ) {}

  async execute(dados: DadosVincularConta): Promise<Associado> {
    const associado = await this.associados.buscarPorCpf(dados.cpf);
    if (!associado) {
      throw new NotFoundException(
        'CPF não encontrado — se você ainda não é associado, use o auto-cadastro',
      );
    }
    if (associado.usuarioId) {
      throw new ConflictException(
        'Este cadastro já tem uma conta vinculada — faça login em vez de vincular de novo',
      );
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

    return this.associados.atualizar(associado.id, { usuarioId: usuario.id });
  }
}
