import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsuariosTable1755000000000 implements MigrationInterface {
  name = 'CreateUsuariosTable1755000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.createTable(
      new Table({
        name: 'usuarios',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'senha_hash', type: 'varchar' },
          { name: 'perfil', type: 'varchar' },
          {
            name: 'criado_em',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('usuarios');
  }
}
