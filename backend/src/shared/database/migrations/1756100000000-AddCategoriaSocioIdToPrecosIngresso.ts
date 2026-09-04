import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Preço de ingresso pro perfil "sócio" deixa de ser um valor único e passa a variar por
// categoria de sócio (Contribuinte, Benemérito etc.) — achado numa conversa com o usuário depois
// do preço único ter sido implementado primeiro (ver adendo em T-BE-009 no
// PLANEJAMENTO-GERAL.md). Coluna nullable: só é preenchida quando perfil = 'socio'; para
// NAO_SOCIO/CRIANCA (que não têm categoria) continua null, mantendo um preço só por perfil.
export class AddCategoriaSocioIdToPrecosIngresso1756100000000
  implements MigrationInterface
{
  name = 'AddCategoriaSocioIdToPrecosIngresso1756100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'precos_ingresso',
      new TableColumn({
        name: 'categoria_socio_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('precos_ingresso', 'categoria_socio_id');
  }
}
