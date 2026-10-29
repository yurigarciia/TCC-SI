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

// Só controla o estoque — o preço de fato cobrado é resolvido por perfil/categoria do associado
// (ver useMeuPrecoIngresso), nunca um valor fixo aqui (antes havia um "preço de vitrine" aqui que
// podia divergir do efetivamente cobrado — removido).
export interface ConfiguracaoIngressoEvento {
  id: string;
  eventoId: string;
  quantidadeDisponivel: number;
}

export interface EventoDetalhado {
  evento: Evento;
  mesas: ConfiguracaoMesaEvento[];
  ingresso: ConfiguracaoIngressoEvento | null;
}

export type StatusMesaNoMapa = "livre" | "pendente" | "reservada" | "bloqueada";
export type CanalReserva = "app" | "mediado";
export type FormaPagamentoReserva = "online" | "presencial";
export type FormatoMesaNoMapa = "redonda" | "retangular";

export interface MesaNoMapa {
  mesaId: string;
  numero: number;
  capacidade: number;
  posicaoX: number;
  posicaoY: number;
  formato: FormatoMesaNoMapa;
  preco: number;
  status: StatusMesaNoMapa;
  reservaId: string | null;
  nomeTitular: string | null;
  canal: CanalReserva | null;
}

export type TipoElementoEstruturalNoMapa = "parede" | "porta";

export interface ElementoEstruturalNoMapa {
  id: string;
  tipo: TipoElementoEstruturalNoMapa;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AreaEstruturalNoMapa {
  id: string;
  nome: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface MapaMesasEvento {
  mesas: MesaNoMapa[];
  elementos: ElementoEstruturalNoMapa[];
  areas: AreaEstruturalNoMapa[];
}
