import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateAssociadosTables1755100000000 implements MigrationInterface {
  name = 'CreateAssociadosTables1755100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'categorias_socio',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'nome', type: 'varchar', isUnique: true },
          {
            name: 'valor_mensalidade',
            type: 'numeric',
            precision: 10,
            scale: 2,
          },
          { name: 'ativa', type: 'boolean', default: true },
          { name: 'criado_em', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'associados',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'nome', type: 'varchar' },
          { name: 'cpf', type: 'varchar', isUnique: true },
          { name: 'contato', type: 'varchar' },
          { name: 'vinculo_institucional', type: 'varchar', isNullable: true },
          { name: 'categoria_socio_id', type: 'uuid', isNullable: true },
          { name: 'origem', type: 'varchar' },
          { name: 'status', type: 'varchar' },
          { name: 'criado_em', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'associados',
      new TableForeignKey({
        columnNames: ['categoria_socio_id'],
        referencedTableName: 'categorias_socio',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'dependentes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'associado_id', type: 'uuid' },
          { name: 'nome', type: 'varchar' },
          { name: 'data_nascimento', type: 'date' },
          { name: 'criado_em', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'dependentes',
      new TableForeignKey({
        columnNames: ['associado_id'],
        referencedTableName: 'associados',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('dependentes');
    await queryRunner.dropTable('associados');
    await queryRunner.dropTable('categorias_socio');
  }
}
