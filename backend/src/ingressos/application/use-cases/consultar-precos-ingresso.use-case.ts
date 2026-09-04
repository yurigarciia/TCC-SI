import { Inject, Injectable } from '@nestjs/common';
import { PrecoIngressoRepositoryPort } from '../ports/preco-ingresso-repository.port';
import { PerfilComprador } from '../../domain/ingresso.entity';

export type PrecosIngressoPorPerfil = Record<PerfilComprador, number | null>;

// Preço efetivo por perfil pra um evento (override do evento se existir, senão o padrão da
// entidade, senão null — mesma resolução usada de fato na emissão, ver EmitirIngressoUseCase).
// Sem use case/endpoint próprio até aqui — só existia o PUT pra definir, nunca um jeito de
// consultar o que já estava configurado (achado numa conversa com o usuário sobre a tela de
// evento não mostrar os preços atuais).
@Injectable()
export class ConsultarPrecosIngressoUseCase {
  constructor(
    @Inject(PrecoIngressoRepositoryPort)
    private readonly precos: PrecoIngressoRepositoryPort,
  ) {}

  async execute(eventoId: string): Promise<PrecosIngressoPorPerfil> {
    const perfis = Object.values(PerfilComprador);
    const resolvidos = await Promise.all(
      perfis.map((perfil) => this.precos.resolverPreco(eventoId, perfil)),
    );
    return Object.fromEntries(
      perfis.map((perfil, indice) => [perfil, resolvidos[indice]]),
    ) as PrecosIngressoPorPerfil;
  }
}
