export interface DadosCobranca {
  valor: number;
  descricao: string;
  referenciaExterna: string;
}

export type StatusCobrancaGateway = 'pendente' | 'aprovada' | 'recusada';

export interface CobrancaIniciada {
  idGateway: string;
  status: StatusCobrancaGateway;
  linkPagamento: string;
}

// Abstrai o provedor de pagamento (Stripe, Mercado Pago, PagSeguro etc.) — decisão ainda em aberto
// (ver Open Questions em TCC-FINAL/aplicacoes/PLANEJAMENTO-GERAL.md). Nenhum use case de domínio
// deve depender do SDK de um provedor específico; só desta porta.
export abstract class PaymentGatewayPort {
  abstract iniciarCobranca(dados: DadosCobranca): Promise<CobrancaIniciada>;
  abstract consultarStatus(idGateway: string): Promise<StatusCobrancaGateway>;
}
