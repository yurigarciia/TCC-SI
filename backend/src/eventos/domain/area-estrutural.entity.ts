// Área retangular livre no croqui, com um nome digitado pela entidade (ex.: "Tablado", "Bar",
// "Pista de dança") — achado numa conversa com o usuário: parede/porta davam a forma do salão,
// mas faltava marcar os espaços internos que não são mesa nem traço de parede. Sem enum de tipos
// fixos de propósito: cada entidade usa o vocabulário que já conhece pro próprio salão, em vez de
// ficar presa a uma lista de presets que nunca cobre todo mundo.
export class AreaEstrutural {
  constructor(
    public readonly id: string,
    public readonly salaoId: string,
    public readonly nome: string,
    public readonly x: number,
    public readonly y: number,
    public readonly largura: number,
    public readonly altura: number,
  ) {}
}
