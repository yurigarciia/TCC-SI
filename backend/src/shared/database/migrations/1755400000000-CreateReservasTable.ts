import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateReservasTable1755400000000 implements MigrationInterface {
  name = 'CreateReservasTable1755400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reservas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'evento_id', type: 'uuid' },
          { name: 'mesa_id', type: 'uuid' },
          { name: 'canal', type: 'varchar' },
          { name: 'forma_pagamento', type: 'varchar' },
          { name: 'status', type: 'varchar' },
          { name: 'pagamento_externo_id', type: 'varchar', isNullable: true },
          { name: 'criado_em', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'reservas',
      new TableForeignKey({
        columnNames: ['evento_id'],
        referencedTableName: 'eventos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'reservas',
      new TableForeignKey({
        columnNames: ['mesa_id'],
        referencedTableName: 'mesas',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // reserva-mesa.json: "Mesa ainda disponível?" — no máximo uma reserva pendente/confirmada por
    // evento+mesa, garantido pelo próprio banco (seguro sob concorrência real, não só
    // check-then-insert na aplicação).
    await queryRunner.query(`
      CREATE UNIQUE INDEX ux_reservas_mesa_ativa
      ON reservas (evento_id, mesa_id)
      WHERE status IN ('pendente', 'confirmada')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX ux_reservas_mesa_ativa');
    await queryRunner.dropTable('reservas');
  }
}
