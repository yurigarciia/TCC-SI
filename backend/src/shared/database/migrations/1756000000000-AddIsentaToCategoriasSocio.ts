import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Algumas categorias de sócio (ex.: benemérito, honorário) são isentas de mensalidade — regra de
// negócio real da entidade que nunca tinha sido modelada (nem no artigo, nem nos fluxos
// mapeados). GerarCobrancasMensaisUseCase passa a pular por completo a geração de cobrança para
// associados numa categoria isenta, em vez de gerar uma cobrança de valor zero.
export class AddIsentaToCategoriasSocio1756000000000 implements MigrationInterface {
  name = 'AddIsentaToCategoriasSocio1756000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'categorias_socio',
      new TableColumn({
        name: 'isenta',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('categorias_socio', 'isenta');
  }
}
