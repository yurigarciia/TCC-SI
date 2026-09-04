import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// "Ingresso avulso" tinha um preço próprio ("de vitrine"), independente do preço por perfil/
// categoria resolvido na emissão (PrecoIngressoRepositoryPort) — dois valores que podiam
// divergir (mostrar R$X na vitrine do app, cobrar R$Y na hora de comprar). Achado numa conversa
// com o usuário: a seção passa a controlar só o estoque (quantidadeDisponivel); o app mostra o
// preço efetivo (ver GET /eventos/:eventoId/meu-preco-ingresso).
export class RemovePrecoFromConfiguracaoIngressoEvento1756200000000
  implements MigrationInterface
{
  name = 'RemovePrecoFromConfiguracaoIngressoEvento1756200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('configuracoes_ingresso_evento', 'preco');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'configuracoes_ingresso_evento',
      new TableColumn({
        name: 'preco',
        type: 'numeric',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );
  }
}
