import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateElementosEstruturaisTable1756400000000
  implements MigrationInterface
{
  name = 'CreateElementosEstruturaisTable1756400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'elementos_estruturais',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'salao_id', type: 'uuid' },
          { name: 'tipo', type: 'varchar' },
          { name: 'x1', type: 'int' },
          { name: 'y1', type: 'int' },
          { name: 'x2', type: 'int' },
          { name: 'y2', type: 'int' },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'elementos_estruturais',
      new TableForeignKey({
        columnNames: ['salao_id'],
        referencedTableName: 'saloes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('elementos_estruturais');
  }
}
