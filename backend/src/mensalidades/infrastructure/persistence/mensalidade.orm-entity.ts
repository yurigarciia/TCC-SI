import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  FormaPagamento,
  StatusMensalidade,
} from '../../domain/mensalidade.entity';

@Entity('mensalidades')
export class MensalidadeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'associado_id', type: 'uuid' })
  associadoId: string;

  @Column({ type: 'varchar' })
  competencia: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  valor: string;

  @Column({ type: 'date' })
  vencimento: string;

  @Column({ type: 'varchar' })
  status: StatusMensalidade;

  @Column({ name: 'forma_pagamento', type: 'varchar', nullable: true })
  formaPagamento: FormaPagamento | null;

  @Column({ name: 'pago_em', type: 'timestamptz', nullable: true })
  pagoEm: Date | null;

  @Column({ name: 'pagamento_externo_id', type: 'varchar', nullable: true })
  pagamentoExternoId: string | null;

  @Column({ name: 'lembrete_enviado_em', type: 'timestamptz', nullable: true })
  lembreteEnviadoEm: Date | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
