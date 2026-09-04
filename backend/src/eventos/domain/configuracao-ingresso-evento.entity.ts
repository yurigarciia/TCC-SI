// Só controla o estoque do ingresso avulso — o preço de fato cobrado é resolvido por
// perfil/categoria (ver PrecoIngressoRepositoryPort no módulo de ingressos), nunca um valor fixo
// aqui. Achado numa conversa com o usuário: até essa mudança havia dois preços independentes por
// evento (este, de "vitrine", e o resolvido por perfil na emissão) que podiam divergir — mostrar
// R$X na vitrine e cobrar R$Y na hora de comprar.
export class ConfiguracaoIngressoEvento {
  constructor(
    public readonly id: string,
    public readonly eventoId: string,
    public readonly quantidadeDisponivel: number,
  ) {}
}
