import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

// Achado numa conversa com o usuário — ingressos não tinham nenhum identificador curto e
// legível: a listagem de ingressos de um evento, quando a mesma pessoa compra vários (ex.: pra
// acompanhantes), mostrava o mesmo nome repetido sem jeito de saber qual é qual (o UUID interno
// não serve pra isso, é só o payload do QR). `codigo` é um contador sequencial por evento
// (reinicia em 1 pra cada evento), gerado na emissão — ver EmitirIngressoUseCase. Backfill numera
// os ingressos já existentes por evento, na ordem em que foram criados.
export class AddCodigoToIngressos1756900000000 implements MigrationInterface {
  name = 'AddCodigoToIngressos1756900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'ingressos',
      new TableColumn({ name: 'codigo', type: 'integer', isNullable: true }),
    );

    await queryRunner.query(`
      WITH numerados AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY evento_id ORDER BY criado_em, id) AS rn
        FROM ingressos
      )
      UPDATE ingressos
      SET codigo = numerados.rn
      FROM numerados
      WHERE ingressos.id = numerados.id
    `);

    await queryRunner.changeColumn(
      'ingressos',
      'codigo',
      new TableColumn({ name: 'codigo', type: 'integer', isNullable: false }),
    );

    await queryRunner.createIndex(
      'ingressos',
      new TableIndex({
        name: 'UQ_ingressos_evento_codigo',
        columnNames: ['evento_id', 'codigo'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('ingressos', 'UQ_ingressos_evento_codigo');
    await queryRunner.dropColumn('ingressos', 'codigo');
  }
}
