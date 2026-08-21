import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateMensalidadesTable1755200000000 implements MigrationInterface {
  name = 'CreateMensalidadesTable1755200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mensalidades',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'associado_id', type: 'uuid' },
          { name: 'competencia', type: 'varchar' },
          { name: 'valor', type: 'numeric', precision: 10, scale: 2 },
          { name: 'vencimento', type: 'date' },
          { name: 'status', type: 'varchar' },
          { name: 'forma_pagamento', type: 'varchar', isNullable: true },
          { name: 'pago_em', type: 'timestamptz', isNullable: true },
          { name: 'pagamento_externo_id', type: 'varchar', isNullable: true },
          {
            name: 'lembrete_enviado_em',
            type: 'timestamptz',
            isNullable: true,
          },
          { name: 'criado_em', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'mensalidades',
      new TableForeignKey({
        columnNames: ['associado_id'],
        referencedTableName: 'associados',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('mensalidades');
  }
}
