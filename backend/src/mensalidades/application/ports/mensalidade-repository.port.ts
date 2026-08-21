import {
  FormaPagamento,
  Mensalidade,
  StatusMensalidade,
} from '../../domain/mensalidade.entity';

export interface NovaMensalidade {
  associadoId: string;
  competencia: string;
  valor: number;
  vencimento: string;
  status: StatusMensalidade;
}

export interface AtualizacaoMensalidade {
  status?: StatusMensalidade;
  formaPagamento?: FormaPagamento | null;
  pagoEm?: Date | null;
  pagamentoExternoId?: string | null;
  lembreteEnviadoEm?: Date | null;
}

export abstract class MensalidadeRepositoryPort {
  abstract salvar(dados: NovaMensalidade): Promise<Mensalidade>;
  abstract buscarPorId(id: string): Promise<Mensalidade | null>;
  abstract existeParaCompetencia(
    associadoId: string,
    competencia: string,
  ): Promise<boolean>;
  abstract listarPorAssociado(associadoId: string): Promise<Mensalidade[]>;
  abstract listarPorStatus(status: StatusMensalidade): Promise<Mensalidade[]>;
  abstract listarPendentesVencidasAte(
    dataLimite: string,
  ): Promise<Mensalidade[]>;
  abstract atualizar(
    id: string,
    dados: AtualizacaoMensalidade,
  ): Promise<Mensalidade>;
}
