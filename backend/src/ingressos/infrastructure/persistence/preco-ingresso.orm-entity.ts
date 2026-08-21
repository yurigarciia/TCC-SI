import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilComprador } from '../../domain/ingresso.entity';

@Entity('precos_ingresso')
export class PrecoIngressoOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'evento_id', type: 'uuid', nullable: true })
  eventoId: string | null;

  @Column({ type: 'varchar' })
  perfil: PerfilComprador;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  preco: string;
}
