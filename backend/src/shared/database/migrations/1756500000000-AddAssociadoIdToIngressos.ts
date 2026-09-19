import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

// Achado numa conversa com o usuário: o Ingresso nunca guardou o vínculo com o Associado (só o
// nome do comprador, capturado na hora da compra) — sem isso, não tem como o app mobile listar
// "meus ingressos" do associado logado. Nullable porque ingresso emitido pela diretoria pra
// visitante/criança sem cadastro continua válido sem esse vínculo.
export class AddAssociadoIdToIngressos1756500000000
  implements MigrationInterface
{
  name = 'AddAssociadoIdToIngressos1756500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'ingressos',
      new TableColumn({
        name: 'associado_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'ingressos',
      new TableForeignKey({
        columnNames: ['associado_id'],
        referencedTableName: 'associados',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('ingressos');
    const foreignKey = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes('associado_id'),
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('ingressos', foreignKey);
    }
    await queryRunner.dropColumn('ingressos', 'associado_id');
  }
}
