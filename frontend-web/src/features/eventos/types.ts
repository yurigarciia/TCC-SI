export type StatusEvento = "rascunho" | "publicado";

export interface Evento {
  id: string;
  nome: string;
  data: string;
  local: string;
  descricao: string | null;
  salaoId: string | null;
  status: StatusEvento;
}

export interface ConfiguracaoMesaEvento {
  id: string;
  eventoId: string;
  mesaId: string;
  preco: number;
  bloqueada: boolean;
}

export interface ConfiguracaoIngressoEvento {
  id: string;
  eventoId: string;
  quantidadeDisponivel: number;
  preco: number;
}

export interface EventoDetalhado {
  evento: Evento;
  mesas: ConfiguracaoMesaEvento[];
  ingresso: ConfiguracaoIngressoEvento | null;
}

export interface NovoEventoInput {
  nome: string;
  data: string;
  local: string;
  descricao?: string;
  salaoId?: string;
}

export interface ConfiguracaoMesaInput {
  mesaId: string;
  preco: number;
  bloqueada: boolean;
}

export interface ConfigurarIngressoInput {
  quantidadeDisponivel: number;
  preco: number;
}

export interface AtualizarEventoInput {
  nome?: string;
  data?: string;
  local?: string;
  descricao?: string;
  salaoId?: string;
}

// Mesmos perfis de comprador do módulo de ingressos (features/ingressos/types.ts) — reexportado
// aqui pra não criar um import cruzado só por causa de um tipo.
export type PerfilComprador = "socio" | "nao_socio" | "crianca";

// null = nenhum preço configurado ainda (nem override do evento, nem padrão da entidade).
export type PrecosIngressoPorPerfil = Record<PerfilComprador, number | null>;

export interface DefinirPrecoIngressoInput {
  perfil: PerfilComprador;
  preco: number;
}
