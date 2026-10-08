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
  Query,
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
import { PaginacaoQueryDto } from '../../../shared/pagination/paginacao-query.dto';
import { AutoCadastroAssociadoDto } from './dto/auto-cadastro-associado.dto';
import { CadastrarAssociadoMediadoDto } from './dto/cadastrar-associado-mediado.dto';
import { AtualizarAssociadoDto } from './dto/atualizar-associado.dto';
import { AprovarCadastroDto } from './dto/aprovar-cadastro.dto';
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
  @ApiOperation({
    summary:
      'Auto-cadastro público de associado (cria login e associado, entra Pendente de validação)',
  })
  @ApiResponse({
    status: 201,
    description: 'Associado criado, status pendente_validacao',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'CPF ou e-mail já cadastrado' })
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
  @ApiOperation({
    summary:
      'Vincula login a um cadastro de associado feito pela diretoria (cadastro mediado, sem usuário ainda)',
  })
  @ApiResponse({ status: 201, description: 'Conta vinculada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'CPF não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Cadastro já tem conta vinculada, ou e-mail já cadastrado',
  })
  vincularContaExistente(@Body() dto: VincularContaAssociadoDto) {
    return this.vincularConta.execute(dto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Cadastra um associado pela diretoria, com dependentes e categoria opcionais (entra Ativo)',
  })
  @ApiResponse({
    status: 201,
    description: 'Associado (e dependentes) criados',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 409, description: 'CPF já cadastrado' })
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
  @ApiOperation({
    summary: 'Consulta o cadastro de associado do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do associado vinculado ao usuário',
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
  consultarMeuCadastro(@CurrentUser() usuario: JwtPayload) {
    return this.consultarMeu.execute(usuario.sub);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary:
      'Lista os associados cadastrados, paginado, opcionalmente filtrando por nome ou CPF',
  })
  @ApiResponse({ status: 200, description: 'Página de associados' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  listarTodos(@Query() { pagina, limite, busca }: PaginacaoQueryDto) {
    return this.listar.execute(pagina!, limite!, busca);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Consulta um associado por id, com seus dependentes',
  })
  @ApiResponse({ status: 200, description: 'Associado e dependentes' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
  consultarPorId(@Param('id', ParseUUIDPipe) id: string) {
    return this.consultar.execute(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualiza dados cadastrais de um associado' })
  @ApiResponse({ status: 200, description: 'Associado atualizado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
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
  @ApiOperation({ summary: 'Adiciona um dependente a um associado existente' })
  @ApiResponse({ status: 201, description: 'Dependente criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
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
  @ApiOperation({
    summary:
      'Aprova um cadastro de associado pendente de validação (passa a Ativo)',
  })
  @ApiResponse({ status: 201, description: 'Associado aprovado, status ativo' })
  @ApiResponse({
    status: 400,
    description: 'Associado não está pendente de validação',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
  aprovarCadastro(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AprovarCadastroDto,
  ) {
    return this.aprovar.execute(id, dto.categoriaSocioId);
  }

  @Post(':id/rejeitar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Perfil.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Rejeita um cadastro de associado pendente de validação',
  })
  @ApiResponse({
    status: 201,
    description: 'Associado rejeitado, status rejeitado',
  })
  @ApiResponse({
    status: 400,
    description: 'Associado não está pendente de validação',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado não é administrador',
  })
  @ApiResponse({ status: 404, description: 'Associado não encontrado' })
  rejeitarCadastro(@Param('id', ParseUUIDPipe) id: string) {
    return this.rejeitar.execute(id);
  }
}
