import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('dependentes')
export class DependenteOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'associado_id', type: 'uuid' })
  associadoId: string;

  @Column()
  nome: string;

  @Column({ name: 'data_nascimento', type: 'date' })
  dataNascimento: string;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
