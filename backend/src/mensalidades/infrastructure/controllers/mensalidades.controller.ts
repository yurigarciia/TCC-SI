import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../identidade/infrastructure/security/jwt-auth.guard';
import { RolesGuard } from '../../../identidade/infrastructure/security/roles.guard';
import { Roles } from '../../../identidade/infrastructure/security/roles.decorator';
import { CurrentUser } from '../../../identidade/infrastructure/security/current-user.decorator';
import { Perfil } from '../../../identidade/domain/usuario.entity';
import type { JwtPayload } from '../../../identidade/infrastructure/security/jwt.strategy';
import { GerarCobrancasMensaisUseCase } from '../../application/use-cases/gerar-cobrancas-mensais.use-case';
import { RegistrarPagamentoPresencialUseCase } from '../../application/use-cases/registrar-pagamento-presencial.use-case';
import { IniciarPagamentoOnlineUseCase } from '../../application/use-cases/iniciar-pagamento-online.use-case';
import { ConfirmarPagamentoOnlineUseCase } from '../../application/use-cases/confirmar-pagamento-online.use-case';
import { ListarHistoricoAssociadoUseCase } from '../../application/use-cases/listar-historico-associado.use-case';
import { ObterComprovanteUseCase } from '../../application/use-cases/obter-comprovante.use-case';
import { ProcessarInadimplenciaUseCase } from '../../application/use-cases/processar-inadimplencia.use-case';
import { ListarInadimplentesUseCase } from '../../application/use-cases/listar-inadimplentes.use-case';
import { ListarMinhasMensalidadesUseCase } from '../../application/use-cases/listar-minhas-mensalidades.use-case';
import { IniciarMeuPagamentoOnlineUseCase } from '../../application/use-cases/iniciar-meu-pagamento-online.use-case';
import { ConfirmarMeuPagamentoOnlineUseCase } from '../../application/use-cases/confirmar-meu-pagamento-online.use-case';
import { ObterMeuComprovanteUseCase } from '../../application/use-cases/obter-meu-comprovante.use-case';

