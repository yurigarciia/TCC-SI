import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNomeToUsuarios1756300000000 implements MigrationInterface {
  name = 'AddNomeToUsuarios1756300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'usuarios',
      new TableColumn({
        name: 'nome',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('usuarios', 'nome');
  }
}
