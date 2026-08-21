import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Perfil } from '../../domain/usuario.entity';

@Entity('usuarios')
export class UsuarioOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'senha_hash' })
  senhaHash: string;

  @Column({ type: 'varchar' })
  perfil: Perfil;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
