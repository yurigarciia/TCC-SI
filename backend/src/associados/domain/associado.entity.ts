export enum OrigemCadastro {
  AUTO_CADASTRO = 'auto_cadastro',
  MEDIADO = 'mediado',
}

// Só cobre os status já mapeados em cadastro-associado.json. RF03 (ativo/inativo/suspenso
// completo) ainda não tem fluxo desenhado — ver Open Questions em
// TCC-FINAL/aplicacoes/PLANEJAMENTO-GERAL.md.
export enum StatusAssociado {
  PENDENTE_VALIDACAO = 'pendente_validacao',
  ATIVO = 'ativo',
  REJEITADO = 'rejeitado',
}

export class Associado {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly cpf: string,
    public readonly contato: string,
    public readonly vinculoInstitucional: string | null,
    public readonly categoriaSocioId: string | null,
    public readonly origem: OrigemCadastro,
    public readonly status: StatusAssociado,
    public readonly usuarioId: string | null,
    public readonly criadoEm: Date,
    public readonly atualizadoEm: Date,
  ) {}
}
