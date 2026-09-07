export enum TipoElementoEstrutural {
  PAREDE = 'parede',
  PORTA = 'porta',
}

// Traço de parede ou porta desenhado no croqui — um segmento de reta simples (dois pontos), no
// mesmo plano cartesiano das mesas (posicaoX/posicaoY em pixels). Achado numa conversa com o
// usuário: mostrar só mesas soltas num plano em branco não dava pra alguém leigo reconhecer o
// salão de verdade — precisa de paredes/portas pra virar um croqui de fato.
export class ElementoEstrutural {
  constructor(
    public readonly id: string,
    public readonly salaoId: string,
    public readonly tipo: TipoElementoEstrutural,
    public readonly x1: number,
    public readonly y1: number,
    public readonly x2: number,
    public readonly y2: number,
  ) {}
}
