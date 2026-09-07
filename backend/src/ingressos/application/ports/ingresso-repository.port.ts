import {
  CanalIngresso,
  FormaPagamentoIngresso,
  Ingresso,
  PerfilComprador,
  StatusIngresso,
} from '../../domain/ingresso.entity';

export interface NovoIngresso {
  eventoId: string;
  nomeComprador: string;
  perfilComprador: PerfilComprador;
  preco: number;
  canal: CanalIngresso;
  formaPagamento: FormaPagamentoIngresso;
  pagamentoExternoId: string | null;
  status: StatusIngresso;
}

export interface AtualizacaoIngresso {
  status?: StatusIngresso;
  usadoEm?: Date | null;
}

// Números pra acompanhar o evento no dia (achado numa conversa com o usuário) — agregado em SQL
// em vez de contar em cima da listagem paginada do frontend, que só teria a página atual (e
// eventos grandes passam fácil de 1 página).
export interface ResumoIngressosEvento {
  totalEmitidos: number;
  totalUsados: number;
  totalPendentes: number;
  receitaTotal: number;
}

export abstract class IngressoRepositoryPort {
  abstract salvar(dados: NovoIngresso): Promise<Ingresso>;
  abstract buscarPorId(id: string): Promise<Ingresso | null>;
  abstract contarPorEvento(eventoId: string): Promise<number>;
  abstract listarPaginadoPorEvento(
    eventoId: string,
    pagina: number,
    limite: number,
    nome?: string,
  ): Promise<{ itens: Ingresso[]; total: number }>;
  abstract atualizar(id: string, dados: AtualizacaoIngresso): Promise<Ingresso>;
  abstract resumoPorEvento(eventoId: string): Promise<ResumoIngressosEvento>;
}
