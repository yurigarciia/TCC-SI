import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAtualizadoEmToAssociados1756500000000 implements MigrationInterface {
  name = 'AddAtualizadoEmToAssociados1756500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'associados',
      new TableColumn({
        name: 'atualizado_em',
        type: 'timestamptz',
        isNullable: false,
        default: 'now()',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('associados', 'atualizado_em');
  }
}
