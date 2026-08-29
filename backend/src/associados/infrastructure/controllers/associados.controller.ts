import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { AutoCadastrarAssociadoUseCase } from '../../application/use-cases/auto-cadastrar-associado.use-case';
import { CadastrarAssociadoMediadoUseCase } from '../../application/use-cases/cadastrar-associado-mediado.use-case';
import { ListarAssociadosUseCase } from '../../application/use-cases/listar-associados.use-case';
import { ConsultarAssociadoUseCase } from '../../application/use-cases/consultar-associado.use-case';
import { ConsultarMeuAssociadoUseCase } from '../../application/use-cases/consultar-meu-associado.use-case';
import { AtualizarAssociadoUseCase } from '../../application/use-cases/atualizar-associado.use-case';
import { AdicionarDependenteUseCase } from '../../application/use-cases/adicionar-dependente.use-case';
import { AprovarCadastroPendenteUseCase } from '../../application/use-cases/aprovar-cadastro-pendente.use-case';
import { RejeitarCadastroPendenteUseCase } from '../../application/use-cases/rejeitar-cadastro-pendente.use-case';
import { VincularContaAssociadoUseCase } from '../../application/use-cases/vincular-conta-associado.use-case';
import { AutoCadastroAssociadoDto } from './dto/auto-cadastro-associado.dto';
import { CadastrarAssociadoMediadoDto } from './dto/cadastrar-associado-mediado.dto';
import { AtualizarAssociadoDto } from './dto/atualizar-associado.dto';
import { DependenteDto } from './dto/dependente.dto';
import { VincularContaAssociadoDto } from './dto/vincular-conta-associado.dto';

@ApiTags('associados')
@Controller('associados')
export class AssociadosController {
  constructor(
    private readonly autoCadastrar: AutoCadastrarAssociadoUseCase,
    private readonly cadastrarMediado: CadastrarAssociadoMediadoUseCase,
    private readonly listar: ListarAssociadosUseCase,
    private readonly consultar: ConsultarAssociadoUseCase,
    private readonly consultarMeu: ConsultarMeuAssociadoUseCase,
    private readonly atualizar: AtualizarAssociadoUseCase,
    private readonly adicionarDependente: AdicionarDependenteUseCase,
    private readonly aprovar: AprovarCadastroPendenteUseCase,
    private readonly rejeitar: RejeitarCadastroPendenteUseCase,
    private readonly vincularConta: VincularContaAssociadoUseCase,
  ) {}

  @Post('auto-cadastro')
  @HttpCode(HttpStatus.CREATED)
  autoCadastro(@Body() dto: AutoCadastroAssociadoDto) {
    return this.autoCadastrar.execute({
      nome: dto.nome,
      cpf: dto.cpf,
      contato: dto.contato,
      vinculoInstitucional: dto.vinculoInstitucional ?? null,
      email: dto.email,
      senha: dto.senha,
    });
  }

  // RF01 (canal associado) — "reivindicar" a conta de um cadastro já feito pela diretoria
  // (cadastro mediado nunca tem usuarioId). Rota pública, como auto-cadastro: quem ainda não tem
  // conta não tem token para autenticar a chamada.
  @Post('vincular-conta')
  @HttpCode(HttpStatus.CREATED)
  vincularContaExistente(@Body() dto: VincularContaAssociadoDto) {
    return this.vincularConta.execute(dto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  cadastrarPelaDireto(@Body() dto: CadastrarAssociadoMediadoDto) {
    return this.cadastrarMediado.execute({
      nome: dto.nome,
      cpf: dto.cpf,
      contato: dto.contato,
      vinculoInstitucional: dto.vinculoInstitucional ?? null,
      categoriaSocioId: dto.categoriaSocioId ?? null,
      dependentes: dto.dependentes ?? [],
    });
  }

  // RF13/RF02 (lado associado) — precisa vir antes de ":id" para não ser capturado como um uuid.
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ASSOCIADO)
  consultarMeuCadastro(@CurrentUser() usuario: JwtPayload) {
    return this.consultarMeu.execute(usuario.sub);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  listarTodos() {
    return this.listar.execute();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  consultarPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultar.execute(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  atualizarDados(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarAssociadoDto,
  ) {
    return this.atualizar.execute(id, dto);
  }

  @Post(':id/dependentes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  adicionarDependenteAoAssociado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DependenteDto,
  ) {
    return this.adicionarDependente.execute(id, dto);
  }

  @Post(':id/aprovar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  aprovarCadastro(@Param('id', ParseUUIDPipe) id: string) {
    return this.aprovar.execute(id);
  }

  @Post(':id/rejeitar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  rejeitarCadastro(@Param('id', ParseUUIDPipe) id: string) {
    return this.rejeitar.execute(id);
  }
}
