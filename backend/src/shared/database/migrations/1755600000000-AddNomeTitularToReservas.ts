import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNomeTitularToReservas1755600000000 implements MigrationInterface {
  name = 'AddNomeTitularToReservas1755600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'reservas',
      new TableColumn({
        name: 'nome_titular',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('reservas', 'nome_titular');
  }
}
