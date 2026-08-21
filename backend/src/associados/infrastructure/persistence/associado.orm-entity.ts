import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrigemCadastro, StatusAssociado } from '../../domain/associado.entity';

@Entity('associados')
export class AssociadoOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  cpf: string;

  @Column()
  contato: string;

  @Column({ name: 'vinculo_institucional', type: 'varchar', nullable: true })
  vinculoInstitucional: string | null;

  @Column({ name: 'categoria_socio_id', type: 'uuid', nullable: true })
  categoriaSocioId: string | null;

  @Column({ type: 'varchar' })
  origem: OrigemCadastro;

  @Column({ type: 'varchar' })
  status: StatusAssociado;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true, unique: true })
  usuarioId: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
