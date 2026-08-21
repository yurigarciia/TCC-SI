import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StatusEvento } from '../../domain/evento.entity';

@Entity('eventos')
export class EventoOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ type: 'timestamptz' })
  data: Date;

  @Column()
  local: string;

  @Column({ type: 'varchar', nullable: true })
  descricao: string | null;

  @Column({ name: 'salao_id', type: 'uuid', nullable: true })
  salaoId: string | null;

  @Column({ type: 'varchar' })
  status: StatusEvento;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
