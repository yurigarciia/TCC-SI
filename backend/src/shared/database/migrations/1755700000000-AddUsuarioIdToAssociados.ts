import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddUsuarioIdToAssociados1755700000000 implements MigrationInterface {
  name = 'AddUsuarioIdToAssociados1755700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'associados',
      new TableColumn({
        name: 'usuario_id',
        type: 'uuid',
        isNullable: true,
        isUnique: true,
      }),
    );
    await queryRunner.createForeignKey(
      'associados',
      new TableForeignKey({
        columnNames: ['usuario_id'],
        referencedTableName: 'usuarios',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('associados', 'usuario_id');
  }
}
