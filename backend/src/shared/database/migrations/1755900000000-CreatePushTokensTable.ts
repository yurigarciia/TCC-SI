import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

// T-MOB-005: token de push (Expo) por usuário — um usuário pode ter mais de um device
// registrado (ex.: trocou de celular sem deslogar do antigo), por isso não há unicidade em
// usuario_id sozinho, só no par (usuario_id, token) pra evitar duplicar o mesmo device.
export class CreatePushTokensTable1755900000000 implements MigrationInterface {
  name = 'CreatePushTokensTable1755900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'push_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'usuario_id', type: 'uuid', isNullable: false },
          { name: 'token', type: 'varchar', isNullable: false },
          {
            name: 'criado_em',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        uniques: [
          {
            name: 'UQ_push_tokens_usuario_token',
            columnNames: ['usuario_id', 'token'],
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'push_tokens',
      new TableForeignKey({
        columnNames: ['usuario_id'],
        referencedTableName: 'usuarios',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('push_tokens');
  }
}