@ApiTags('mensalidades')
@ApiBearerAuth()
@Controller('mensalidades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Perfil.ADMINISTRADOR)
export class MensalidadesController {
  constructor(
    private readonly gerarCobrancas: GerarCobrancasMensaisUseCase,
    private readonly registrarPresencial: RegistrarPagamentoPresencialUseCase,
    private readonly iniciarOnline: IniciarPagamentoOnlineUseCase,
    private readonly confirmarOnline: ConfirmarPagamentoOnlineUseCase,
    private readonly listarHistorico: ListarHistoricoAssociadoUseCase,
    private readonly obterComprovante: ObterComprovanteUseCase,
    private readonly processarInadimplencia: ProcessarInadimplenciaUseCase,
    private readonly listarInadimplentes: ListarInadimplentesUseCase,
    private readonly listarMinhas: ListarMinhasMensalidadesUseCase,
    private readonly iniciarMeuOnline: IniciarMeuPagamentoOnlineUseCase,
    private readonly confirmarMeuOnline: ConfirmarMeuPagamentoOnlineUseCase,
    private readonly obterMeuComprovante: ObterMeuComprovanteUseCase,
  ) {}

  // RF05/RF06/RF08 (lado associado, T-MOB-002) — rotas "minha(s)" sob perfil ASSOCIADO,
  // sobrescrevendo o @Roles(ADMINISTRADOR) da classe. Precisam vir antes das rotas ':id/...' de
  // admin no arquivo por clareza (mesmo padrão de /associados/me e /reservas/minhas), embora não
  // colidam de fato — o segmento literal 'minhas' distingue os dois grupos.
  @Get('minhas')
  @Roles(Perfil.ASSOCIADO)
  @ApiOperation({
    summary:
      'Lista as mensalidades (atual e histórico) do associado autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mensalidades do associado',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é associado',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum associado vinculado a este usuário',
  })
  minhasMensalidades(@CurrentUser() usuario: JwtPayload) {
    return this.listarMinhas.execute(usuario.sub);
  }

  @Post('minhas/:id/pagamento-online/iniciar')
  @Roles(Perfil.ASSOCIADO)
  @ApiOperation({
    summary:
      'Inicia o pagamento online de uma mensalidade do próprio associado',
  })
  @ApiResponse({
    status: 201,
    description: 'Cobrança iniciada, link de pagamento retornado',
  })
  @ApiResponse({ status: 400, description: 'Mensalidade já está paga' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Mensalidade não pertence a este associado',
  })
  @ApiResponse({
    status: 404,
    description:
      'Mensalidade não encontrada, ou nenhum associado vinculado ao usuário',
  })
  iniciarMeuPagamentoOnline(
    @CurrentUser() usuario: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.iniciarMeuOnline.execute(usuario.sub, id);
  }

  @Post('minhas/:id/pagamento-online/confirmar')
  @Roles(Perfil.ASSOCIADO)
  @ApiOperation({
    summary:
      'Confirma junto ao gateway o pagamento online de uma mensalidade do próprio associado',
  })
  @ApiResponse({
    status: 201,
    description: 'Pagamento confirmado, mensalidade marcada como paga',
  })
  @ApiResponse({
    status: 400,
    description:
      'Pagamento online não iniciado, ou ainda não aprovado no gateway',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Mensalidade não pertence a este associado',
  })
  @ApiResponse({
    status: 404,
    description:
      'Mensalidade não encontrada, ou nenhum associado vinculado ao usuário',
  })
  confirmarMeuPagamentoOnline(
    @CurrentUser() usuario: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.confirmarMeuOnline.execute(usuario.sub, id);
  }

  @Get('minhas/:id/comprovante')
  @Roles(Perfil.ASSOCIADO)
  @ApiOperation({
    summary: 'Obtém o comprovante de uma mensalidade paga do próprio associado',
  })
  @ApiResponse({ status: 200, description: 'Comprovante de pagamento' })
  @ApiResponse({ status: 400, description: 'Mensalidade ainda não foi paga' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Mensalidade não pertence a este associado',
  })
  @ApiResponse({
    status: 404,
    description:
      'Mensalidade não encontrada, ou nenhum associado vinculado ao usuário',
  })
  meuComprovante(
    @CurrentUser() usuario: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.obterMeuComprovante.execute(usuario.sub, id);
  }

  @Post('gerar')
  @ApiOperation({
    summary:
      'Gera as cobranças mensais do mês corrente para os associados ativos (idempotente)',
  })
  @ApiResponse({ status: 201, description: 'Mensalidades geradas' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  gerarCobrancasDoMes() {
    return this.gerarCobrancas.execute();
  }

  @Get('associado/:associadoId')
  @ApiOperation({
    summary: 'Lista o histórico de mensalidades de um associado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mensalidades do associado',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  historicoDoAssociado(
    @Param('associadoId', ParseUUIDPipe) associadoId: string,
  ) {
    return this.listarHistorico.execute(associadoId);
  }

  @Post(':id/pagamento-presencial')
  @ApiOperation({
    summary: 'Registra o pagamento presencial de uma mensalidade',
  })
  @ApiResponse({ status: 201, description: 'Mensalidade marcada como paga' })
  @ApiResponse({ status: 400, description: 'Mensalidade já está paga' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Mensalidade não encontrada' })
  lancarPagamentoPresencial(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrarPresencial.execute(id);
  }

  @Post(':id/pagamento-online/iniciar')
  @ApiOperation({
    summary:
      'Inicia o pagamento online de uma mensalidade (uso administrativo)',
  })
  @ApiResponse({
    status: 201,
    description: 'Cobrança iniciada, link de pagamento retornado',
  })
  @ApiResponse({ status: 400, description: 'Mensalidade já está paga' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Mensalidade não encontrada' })
  iniciarPagamentoOnline(@Param('id', ParseUUIDPipe) id: string) {
    return this.iniciarOnline.execute(id);
  }

  @Post(':id/pagamento-online/confirmar')
  @ApiOperation({
    summary:
      'Confirma junto ao gateway o pagamento online de uma mensalidade (uso administrativo)',
  })
  @ApiResponse({
    status: 201,
    description: 'Pagamento confirmado, mensalidade marcada como paga',
  })
  @ApiResponse({
    status: 400,
    description:
      'Pagamento online não iniciado, ou ainda não aprovado no gateway',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Mensalidade não encontrada' })
  confirmarPagamentoOnline(@Param('id', ParseUUIDPipe) id: string) {
    return this.confirmarOnline.execute(id);
  }

  @Get(':id/comprovante')
  @ApiOperation({
    summary: 'Obtém o comprovante de uma mensalidade paga (uso administrativo)',
  })
  @ApiResponse({ status: 200, description: 'Comprovante de pagamento' })
  @ApiResponse({ status: 400, description: 'Mensalidade ainda não foi paga' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Mensalidade não encontrada' })
  comprovante(@Param('id', ParseUUIDPipe) id: string) {
    return this.obterComprovante.execute(id);
  }

  @Post('processar-inadimplencia')
  @ApiOperation({
    summary:
      'Marca como inadimplentes as mensalidades pendentes vencidas há N dias e envia lembrete',
  })
  @ApiResponse({ status: 201, description: 'Mensalidades processadas' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  processarInadimplenciaDoDia() {
    return this.processarInadimplencia.execute();
  }

  @Get('inadimplentes')
  @ApiOperation({
    summary:
      'Lista o relatório de associados inadimplentes, com dias em atraso',
  })
  @ApiResponse({ status: 200, description: 'Lista de itens de inadimplência' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  relatorioInadimplencia() {
    return this.listarInadimplentes.execute();
  }
}
