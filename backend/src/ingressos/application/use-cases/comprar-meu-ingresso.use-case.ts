import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { EmitirIngressoUseCase } from './emitir-ingresso.use-case';
import {
  CanalIngresso,
  FormaPagamentoIngresso,
  Ingresso,
  PerfilComprador,
} from '../../domain/ingresso.entity';

// emissao-ingresso.json: "associado compra pelo app (sempre paga online)". Diferente de
// EmitirIngressoUseCase (usado pela diretoria, que registra venda presencial pra qualquer
// perfil), aqui perfil/canal/forma de pagamento/nome do comprador são sempre resolvidos a partir
// do próprio usuário autenticado — o associado só decide comprar, sem parâmetros livres.
@Injectable()
export class ComprarMeuIngressoUseCase {
  constructor(
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    private readonly emitirIngresso: EmitirIngressoUseCase,
  ) {}

  async execute(usuarioId: string, eventoId: string): Promise<Ingresso> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }
    return this.emitirIngresso.execute(eventoId, {
      nomeComprador: associado.nome,
      perfilComprador: PerfilComprador.SOCIO,
      canal: CanalIngresso.APP,
      formaPagamento: FormaPagamentoIngresso.ONLINE,
    });
  }
}
