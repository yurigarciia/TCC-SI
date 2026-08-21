import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEventosTables1755300000000 implements MigrationInterface {
  name = 'CreateEventosTables1755300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'saloes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'nome', type: 'varchar' },
          { name: 'capacidade_total', type: 'int' },
          { name: 'criado_em', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mesas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'salao_id', type: 'uuid' },
          { name: 'numero', type: 'int' },
          { name: 'capacidade', type: 'int' },
          { name: 'posicao_x', type: 'int' },
          { name: 'posicao_y', type: 'int' },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'mesas',
      new TableForeignKey({
        columnNames: ['salao_id'],
        referencedTableName: 'saloes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'eventos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'nome', type: 'varchar' },
          { name: 'data', type: 'timestamptz' },
          { name: 'local', type: 'varchar' },
          { name: 'descricao', type: 'varchar', isNullable: true },
          { name: 'salao_id', type: 'uuid', isNullable: true },
          { name: 'status', type: 'varchar' },
          { name: 'criado_em', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'eventos',
      new TableForeignKey({
        columnNames: ['salao_id'],
        referencedTableName: 'saloes',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'configuracoes_mesa_evento',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'evento_id', type: 'uuid' },
          { name: 'mesa_id', type: 'uuid' },
          { name: 'preco', type: 'numeric', precision: 10, scale: 2 },
          { name: 'bloqueada', type: 'boolean', default: false },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'configuracoes_mesa_evento',
      new TableForeignKey({
        columnNames: ['evento_id'],
        referencedTableName: 'eventos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'configuracoes_mesa_evento',
      new TableForeignKey({
        columnNames: ['mesa_id'],
        referencedTableName: 'mesas',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'configuracoes_ingresso_evento',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'evento_id', type: 'uuid', isUnique: true },
          { name: 'quantidade_disponivel', type: 'int' },
          { name: 'preco', type: 'numeric', precision: 10, scale: 2 },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'configuracoes_ingresso_evento',
      new TableForeignKey({
        columnNames: ['evento_id'],
        referencedTableName: 'eventos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('configuracoes_ingresso_evento');
    await queryRunner.dropTable('configuracoes_mesa_evento');
    await queryRunner.dropTable('eventos');
    await queryRunner.dropTable('mesas');
    await queryRunner.dropTable('saloes');
  }
}
