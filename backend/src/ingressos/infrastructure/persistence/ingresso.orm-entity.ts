import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  CanalIngresso,
  FormaPagamentoIngresso,
  PerfilComprador,
  StatusIngresso,
} from '../../domain/ingresso.entity';

@Entity('ingressos')
export class IngressoOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'evento_id', type: 'uuid' })
  eventoId: string;

  @Column({ name: 'nome_comprador' })
  nomeComprador: string;

  @Column({ name: 'perfil_comprador', type: 'varchar' })
  perfilComprador: PerfilComprador;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  preco: string;

  @Column({ type: 'varchar' })
  canal: CanalIngresso;

  @Column({ name: 'forma_pagamento', type: 'varchar' })
  formaPagamento: FormaPagamentoIngresso;

  @Column({ name: 'pagamento_externo_id', type: 'varchar', nullable: true })
  pagamentoExternoId: string | null;

  @Column({ type: 'varchar' })
  status: StatusIngresso;

  @Column({ name: 'usado_em', type: 'timestamptz', nullable: true })
  usadoEm: Date | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
