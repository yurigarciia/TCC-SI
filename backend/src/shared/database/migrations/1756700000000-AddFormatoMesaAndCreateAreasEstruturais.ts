import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddFormatoMesaAndCreateAreasEstruturais1756700000000
  implements MigrationInterface
{
  name = 'AddFormatoMesaAndCreateAreasEstruturais1756700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'mesas',
      new TableColumn({
        name: 'formato',
        type: 'varchar',
        isNullable: false,
        default: "'redonda'",
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'areas_estruturais',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'salao_id', type: 'uuid' },
          { name: 'nome', type: 'varchar' },
          { name: 'x', type: 'int' },
          { name: 'y', type: 'int' },
          { name: 'largura', type: 'int' },
          { name: 'altura', type: 'int' },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'areas_estruturais',
      new TableForeignKey({
        columnNames: ['salao_id'],
        referencedTableName: 'saloes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('areas_estruturais');
    await queryRunner.dropColumn('mesas', 'formato');
  }
}
