import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('categorias_socio')
export class CategoriaSocioOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string;

  @Column({
    name: 'valor_mensalidade',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  valorMensalidade: string;

  @Column({ default: true })
  ativa: boolean;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
