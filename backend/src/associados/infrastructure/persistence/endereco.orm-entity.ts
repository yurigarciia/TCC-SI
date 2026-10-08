import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Um endereço por associado (não histórico, não múltiplos endereços) — ver RF da pendência de
// endereço em TCC-FINAL/aplicacoes/PLANEJAMENTO-GERAL.md. `associado_id` é único de propósito.
@Entity('enderecos')
export class EnderecoOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'associado_id', type: 'uuid', unique: true })
  associadoId: string;

  @Column()
  cep: string;

  @Column()
  logradouro: string;

  @Column()
  numero: string;

  @Column({ type: 'varchar', nullable: true })
  complemento: string | null;

  @Column()
  bairro: string;

  @Column()
  cidade: string;

  @Column({ type: 'varchar', length: 2 })
  uf: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm: Date;
}
