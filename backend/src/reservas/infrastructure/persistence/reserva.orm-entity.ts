import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  CanalReserva,
  FormaPagamentoReserva,
  StatusReserva,
} from '../../domain/reserva.entity';

@Entity('reservas')
export class ReservaOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'evento_id', type: 'uuid' })
  eventoId: string;

  @Column({ name: 'mesa_id', type: 'uuid' })
  mesaId: string;

  @Column({ type: 'varchar' })
  canal: CanalReserva;

  @Column({ name: 'forma_pagamento', type: 'varchar' })
  formaPagamento: FormaPagamentoReserva;

  @Column({ type: 'varchar' })
  status: StatusReserva;

  @Column({ name: 'pagamento_externo_id', type: 'varchar', nullable: true })
  pagamentoExternoId: string | null;

  @Column({ name: 'nome_titular', type: 'varchar', nullable: true })
  nomeTitular: string | null;

  @Column({ name: 'associado_id', type: 'uuid', nullable: true })
  associadoId: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
