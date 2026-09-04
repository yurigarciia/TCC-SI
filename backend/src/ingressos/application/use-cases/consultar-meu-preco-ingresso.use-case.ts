import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrecoIngressoRepositoryPort } from '../ports/preco-ingresso-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { PerfilComprador } from '../../domain/ingresso.entity';

export interface MeuPrecoIngresso {
  preco: number | null;
}

// Preço que o próprio associado logado pagaria pelo ingresso avulso deste evento — sempre perfil
// sócio, resolvido pela categoria dele (mesma resolução da emissão de fato,
// EmitirIngressoUseCase). null quando o associado não tem categoria definida, ou quando nenhum
// preço foi configurado pra ela — não é erro, só "ainda não dá pra mostrar um valor". Usado pela
// tela pública do evento no app (a rota é protegida por login no app, mesmo a API sendo
// autenticada só aqui — a vitrine de eventos publicados continua sem exigir login).
@Injectable()
export class ConsultarMeuPrecoIngressoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(PrecoIngressoRepositoryPort)
    private readonly precos: PrecoIngressoRepositoryPort,
  ) {}

  async execute(usuarioId: string, eventoId: string): Promise<MeuPrecoIngresso> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }
    if (!associado.categoriaSocioId) {
      return { preco: null };
    }
    const preco = await this.precos.resolverPreco(
      eventoId,
      PerfilComprador.SOCIO,
      associado.categoriaSocioId,
    );
    return { preco };
  }
}
