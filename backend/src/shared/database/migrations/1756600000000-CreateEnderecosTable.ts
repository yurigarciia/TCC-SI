import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateEnderecosTable1756600000000 implements MigrationInterface {
  name = 'CreateEnderecosTable1756600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'enderecos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'associado_id', type: 'uuid', isUnique: true },
          { name: 'cep', type: 'varchar' },
          { name: 'logradouro', type: 'varchar' },
          { name: 'numero', type: 'varchar' },
          { name: 'complemento', type: 'varchar', isNullable: true },
          { name: 'bairro', type: 'varchar' },
          { name: 'cidade', type: 'varchar' },
          { name: 'uf', type: 'varchar', length: '2' },
          {
            name: 'criado_em',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'atualizado_em',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'enderecos',
      new TableForeignKey({
        columnNames: ['associado_id'],
        referencedTableName: 'associados',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('enderecos');
  }
}
