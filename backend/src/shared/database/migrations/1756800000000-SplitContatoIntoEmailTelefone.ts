import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Achado numa conversa com o usuário — "contato" era um campo livre (telefone OU e-mail,
// detectado pela presença de "@" na tela). Separado em dois campos de verdade, um pra cada tipo,
// pra não depender de heurística de exibição e abrir espaço pra integrações futuras que precisem
// de um canal específico (SMS, e-mail transacional). Backfill usa a mesma heurística (contém "@")
// pra decidir em qual coluna cada valor existente cai — sem perda de dado, só reorganização.
export class SplitContatoIntoEmailTelefone1756800000000
  implements MigrationInterface
{
  name = 'SplitContatoIntoEmailTelefone1756800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'associados',
      new TableColumn({ name: 'email', type: 'varchar', isNullable: true }),
    );
    await queryRunner.addColumn(
      'associados',
      new TableColumn({ name: 'telefone', type: 'varchar', isNullable: true }),
    );

    await queryRunner.query(`
      UPDATE associados
      SET email = CASE WHEN contato LIKE '%@%' THEN contato ELSE NULL END,
          telefone = CASE WHEN contato NOT LIKE '%@%' THEN contato ELSE NULL END
    `);

    await queryRunner.dropColumn('associados', 'contato');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'associados',
      new TableColumn({ name: 'contato', type: 'varchar', isNullable: true }),
    );
    await queryRunner.query(`
      UPDATE associados
      SET contato = COALESCE(email, telefone, '')
    `);
    await queryRunner.changeColumn(
      'associados',
      'contato',
      new TableColumn({ name: 'contato', type: 'varchar', isNullable: false }),
    );
    await queryRunner.dropColumn('associados', 'email');
    await queryRunner.dropColumn('associados', 'telefone');
  }
}
