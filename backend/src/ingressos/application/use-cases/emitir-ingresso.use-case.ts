import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IngressoRepositoryPort } from '../ports/ingresso-repository.port';
import { PrecoIngressoRepositoryPort } from '../ports/preco-ingresso-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { ConfiguracaoIngressoEventoRepositoryPort } from '../../../eventos/application/ports/configuracao-ingresso-evento-repository.port';
import { PaymentGatewayPort } from '../../../shared/payments/application/ports/payment-gateway.port';
import {
  CanalIngresso,
  FormaPagamentoIngresso,
  Ingresso,
  PerfilComprador,
  StatusIngresso,
} from '../../domain/ingresso.entity';

export interface DadosEmissaoIngresso {
  nomeComprador: string;
  perfilComprador: PerfilComprador;
  canal: CanalIngresso;
  formaPagamento: FormaPagamentoIngresso;
  // Obrigatório quando perfilComprador = SOCIO (preço varia por categoria de sócio); ignorado
  // pros demais perfis.
  categoriaSocioId?: string;
  // Sobrescreve o preço resolvido por perfil/categoria — ver nota em EmitirIngressoDto. Só chega
  // aqui pela venda presencial (EmitirIngressoDto); ComprarMeuIngressoUseCase (compra pelo app)
  // nunca preenche isso, sempre resolvido pelo backend.
  preco?: number;
}

// emissao-ingresso.json: preço diferenciado por perfil (sócio/não-sócio/criança), padrão da
// entidade com override por evento; associado pelo app sempre paga online; diretoria vende
// presencial para qualquer perfil (associado, visitante ou criança).
@Injectable()
export class EmitirIngressoUseCase {
  constructor(
    @Inject(IngressoRepositoryPort)
    private readonly ingressos: IngressoRepositoryPort,
    @Inject(PrecoIngressoRepositoryPort)
    private readonly precos: PrecoIngressoRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(ConfiguracaoIngressoEventoRepositoryPort)
    private readonly configuracaoIngresso: ConfiguracaoIngressoEventoRepositoryPort,
    @Inject(PaymentGatewayPort) private readonly gateway: PaymentGatewayPort,
  ) {}

  async execute(
    eventoId: string,
    dados: DadosEmissaoIngresso,
  ): Promise<Ingresso> {
    const evento = await this.eventos.buscarPorId(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    const configuracao =
      await this.configuracaoIngresso.buscarPorEvento(eventoId);
    if (!configuracao) {
      throw new BadRequestException(
        'Ingresso avulso não configurado para este evento',
      );
    }
    const emitidos = await this.ingressos.contarPorEvento(eventoId);
    if (emitidos >= configuracao.quantidadeDisponivel) {
      throw new ConflictException('Ingressos esgotados para este evento');
    }

    if (dados.perfilComprador === PerfilComprador.SOCIO && !dados.categoriaSocioId) {
      throw new BadRequestException(
        'Informe a categoria de sócio do comprador',
      );
    }

    const preco =
      dados.preco !== undefined
        ? dados.preco
        : await this.precos.resolverPreco(
            eventoId,
            dados.perfilComprador,
            dados.categoriaSocioId ?? null,
          );
    if (preco === null) {
      throw new BadRequestException(
        'Preço não configurado para esse perfil de comprador',
      );
    }

    let pagamentoExternoId: string | null = null;
    if (dados.canal === CanalIngresso.APP) {
      const cobranca = await this.gateway.iniciarCobranca({
        valor: preco,
        descricao: `Ingresso — evento ${evento.nome}`,
        referenciaExterna: `${eventoId}:${dados.nomeComprador}`,
      });
      pagamentoExternoId = cobranca.idGateway;
    }

    return this.ingressos.salvar({
      eventoId,
      nomeComprador: dados.nomeComprador,
      perfilComprador: dados.perfilComprador,
      preco,
      canal: dados.canal,
      formaPagamento: dados.formaPagamento,
      pagamentoExternoId,
      status: StatusIngresso.EMITIDO,
    });
  }
}
