import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  minhasMensalidades(@CurrentUser() usuario: JwtPayload) {
    return this.listarMinhas.execute(usuario.sub);
  }

  @Post('minhas/:id/pagamento-online/iniciar')
  @Roles(Perfil.ASSOCIADO)
  iniciarMeuPagamentoOnline(
    @CurrentUser() usuario: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.iniciarMeuOnline.execute(usuario.sub, id);
  }

  @Post('minhas/:id/pagamento-online/confirmar')
  @Roles(Perfil.ASSOCIADO)
  confirmarMeuPagamentoOnline(
    @CurrentUser() usuario: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.confirmarMeuOnline.execute(usuario.sub, id);
  }

  @Get('minhas/:id/comprovante')
  @Roles(Perfil.ASSOCIADO)
  meuComprovante(
    @CurrentUser() usuario: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.obterMeuComprovante.execute(usuario.sub, id);
  }

  @Post('gerar')
  gerarCobrancasDoMes() {
    return this.gerarCobrancas.execute();
  }

  @Get('associado/:associadoId')
  historicoDoAssociado(
    @Param('associadoId', ParseUUIDPipe) associadoId: string,
  ) {
    return this.listarHistorico.execute(associadoId);
  }

  @Post(':id/pagamento-presencial')
  lancarPagamentoPresencial(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrarPresencial.execute(id);
  }

  @Post(':id/pagamento-online/iniciar')
  iniciarPagamentoOnline(@Param('id', ParseUUIDPipe) id: string) {
    return this.iniciarOnline.execute(id);
  }

  @Post(':id/pagamento-online/confirmar')
  confirmarPagamentoOnline(@Param('id', ParseUUIDPipe) id: string) {
    return this.confirmarOnline.execute(id);
  }

  @Get(':id/comprovante')
  comprovante(@Param('id', ParseUUIDPipe) id: string) {
    return this.obterComprovante.execute(id);
  }

  @Post('processar-inadimplencia')
  processarInadimplenciaDoDia() {
    return this.processarInadimplencia.execute();
  }

  @Get('inadimplentes')
  relatorioInadimplencia() {
    return this.listarInadimplentes.execute();
  }
}
