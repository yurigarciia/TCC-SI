import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddAssociadoIdToReservas1755800000000 implements MigrationInterface {
  name = 'AddAssociadoIdToReservas1755800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'reservas',
      new TableColumn({
        name: 'associado_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'reservas',
      new TableForeignKey({
        columnNames: ['associado_id'],
        referencedTableName: 'associados',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('reservas', 'associado_id');
  }
}
