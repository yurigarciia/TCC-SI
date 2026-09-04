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

  // Preenchido só quando perfil = 'socio' — cada categoria de sócio tem seu próprio preço.
  @Column({ name: 'categoria_socio_id', type: 'uuid', nullable: true })
  categoriaSocioId: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  preco: string;
}
