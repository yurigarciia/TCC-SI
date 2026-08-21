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
import { Perfil } from '../../../identidade/domain/usuario.entity';
import { GerarCobrancasMensaisUseCase } from '../../application/use-cases/gerar-cobrancas-mensais.use-case';
import { RegistrarPagamentoPresencialUseCase } from '../../application/use-cases/registrar-pagamento-presencial.use-case';
import { IniciarPagamentoOnlineUseCase } from '../../application/use-cases/iniciar-pagamento-online.use-case';
import { ConfirmarPagamentoOnlineUseCase } from '../../application/use-cases/confirmar-pagamento-online.use-case';
import { ListarHistoricoAssociadoUseCase } from '../../application/use-cases/listar-historico-associado.use-case';
import { ObterComprovanteUseCase } from '../../application/use-cases/obter-comprovante.use-case';
import { ProcessarInadimplenciaUseCase } from '../../application/use-cases/processar-inadimplencia.use-case';
import { ListarInadimplentesUseCase } from '../../application/use-cases/listar-inadimplentes.use-case';

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
  ) {}

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
