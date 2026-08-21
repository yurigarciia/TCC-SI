import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateIngressosTables1755500000000 implements MigrationInterface {
  name = 'CreateIngressosTables1755500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'precos_ingresso',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'evento_id', type: 'uuid', isNullable: true },
          { name: 'perfil', type: 'varchar' },
          { name: 'preco', type: 'numeric', precision: 10, scale: 2 },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'precos_ingresso',
      new TableForeignKey({
        columnNames: ['evento_id'],
        referencedTableName: 'eventos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'ingressos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'evento_id', type: 'uuid' },
          { name: 'nome_comprador', type: 'varchar' },
          { name: 'perfil_comprador', type: 'varchar' },
          { name: 'preco', type: 'numeric', precision: 10, scale: 2 },
          { name: 'canal', type: 'varchar' },
          { name: 'forma_pagamento', type: 'varchar' },
          { name: 'pagamento_externo_id', type: 'varchar', isNullable: true },
          { name: 'status', type: 'varchar' },
          { name: 'usado_em', type: 'timestamptz', isNullable: true },
          { name: 'criado_em', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'ingressos',
      new TableForeignKey({
        columnNames: ['evento_id'],
        referencedTableName: 'eventos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ingressos');
    await queryRunner.dropTable('precos_ingresso');
  }
}
